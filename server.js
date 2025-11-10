require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-.env';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// Paths
const ROOT_DIR = __dirname;
const NEW_BASE_DIR = path.join(ROOT_DIR, 'New folder');
const DATA_DIR = path.join(ROOT_DIR, 'data'); // legacy path (unused with product-data.js storage)
const UPLOADS_DIR = path.join(NEW_BASE_DIR, 'uploads');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const PRODUCTS_JSON = path.join(ROOT_DIR, 'data', 'products.json');

if (!fs.existsSync(NEW_BASE_DIR)) fs.mkdirSync(NEW_BASE_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(path.join(UPLOADS_DIR, 'products'))) fs.mkdirSync(path.join(UPLOADS_DIR, 'products'), { recursive: true });

// Security & parsing - tightened Helmet config for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false // Allow external resources
}));
app.use(express.json({ limit: '2mb' }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT_DIR, 'views'));

// Static serving with cache-busting for images
const staticOptions = {
  setHeaders: (res, filePath) => {
    // Add cache-busting headers for images
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      res.set('ETag', `${Date.now()}-${filePath}`);
    } else {
      // Other static files get shorter cache
      res.set('Cache-Control', 'public, max-age=300');
    }
  }
};

// Expose Pictures directory for public access
app.use('/Pictures', express.static(path.join(ROOT_DIR, 'Pictures'), staticOptions));
app.use('/uploads', express.static(UPLOADS_DIR, staticOptions));
app.use('/admin', express.static(ADMIN_DIR));

// Simple password check (supports either plaintext or bcrypt hash in env)
function verifyPassword(input, expected) {
  // If expected looks like a bcrypt hash, compare with bcrypt
  const looksHashed = typeof expected === 'string' && expected.startsWith('$2');
  if (looksHashed) {
    try { return bcrypt.compareSync(input, expected); } catch (_) { return false; }
  }
  return input === expected;
}

// Ensure an image path is stored under Pictures/<subfolder>/ and return normalized 'Pictures/...'
function ensureImageInPictures(imageUrl, subfolder = 'Iphones') {
  try {
    if (!imageUrl) return '';
    // Normalize leading slash
    if (imageUrl.startsWith('/')) imageUrl = imageUrl.slice(1);
    // Already in Pictures
    if (imageUrl.startsWith('Pictures/')) return imageUrl;
    const srcAbs = path.join(ROOT_DIR, imageUrl);
    // Determine destination
    const folderSafe = sanitizeFolder(subfolder) || 'Iphones';
    const destDir = path.join(ROOT_DIR, 'Pictures', folderSafe);
    try { fs.mkdirSync(destDir, { recursive: true }); } catch (_) {}
    const base = path.basename(imageUrl) || `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const destAbs = path.join(destDir, base);
    // If source exists, move/copy; if not, just return target path to standardize future refs
    if (fs.existsSync(srcAbs)) {
      try {
        fs.renameSync(srcAbs, destAbs);
      } catch {
        try { fs.copyFileSync(srcAbs, destAbs); fs.unlinkSync(srcAbs); } catch (_) {}
      }
    }
    return `Pictures/${folderSafe}/${path.basename(destAbs)}`;
  } catch {
    return imageUrl;
  }
}

// Auth middleware
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Data helpers that use product-data.js as the single source of truth
const ROOT_PRODUCT_DATA = path.join(ROOT_DIR, 'product-data.js');
const vm = require('vm');

function readProductMapFromJs() {
  if (!fs.existsSync(ROOT_PRODUCT_DATA)) return {};
  const text = fs.readFileSync(ROOT_PRODUCT_DATA, 'utf8');
  const m = text.match(/\b(PRODUCT_DATA)\s*=\s*\{[\s\S]*?\n\};/);
  if (!m) return {};
  const assign = m[0];
  const code = `${assign}\nmodule.exports = PRODUCT_DATA;`;
  const sandbox = { module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 200 });
  return sandbox.module.exports || {};
}

function writeProductMapToJs(map) {
  const text = fs.readFileSync(ROOT_PRODUCT_DATA, 'utf8');
  const m = text.match(/\b(PRODUCT_DATA)\s*=\s*\{[\s\S]*?\n\};/);
  if (!m) throw new Error('PRODUCT_DATA object not found in product-data.js');
  const start = m.index;
  const end = start + m[0].length;
  const before = text.slice(0, start);
  const after = text.slice(end);
  const mapEntries = Object.entries(map)
    .map(([name, p]) => {
      const lines = [
        `    '${name}': {`,
        `        image: '${p.image || ''}',`,
        `        price: '${p.price || ''}',`,
        `        availability: '${p.availability || 'In Stock'}',`,
        p.batteryHealth !== undefined ? `        batteryHealth: '${p.batteryHealth}',` : null,
        p.faceId !== undefined ? `        faceId: '${p.faceId}',` : null,
        p.trueTone !== undefined ? `        trueTone: '${p.trueTone}',` : null,
        p.batteryReplaced !== undefined ? `        batteryReplaced: '${p.batteryReplaced}',` : null,
        `        condition: '${p.condition || ''}'`,
        `    }`,
      ].filter(Boolean).join('\n');
      return lines;
    })
    .join(',\n');
  const replacement = `let PRODUCT_DATA = {\n${mapEntries}\n};`;
  const newText = before + replacement + after;
  fs.writeFileSync(ROOT_PRODUCT_DATA, newText);
}

// ---------- JSON storage for products (authoritative) ----------
function readProductsJson() {
  try {
    if (!fs.existsSync(PRODUCTS_JSON)) return [];
    const text = fs.readFileSync(PRODUCTS_JSON, 'utf8');
    const arr = JSON.parse(text || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeProductsJson(list) {
  try {
    fs.mkdirSync(path.dirname(PRODUCTS_JSON), { recursive: true });
    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(list || [], null, 2));
  } catch (_) {}
}

function ensureProductsSeededFromJs() {
  try {
    const existing = readProductsJson();
    if (existing && existing.length > 0) return;
    const map = readProductMapFromJs();
    const seeded = Object.entries(map).map(([name, p]) => ({
      id: toId(name),
      name,
      description: p.condition || '',
      price: Number(String(p.price || '').replace(/[^0-9.]/g, '')) || 0,
      currency: 'MWK',
      availability: p.availability || 'In Stock',
      image: p.image || '',
      details: {
        batteryHealth: p.batteryHealth,
        faceId: p.faceId,
        trueTone: p.trueTone,
        batteryReplaced: p.batteryReplaced,
        condition: p.condition,
        generation: p.generation
      }
    }));
    if (seeded.length > 0) writeProductsJson(seeded);
  } catch (_) {}
}

function toId(name) { return Buffer.from(name, 'utf8').toString('base64url'); }
function fromId(id) { return Buffer.from(id, 'base64url').toString('utf8'); }
function formatMWK(n) { try { return `MWK ${new Intl.NumberFormat('en-US').format(Number(n))}`; } catch { return `MWK ${n}`; } }

function readProducts() {
  ensureProductsSeededFromJs();
  return readProductsJson();
}

// Multer setup for image uploads with optional Pictures/<folder>/ target
function sanitizeFolder(name) {
  // Keep original casing to match existing folders; remove unsafe chars
  return String(name || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

// Shared image validation
const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
function imageFileFilter(_req, file, cb) {
  const okMime = /^image\/(jpeg|png|webp|gif|bmp|svg\+xml)$/i.test(file.mimetype || '');
  const okExt = /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(path.extname(file.originalname || ''));
  if (okMime || okExt) return cb(null, true);
  cb(new Error('Only image files are allowed'));
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Multer parses text fields into req.body when using .single()
    const folder = sanitizeFolder(req.body.folder);
    if (folder) {
      const picturesDir = path.join(ROOT_DIR, 'Pictures', folder);
      try { fs.mkdirSync(picturesDir, { recursive: true }); } catch (_) {}
      return cb(null, picturesDir);
    }
    // Default to Pictures/Iphones if no folder provided
    const defaultDir = path.join(ROOT_DIR, 'Pictures', 'Iphones');
    try { fs.mkdirSync(defaultDir, { recursive: true }); } catch (_) {}
    cb(null, defaultDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: IMAGE_MAX_BYTES } });

// Product image upload storage (timestamp + original filename)
const productImageStorage = multer.diskStorage({
  destination: function (req, _file, cb) {
    const folder = sanitizeFolder(req.body.folder) || 'Iphones';
    const picturesDir = path.join(ROOT_DIR, 'Pictures', folder);
    try { fs.mkdirSync(picturesDir, { recursive: true }); } catch (_) {}
    cb(null, picturesDir);
  },
  filename: function (_req, file, cb) {
    const safeOriginal = path.basename(file.originalname || '').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  }
});
const productImageUpload = multer({ storage: productImageStorage, fileFilter: imageFileFilter, limits: { fileSize: IMAGE_MAX_BYTES } });

// Reviews data helpers using data/review-data.js as the single source of truth
const REVIEW_DATA_JS = path.join(ROOT_DIR, 'data', 'review-data.js');
function readReviews() {
  if (!fs.existsSync(REVIEW_DATA_JS)) return [];
  const text = fs.readFileSync(REVIEW_DATA_JS, 'utf8');
  // Expect the file to export array via module.exports = ... or similar pattern
  const code = `${text}\nmodule.exports = (typeof module !== 'undefined' && module.exports) || REVIEWS || [];`;
  const sandbox = { module: { exports: [] } };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 200 });
  const arr = Array.isArray(sandbox.module.exports) ? sandbox.module.exports : [];
  // Normalize: ensure each review has id
  return arr.map(r => ({
    id: r.id || uuidv4(),
    name: r.name || '',
    photo: r.photo || '',
    review: r.review || '',
    rating: r.rating || '★★★★★',
    date: r.date || '',
    createdAt: r.createdAt || new Date().toISOString()
  }));
}

function writeReviews(list) {
  const safe = (list || []).map(r => ({
    id: r.id || uuidv4(),
    name: String(r.name || ''),
    photo: String(r.photo || ''),
    review: String(r.review || ''),
    rating: String(r.rating || '★★★★★'),
    date: String(r.date || ''),
    createdAt: String(r.createdAt || new Date().toISOString())
  }));
  const body = `// Review data store (simple array).\n// Shape: { id: string, name: string, photo: string, review: string, rating: string, date: string, createdAt?: string }\n\nlet REVIEWS = ${JSON.stringify(safe, null, 2)};\n\nmodule.exports = REVIEWS;\n`;
  fs.mkdirSync(path.dirname(REVIEW_DATA_JS), { recursive: true });
  fs.writeFileSync(REVIEW_DATA_JS, body);
}

// Seed reviews from CUSTOMER_DATA in product-data.js if none present
const PRODUCT_DATA_JS_PATH = path.join(ROOT_DIR, 'product-data.js');
function readCustomerDataFromJs() {
  if (!fs.existsSync(PRODUCT_DATA_JS_PATH)) return [];
  try {
    const text = fs.readFileSync(PRODUCT_DATA_JS_PATH, 'utf8');
    const m = text.match(/const\s+CUSTOMER_DATA\s*=\s*\[([\s\S]*?)\];/);
    if (!m) return [];
    const assign = `const CUSTOMER_DATA = [${m[1]}];\nmodule.exports = CUSTOMER_DATA;`;
    const sandbox = { module: { exports: [] } };
    vm.createContext(sandbox);
    vm.runInContext(assign, sandbox, { timeout: 200 });
    const arr = sandbox.module.exports || [];
    return Array.isArray(arr) ? arr.map(r => ({
      name: r.name || '',
      photo: r.photo || '',
      review: r.review || '',
      rating: r.rating || '★★★★★',
      date: r.date || ''
    })) : [];
  } catch (_) { return []; }
}

function ensureReviewsSeeded() {
  try {
    const existing = readReviews();
    if (existing && existing.length > 0) return;
    const seed = readCustomerDataFromJs();
    if (seed.length > 0) {
      const seeded = seed.map(r => ({ id: uuidv4(), ...r }));
      writeReviews(seeded);
    }
  } catch (_) {}
}

// Routes
// Redirect static HTML files to EJS routes for consistency
app.get('/index.html', (_req, res) => { res.redirect(301, '/'); });
app.get('/reviews.html', (_req, res) => { res.redirect(301, '/reviews'); });
app.get('/contact.html', (_req, res) => { res.redirect(301, '/contact'); });

// Customer pages (EJS), placed before any catch-all static
app.get('/', (_req, res) => { res.render('index'); });
app.get('/reviews', (_req, res) => { res.render('reviews'); });
app.get('/contact', (_req, res) => { res.render('contact'); });

// CORS: localhost only for now
app.use(cors({ origin: [/^http:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/], credentials: true }));

// Root static after EJS routes to let views handle main pages
// Exclude HTML files from static serving since we redirect them
app.use('/', express.static(ROOT_DIR, {
  setHeaders: (res, filePath) => {
    // Add cache-busting headers for images
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      res.set('ETag', `${Date.now()}-${filePath}`);
    } else if (/\.(js|css)$/i.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=300');
    }
  }
}));
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username !== ADMIN_USER || !verifyPassword(password, ADMIN_PASS)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: username, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.set('Cache-Control', 'no-store');
  res.json(products);
});

// Reviews routes
app.get('/api/reviews', (req, res) => {
  try {
    const reviews = readReviews();
    res.set('Cache-Control', 'no-store');
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

app.post('/api/reviews', authRequired, (req, res) => {
  const { name, photo = '', review, rating = '★★★★★' } = req.body || {};
  if (!name || !review) return res.status(400).json({ error: 'Missing required fields: name, review' });
  const list = readReviews();
  const normalizedPhoto = ensureImageInPictures(photo, 'Customer Reviews');
  const item = { id: uuidv4(), name, photo: normalizedPhoto, review, rating, date: '', createdAt: new Date().toISOString() };
  list.push(item);
  try {
    writeReviews(list);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save review' });
  }
  res.status(201).json(item);
});

app.delete('/api/reviews/:id', authRequired, (req, res) => {
  const id = req.params.id;
  const list = readReviews();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = list.splice(idx, 1)[0];
  try {
    writeReviews(list);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to delete review' });
  }
  res.json({ ok: true, removed: { id: removed.id } });
});

app.post('/api/products', authRequired, (req, res) => {
  const { name, description = '', price, currency = 'MWK', availability = 'In Stock', image = '', details = {} } = req.body || {};
  if (!name || price === undefined) return res.status(400).json({ error: 'Missing required fields: name, price' });
  const list = readProductsJson();
  const normalizedImage = ensureImageInPictures(image, 'products');
  const item = {
    id: toId(name),
    name,
    description,
    price: typeof price === 'number' ? price : Number(String(price).replace(/[^0-9.]/g, '')) || 0,
    currency,
    availability,
    image: normalizedImage,
    details: {
      batteryHealth: details.batteryHealth,
      faceId: details.faceId,
      trueTone: details.trueTone,
      batteryReplaced: details.batteryReplaced,
      condition: details.condition || description,
      generation: details.generation
    }
  };
  // Upsert by name
  const idx = list.findIndex(p => p.name === name);
  if (idx >= 0) list[idx] = item; else list.push(item);
  try { writeProductsJson(list); } catch (e) { return res.status(500).json({ error: 'Failed to save product' }); }
  res.status(201).json(item);
});

app.put('/api/products/:id', authRequired, (req, res) => {
  const id = req.params.id;
  const currentName = fromId(id);
  const list = readProductsJson();
  const idx = list.findIndex(p => p.name === currentName);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const update = req.body || {};
  const newName = update.name && update.name.trim() ? update.name.trim() : currentName;
  const existing = list[idx];
  const normalizedImage = update.image !== undefined ? ensureImageInPictures(update.image, 'products') : existing.image;
  const updated = {
    ...existing,
    id: toId(newName),
    name: newName,
    description: update.description !== undefined ? update.description : existing.description,
    price: update.price !== undefined ? (typeof update.price === 'number' ? update.price : Number(String(update.price).replace(/[^0-9.]/g, '')) || 0) : existing.price,
    currency: update.currency !== undefined ? update.currency : existing.currency,
    availability: update.availability !== undefined ? update.availability : existing.availability,
    image: normalizedImage,
    details: {
      ...(existing.details || {}),
      ...(update.details || {})
    }
  };
  // If name changed and conflicts, replace; else assign
  if (newName !== currentName) {
    list.splice(idx, 1);
    const otherIdx = list.findIndex(p => p.name === newName);
    if (otherIdx >= 0) list[otherIdx] = updated; else list.push(updated);
  } else {
    list[idx] = updated;
  }
  try { writeProductsJson(list); } catch (e) { return res.status(500).json({ error: 'Failed to save product' }); }
  res.json(updated);
});

app.delete('/api/products/:id', authRequired, (req, res) => {
  const id = req.params.id;
  const name = fromId(id);
  const list = readProductsJson();
  const idx = list.findIndex(p => p.name === name);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = list.splice(idx, 1)[0];
  try { writeProductsJson(list); } catch (e) { return res.status(500).json({ error: 'Failed to delete product' }); }
  res.json({ ok: true, removed: { id: removed.id, name: removed.name } });
});

// New product image upload route - saves to Pictures/<folder|Iphones>/ with timestamp + original filename
app.post('/api/products/upload-product', authRequired, productImageUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const folder = sanitizeFolder(req.body.folder) || 'Iphones';
  const url = `Pictures/${folder}/${req.file.filename}`;
  res.status(201).json({ url });
});

app.post('/api/uploads', authRequired, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const folder = sanitizeFolder(req.body.folder);
  let url;
  if (folder) {
    // Served from project root; keep relative path without leading slash
    url = `Pictures/${folder}/${req.file.filename}`;
  } else {
    // Default persistent location
    url = `Pictures/Iphones/${req.file.filename}`;
  }
  res.status(201).json({ url });
});

// Dedicated upload route for review photos -> Pictures/Customer Reviews
const reviewsStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const dir = path.join(ROOT_DIR, 'Pictures', 'Customer Reviews');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const uploadReviewPhoto = multer({ storage: reviewsStorage, fileFilter: imageFileFilter, limits: { fileSize: IMAGE_MAX_BYTES } });

// New: cleaner reviews upload route (JWT required)
app.post('/api/reviews/upload-photo', authRequired, uploadReviewPhoto.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `Pictures/Customer Reviews/${req.file.filename}`;
  res.status(201).json({ url });
});

// Removed duplicate reviews upload route ('/api/uploads/reviews') in favor of '/api/reviews/upload-photo'

app.get('/api/health', (_req, res) => res.json({ ok: true }));

ensureReviewsSeeded();
ensureProductsSeededFromJs();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
