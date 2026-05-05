Router.register('admin-medical-resource-form', (app, { resource } = {}) => {
  if (!requireAuth()) return;
  const user = api.getUser();
  if (user?.role !== 'admin') {
    Router.navigate('dashboard');
    return;
  }

  const isEdit = !!resource;
  const title = isEdit ? 'Edit Resource' : 'Add Resource';

  const content = document.createElement('div');
  content.className = 'page-pad flex flex-col gap-16';

  content.innerHTML = `
    <form id="resourceForm" class="flex flex-col gap-16">
      <div class="input-group">
        <label>Title</label>
        <input type="text" id="rTitle" placeholder="e.g. Dental Hygiene Guide" required />
      </div>
      <div class="input-group">
        <label>Category</label>
        <select id="rCategory" required>
          <option value="">Select a category</option>
          <option value="General Health">General Health</option>
          <option value="Oral Hygiene">Oral Hygiene</option>
          <option value="Diet & Nutrition">Diet & Nutrition</option>
          <option value="Post-Care">Post-Care</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="input-group">
        <label>Description</label>
        <textarea id="rDesc" rows="4" placeholder="Resource description..." required></textarea>
      </div>
      <div class="input-group">
        <label>External URL (Optional)</label>
        <input type="url" id="rUrl" placeholder="https://..." />
      </div>
      <div class="input-group">
        <label>Image</label>
        <input type="file" id="rImage" accept="image/*" />
        <div id="imagePreview" style="margin-top:10px;"></div>
      </div>
      <button type="submit" class="btn btn-primary btn-full mt-8" id="submitBtn">
        ${isEdit ? 'Update Resource' : 'Add Resource'}
      </button>
    </form>
  `;

  const screen = createScreen({
    topNav: renderTopNav({ title, backScreen: 'admin-medical-resources', showNotif: false }),
    content,
  });
  app.appendChild(screen);

  const form = screen.querySelector('#resourceForm');
  const titleInput = screen.querySelector('#rTitle');
  const catInput = screen.querySelector('#rCategory');
  const descInput = screen.querySelector('#rDesc');
  const urlInput = screen.querySelector('#rUrl');
  const imgInput = screen.querySelector('#rImage');
  const previewDiv = screen.querySelector('#imagePreview');
  const submitBtn = screen.querySelector('#submitBtn');

  if (isEdit) {
    titleInput.value = resource.title || '';
    catInput.value = resource.category || '';
    descInput.value = resource.description || '';
    urlInput.value = resource.url || '';
    if (resource.image_url) {
      previewDiv.innerHTML = `<img src="http://localhost:5000${resource.image_url}" style="max-width:100%;max-height:150px;border-radius:var(--radius-sm)" alt="Preview"/>`;
    }
  }

  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewDiv.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:150px;border-radius:var(--radius-sm)" alt="Preview"/>`;
      };
      reader.readAsDataURL(file);
    } else if (isEdit && resource.image_url) {
      previewDiv.innerHTML = `<img src="http://localhost:5000${resource.image_url}" style="max-width:100%;max-height:150px;border-radius:var(--radius-sm)" alt="Preview"/>`;
    } else {
      previewDiv.innerHTML = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff"></span> Saving...';

    try {
      const fd = new FormData();
      fd.append('title', titleInput.value);
      fd.append('category', catInput.value);
      fd.append('description', descInput.value);
      if (urlInput.value) fd.append('url', urlInput.value);
      
      const file = imgInput.files[0];
      if (file) {
        fd.append('image', file);
      }

      if (isEdit) {
        await api.updateMedicalResource(resource._id, fd);
        showToast('Resource updated successfully', 'success');
      } else {
        await api.createMedicalResource(fd);
        showToast('Resource added successfully', 'success');
      }
      
      Router.navigate('admin-medical-resources');
    } catch (err) {
      showToast(err.message || 'Failed to save resource', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = isEdit ? 'Update Resource' : 'Add Resource';
    }
  });
});
