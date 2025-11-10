(function(){
  const tokenKey = 'fe_admin_token';
  const loginForm = document.getElementById('loginForm');
  const productForm = document.getElementById('productForm');
  const logoutBtn = document.getElementById('logoutBtn');

  function getToken(){ return localStorage.getItem(tokenKey); }
  function setToken(t){ localStorage.setItem(tokenKey, t); }
  function clearToken(){ localStorage.removeItem(tokenKey); }

  function authHeaders(){ const t=getToken(); return t? { 'Authorization': 'Bearer '+t } : {}; }

  async function api(path, opts={}){
    const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers||{}), ...authHeaders() } });
    if (!res.ok) throw new Error((await res.json().catch(()=>({error:res.statusText}))).error || 'Request failed');
    return res.json();
  }
  async function apiMultipart(path, formData){
    const res = await fetch(path, { method:'POST', headers: { ...authHeaders() }, body: formData });
    if (!res.ok) throw new Error((await res.json().catch(()=>({error:res.statusText}))).error || 'Request failed');
    return res.json();
  }

  function normalizeImageUrl(url){
    if (!url) return '';
    // Absolute URLs or already rooted
    if (/^https?:\/\//i.test(url) || url.startsWith('/')) return url;
    // Make it absolute from site root so it works under /admin/
    return '/' + url.replace(/^\/+/, '');
  }

  // Login page
  if (loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const err = document.getElementById('loginError');
      err.textContent = '';
      try{
        const { token } = await api('/api/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
        setToken(token);
        location.href = '/admin/dashboard.html';
      }catch(ex){ err.textContent = ex.message; }
    });
    return;
  }

  // Dashboard page
  if (logoutBtn){
    logoutBtn.addEventListener('click', ()=>{ clearToken(); location.href='/admin/login.html'; });
  }

  // Product type controls
  const productTypeSelect = document.getElementById('productType');
  const detailsIphones = document.getElementById('details-iphones');
  const detailsAccessories = document.getElementById('details-accessories');
  const detailsCharger = document.getElementById('details-charger');
  const detailsAirpods = document.getElementById('details-airpods');
  const chargerPinType = document.getElementById('chargerPinType');
  const nameInput = document.getElementById('name');
  const accessoryKind = document.getElementById('accessoryKind');
  const priceInput = document.getElementById('price');
  const availabilityInput = document.getElementById('availability');
  const batteryHealthInput = document.getElementById('batteryHealth');
  const faceIdInput = document.getElementById('faceId');
  const trueToneInput = document.getElementById('trueTone');
  const batteryReplacedInput = document.getElementById('batteryReplaced');
  const conditionInput = document.getElementById('condition');
  const accessoryConditionInput = document.getElementById('accessoryCondition');
  const airpodsGenerationInput = document.getElementById('airpodsGeneration');
  const airpodsConditionInput = document.getElementById('airpodsCondition');
  const chargerWattageInput = document.getElementById('chargerWattage');
  const imageInput = document.getElementById('image');

  // Preview elements
  const pricePreview = document.getElementById('pricePreview');
  const previewCard = document.getElementById('productPreview');
  const previewImage = document.getElementById('previewImage');
  const previewName = document.getElementById('previewName');
  const previewPrice = document.getElementById('previewPrice');
  const previewAvailability = document.getElementById('previewAvailability');
  const previewGenerationItem = document.getElementById('previewGenerationItem');
  const previewGeneration = document.getElementById('previewGeneration');
  const previewBatteryHealthItem = document.getElementById('previewBatteryHealthItem');
  const previewFaceIdItem = document.getElementById('previewFaceIdItem');
  const previewTrueToneItem = document.getElementById('previewTrueToneItem');
  const previewBatteryReplacedItem = document.getElementById('previewBatteryReplacedItem');
  const previewConditionItem = document.getElementById('previewConditionItem');
  const previewBatteryHealth = document.getElementById('previewBatteryHealth');
  const previewFaceId = document.getElementById('previewFaceId');
  const previewTrueTone = document.getElementById('previewTrueTone');
  const previewBatteryReplaced = document.getElementById('previewBatteryReplaced');
  const previewCondition = document.getElementById('previewCondition');

  function formatMWKLocal(n){
    try{ const num = Number(String(n||'').replace(/[^0-9.]/g,'')); if (!isFinite(num)) return 'MWK 0'; return 'MWK ' + new Intl.NumberFormat('en-US').format(num); }catch{ return 'MWK 0'; }
  }

  function updatePreview(){
    if (!previewCard) return;
    const t = (productTypeSelect && productTypeSelect.value) || 'Iphones';
    let nameVal = (nameInput && nameInput.value) || '';
    if (t === 'Accessories' && accessoryKind){ nameVal = accessoryKind.value || 'Accessories'; }
    if (t === 'Three Pin Charger' || t === 'Two Pin Charger'){ nameVal = t; }
    const priceVal = (priceInput && priceInput.value) || '';
    const availVal = (availabilityInput && availabilityInput.value) || '';
    const condVal = (conditionInput && conditionInput.value) || (accessoryConditionInput && accessoryConditionInput.value) || '';
    if (previewName) previewName.textContent = nameVal || 'Product name';
    const priceStr = formatMWKLocal(priceVal);
    if (previewPrice) previewPrice.textContent = priceStr;
    if (pricePreview) pricePreview.textContent = priceStr;
    if (previewAvailability) previewAvailability.textContent = availVal;

    const isPhone = (t === 'Iphones');
    const isAirpods = (t === 'Airpods');
    if (previewBatteryHealthItem) previewBatteryHealthItem.style.display = isPhone ? 'flex' : 'none';
    if (previewFaceIdItem) previewFaceIdItem.style.display = isPhone ? 'flex' : 'none';
    if (previewTrueToneItem) previewTrueToneItem.style.display = isPhone ? 'flex' : 'none';
    if (previewBatteryReplacedItem) previewBatteryReplacedItem.style.display = isPhone ? 'flex' : 'none';
    if (previewConditionItem) previewConditionItem.style.display = (isPhone || isAirpods || !!condVal) ? 'flex' : 'none';
    if (previewGenerationItem) previewGenerationItem.style.display = isAirpods ? 'flex' : 'none';

    if (previewBatteryHealth && batteryHealthInput) previewBatteryHealth.textContent = batteryHealthInput.value || '';
    if (previewFaceId && faceIdInput) previewFaceId.textContent = faceIdInput.value || '';
    if (previewTrueTone && trueToneInput) previewTrueTone.textContent = trueToneInput.value || '';
    if (previewBatteryReplaced && batteryReplacedInput) previewBatteryReplaced.textContent = batteryReplacedInput.value || '';
    if (previewCondition) previewCondition.textContent = isAirpods ? ((airpodsConditionInput && airpodsConditionInput.value) || '') : (condVal || '');
    if (previewGeneration) previewGeneration.textContent = (airpodsGenerationInput && airpodsGenerationInput.value) || '';
  }

  // Bind preview updates
  [nameInput, priceInput, availabilityInput, batteryHealthInput, faceIdInput, trueToneInput, batteryReplacedInput, conditionInput, accessoryConditionInput, airpodsGenerationInput, airpodsConditionInput, chargerWattageInput]
    .filter(Boolean)
    .forEach(el=> el.addEventListener('input', updatePreview));
  if (productTypeSelect) productTypeSelect.addEventListener('change', updatePreview);
  if (accessoryKind) accessoryKind.addEventListener('change', updatePreview);
  if (airpodsGenerationInput) airpodsGenerationInput.addEventListener('change', ()=>{
    if (productTypeSelect && productTypeSelect.value === 'Airpods' && nameInput){
      nameInput.value = airpodsGenerationInput.value || 'AirPods';
    }
    updatePreview();
  });
  if (airpodsConditionInput) airpodsConditionInput.addEventListener('change', updatePreview);
  if (imageInput){
    imageInput.addEventListener('change', ()=>{
      const f = imageInput.files && imageInput.files[0];
      if (f && previewImage){ previewImage.src = URL.createObjectURL(f); }
      updatePreview();
    });
  }

  function showDetailsForType(type){
    if (detailsIphones) detailsIphones.style.display = 'none';
    if (detailsAccessories) detailsAccessories.style.display = 'none';
    if (detailsCharger) detailsCharger.style.display = 'none';
    if (detailsAirpods) detailsAirpods.style.display = 'none';
    if (!type) return;
    if (type === 'Iphones' || type === 'Airpods'){
      if (type === 'Iphones'){
        if (detailsIphones) detailsIphones.style.display = '';
      } else {
        if (detailsAirpods) detailsAirpods.style.display = '';
        if (nameInput && airpodsGenerationInput) nameInput.value = airpodsGenerationInput.value || 'AirPods';
      }
      // For phones/AirPods, names vary; do not auto-change name
    } else if (type === 'Accessories'){
      if (detailsAccessories) detailsAccessories.style.display = '';
      if (nameInput) nameInput.value = (accessoryKind && accessoryKind.value) || 'Accessories';
    } else if (type === 'Three Pin Charger' || type === 'Two Pin Charger'){
      if (detailsCharger) detailsCharger.style.display = '';
      if (chargerPinType) chargerPinType.value = (type === 'Three Pin Charger') ? 'Three Pin' : 'Two Pin';
      if (nameInput) nameInput.value = type;
    }
    updatePreview();
  }
  if (accessoryKind){
    accessoryKind.addEventListener('change', ()=>{
      if (productTypeSelect && productTypeSelect.value === 'Accessories' && nameInput){
        nameInput.value = accessoryKind.value || 'Accessories';
      }
    });
  }
  if (productTypeSelect){
    productTypeSelect.addEventListener('change', ()=> showDetailsForType(productTypeSelect.value));
    showDetailsForType(productTypeSelect.value);
  }

  async function fetchProducts(fresh=false){
    const items = await api('/api/products');
    renderProducts(items, fresh);
  }

  function renderProducts(items, fresh=false){
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';
    items.forEach((p)=>{
      let imgSrc = normalizeImageUrl(p.image||'');
      if (fresh && imgSrc) {
        const sep = imgSrc.includes('?') ? '&' : '?';
        imgSrc = `${imgSrc}${sep}ts=${Date.now()}`;
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='/admin/placeholder.svg';"/></td>
        <td>${p.name}</td>
        <td>${p.currency||'MWK'} ${p.price}</td>
        <td>${p.availability||''}</td>
        <td>
          <button class="btn" data-edit="${p.id}">Edit</button>
          <button class="btn" data-del="${p.id}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });

    // Bind actions
    tbody.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click', ()=>startEdit(items.find(x=>x.id===btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>delProduct(btn.dataset.del));
    });
  }

  // Reviews
  async function fetchReviews(fresh=false){
    const items = await api('/api/reviews');
    renderReviews(items, fresh);
  }
  function renderReviews(items, fresh=false){
    const tbody = document.querySelector('#reviewsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    items.forEach((r)=>{
      let imgSrc = normalizeImageUrl(r.photo||'');
      if (fresh && imgSrc) {
        const sep = imgSrc.includes('?') ? '&' : '?';
        imgSrc = `${imgSrc}${sep}ts=${Date.now()}`;
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${imgSrc ? ('<img src="' + imgSrc + '" alt="' + (r.name||'') + '" style="width:50px;height:50px;object-fit:cover;border-radius:50%">') : '-'}</td>
        <td>${r.name||''}</td>
        <td>${r.rating||''}</td>
        <td>${formatAbsoluteTime(r.createdAt) || ''}</td>
        <td>
          <button class="btn" data-del-review="${r.id}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('[data-del-review]').forEach(btn=>{
      btn.addEventListener('click', ()=>delReview(btn.dataset.delReview));
    });
  }
  function formatRelativeTime(iso){
    try{
      if (!iso) return '';
      const then = new Date(iso).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - then)/1000)); // seconds
      if (diff < 60) return 'Just now';
      const m = Math.floor(diff/60);
      if (m < 60) return `${m} minute${m===1?'':'s'} ago`;
      const h = Math.floor(m/60);
      if (h < 24) return `${h} hour${h===1?'':'s'} ago`;
      const d = Math.floor(h/24);
      if (d < 30) return `${d} day${d===1?'':'s'} ago`;
      const mo = Math.floor(d/30);
      if (mo < 12) return `${mo} month${mo===1?'':'s'} ago`;
      const y = Math.floor(mo/12);
      return `${y} year${y===1?'':'s'} ago`;
    }catch{ return ''; }
  }
  function formatAbsoluteTime(iso){
    try{
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }catch{ return ''; }
  }
  async function delReview(id){
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method:'DELETE', headers: { ...authHeaders() } });
    fetchReviews(true);
  }

  function startEdit(p){
    document.getElementById('productId').value = p.id;
    document.getElementById('name').value = p.name;
    document.getElementById('price').value = p.price;
    document.getElementById('availability').value = p.availability || '';
    document.getElementById('currentImage').value = p.image || '';
    if (previewImage) previewImage.src = normalizeImageUrl(p.image||'/admin/placeholder.svg');
    const d = p.details || {};
    if (productTypeSelect){
      const t = p.type || 'Iphones';
      productTypeSelect.value = t;
      showDetailsForType(t);
      if (t === 'Iphones'){
        document.getElementById('batteryHealth').value = d.batteryHealth || '';
        document.getElementById('faceId').value = d.faceId || '';
        document.getElementById('trueTone').value = d.trueTone || '';
        document.getElementById('batteryReplaced').value = d.batteryReplaced || '';
        document.getElementById('condition').value = d.condition || '';
      } else if (t === 'Airpods'){
        if (airpodsGenerationInput) airpodsGenerationInput.value = d.generation || (nameInput && nameInput.value.includes('Pro') ? 'AirPods Pro 2nd Gen' : 'AirPods 2nd Gen');
        if (airpodsConditionInput) airpodsConditionInput.value = d.condition || 'Boxed';
        if (nameInput && airpodsGenerationInput) nameInput.value = airpodsGenerationInput.value || 'AirPods';
      } else if (t === 'Accessories'){
        const ak = document.getElementById('accessoryKind');
        const ac = document.getElementById('accessoryCondition');
        if (ak) ak.value = d.kind || 'USB to Lightning';
        if (ac) ac.value = d.condition || '';
        if (nameInput && ak) nameInput.value = ak.value;
      } else if (t === 'Three Pin Charger' || t === 'Two Pin Charger'){
        if (chargerPinType) chargerPinType.value = d.pinType || ((t==='Three Pin Charger')?'Three Pin':'Two Pin');
        const watt = document.getElementById('chargerWattage');
        if (watt) watt.value = d.wattage || '';
      }
    }
    updatePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function delProduct(id){
    if (!confirm('Delete this product?')) return;
    await api(`/api/products/${id}`, { method:'DELETE' });
    fetchProducts();
  }

  if (productForm){
    document.getElementById('resetForm').addEventListener('click', ()=>{ productForm.reset(); document.getElementById('productId').value=''; });

    productForm.addEventListener('submit', async (e)=>{
      e.preventDefault();

      // Input validation
      const name = document.getElementById('name').value.trim();
      const priceValue = document.getElementById('price').value.trim();
      
      if (!name || name.length < 2) {
        alert('Product name is required and must be at least 2 characters long.');
        return;
      }
      
      if (!priceValue) {
        alert('Price is required.');
        return;
      }
      
      const price = Number(priceValue);
      if (isNaN(price) || price <= 0) {
        alert('Price must be a valid positive number.');
        return;
      }

      // File validation
      const file = document.getElementById('image').files[0];
      if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert('Image file size must be less than 5MB.');
          return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Invalid image type. Please upload a JPEG, PNG, WebP, GIF, or BMP image.');
          return;
        }
      }

      // Optional image upload
      let imageUrl = '';
      if (file){
        const fd = new FormData();
        fd.append('image', file);
        // Default to Iphones folder; can be changed to dynamic folders if needed
        fd.append('folder', 'Iphones');
        const res = await fetch('/api/products/upload-product', { method:'POST', headers: { ...authHeaders() }, body: fd });
        if (!res.ok) { 
          const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
          alert('Upload failed: ' + (errorData.error || 'Unknown error'));
          return; 
        }
        const data = await res.json();
        imageUrl = data.url; // normalized 'Pictures/...'
      }
      // If no new file and editing, keep current image
      if (!imageUrl) imageUrl = document.getElementById('currentImage').value.trim();

      const type = (productTypeSelect && productTypeSelect.value) || 'Iphones';
      // Derive name from selection for Accessories/Chargers to avoid mismatch
      let productName = (document.getElementById('name').value || '').trim();
      if (type === 'Accessories'){
        productName = (document.getElementById('accessoryKind').value || 'Accessories').trim();
      } else if (type === 'Three Pin Charger' || type === 'Two Pin Charger'){
        productName = type;
      } else if (type === 'Airpods'){
        productName = (document.getElementById('airpodsGeneration').value || 'AirPods').trim();
      }
      let details = {};
      if (type === 'Iphones'){
        details = {
          batteryHealth: (document.getElementById('batteryHealth').value || '').trim(),
          faceId: (document.getElementById('faceId').value || '').trim(),
          trueTone: (document.getElementById('trueTone').value || '').trim(),
          batteryReplaced: (document.getElementById('batteryReplaced').value || '').trim(),
          condition: (document.getElementById('condition').value || '').trim(),
        };
      } else if (type === 'Airpods'){
        details = {
          generation: (document.getElementById('airpodsGeneration').value || '').trim(),
          condition: (document.getElementById('airpodsCondition').value || '').trim(),
        };
      } else if (type === 'Accessories'){
        details = {
          kind: (document.getElementById('accessoryKind').value || '').trim(),
          condition: (document.getElementById('accessoryCondition').value || '').trim(),
        };
      } else if (type === 'Three Pin Charger' || type === 'Two Pin Charger'){
        details = {
          pinType: (document.getElementById('chargerPinType').value || '').trim(),
          wattage: (document.getElementById('chargerWattage').value || '').trim(),
        };
      }

      const payload = {
        name: productName,
        price: price,
        currency: 'MWK',
        availability: document.getElementById('availability').value.trim() || 'In Stock',
        image: imageUrl,
        type: type,
        details: details
      };

      try {
        const id = document.getElementById('productId').value.trim();
        if (id){
          await api(`/api/products/${id}`, { method:'PUT', body: JSON.stringify(payload) });
        } else {
          await api('/api/products', { method:'POST', body: JSON.stringify(payload) });
        }
        productForm.reset();
        document.getElementById('productId').value='';
        fetchProducts(true); // fresh reload to bust cache for new images
      } catch (error) {
        alert('Error saving product: ' + error.message);
      }
    });

    // Initial load
    fetchProducts();
    fetchReviews();
    updatePreview();
  }

  // Review form handling
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm){
    document.getElementById('resetReviewForm').addEventListener('click', ()=>{ reviewForm.reset(); });
    reviewForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('reviewName').value.trim();
      const reviewText = document.getElementById('reviewText').value.trim();
      const rating = document.getElementById('reviewRating').value || '★★★★★';
      if (!name || !reviewText){
        alert('Name and Review are required.');
        return;
      }
      const file = document.getElementById('reviewImage').files[0];
      let photoUrl = '';
      if (file){
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize){ alert('Image file size must be less than 5MB.'); return; }
        const fd = new FormData();
        fd.append('image', file);
        try{
          const data = await apiMultipart('/api/reviews/upload-photo', fd);
          photoUrl = data.url || '';
        }catch(ex){
          alert('Upload failed: ' + ex.message);
          return;
        }
      }
      try{
        await api('/api/reviews', { method:'POST', body: JSON.stringify({ name, photo: photoUrl, review: reviewText, rating, createdAt: new Date().toISOString() }) });
        reviewForm.reset();
        fetchReviews(true);
      }catch(ex){
        alert('Error saving review: ' + ex.message);
      }
    });
    // Initial load if only reviews section present
    fetchReviews();
  }
})();
