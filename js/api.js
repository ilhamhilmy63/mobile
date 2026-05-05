/* ============================
   API.JS — Dent AI Mobile
   Base URL points to backend
   ============================ */

const API_BASE = 'http://localhost:5000/api';

const api = {
  getToken() {
    return localStorage.getItem('dent_ai_token');
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('dent_ai_user')); }
    catch { return null; }
  },
  saveAuth(token, user) {
    localStorage.setItem('dent_ai_token', token);
    localStorage.setItem('dent_ai_user', JSON.stringify(user));
  },
  clearAuth() {
    localStorage.removeItem('dent_ai_token');
    localStorage.removeItem('dent_ai_user');
  },
  async request(method, path, body = null, isFormData = false) {
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  },
  get(path)          { return this.request('GET', path); },
  post(path, body)   { return this.request('POST', path, body); },
  put(path, body)    { return this.request('PUT', path, body); },
  delete(path)       { return this.request('DELETE', path); },
  postForm(path, fd) { return this.request('POST', path, fd, true); },
  putForm(path, fd)  { return this.request('PUT', path, fd, true); },

  // ---- Auth ----
  login(payload)    { return this.post('/auth/login', payload); },
  register(payload) { return this.post('/auth/register', payload); },

  // ---- Medical Resources ----
  getMedicalResources()       { return this.get('/medical-resources'); },
  getMedicalResource(id)      { return this.get(`/medical-resources/${id}`); },
  createMedicalResource(fd)   { return this.postForm('/medical-resources', fd); },
  updateMedicalResource(id,fd){ return this.putForm(`/medical-resources/${id}`, fd); },
  deleteMedicalResource(id)   { return this.delete(`/medical-resources/${id}`); },

  // ---- Appointments ----
  getAppointments()           { return this.get('/appointments'); },
  createAppointment(payload)  { return this.post('/appointments', payload); },
  updateAppointment(id,payload){ return this.put(`/appointments/${id}`, payload); },

  // ---- Prescriptions ----
  getPrescriptions()          { return this.get('/prescriptions'); },

  // ---- Medications / Orders ----
  getMedications()            { return this.get('/medications'); },
  getMedicationOrders()       { return this.get('/medication-orders'); },
  getMedicationOrder(id)      { return this.get(`/medication-orders/${id}`); },
  createMedicationOrder(payload){ return this.post('/medication-orders', payload); },

  // ---- Payments ----
  getPayments()               { return this.get('/payments'); },

  // ---- Feedback ----
  getFeedback()               { return this.get('/feedback'); },
  createFeedback(payload)     { return this.post('/feedback', payload); },

  // ---- Emergency ----
  getEmergency()              { return this.get('/emergency'); },
  createEmergency(payload)    { return this.post('/emergency', payload); },

  // ---- Notifications ----
  getNotifications()          { return this.get('/notifications'); },

  // ---- Analytics ----
  getAnalytics()              { return this.get('/analytics'); },
};
