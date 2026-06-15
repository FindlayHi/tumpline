const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function initForm() {
  const form = document.getElementById('consult-form');
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const resetBtn = successEl && successEl.querySelector('[data-reset]');

  function clearErrors() {
    form.querySelectorAll('[data-error-for]').forEach(el => {
      el.hidden = true;
      el.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  }

  function showError(name, msg) {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    const input = form.querySelector(`[name="${name}"]`);
    if (el) { el.textContent = msg; el.hidden = false; }
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function validate() {
    clearErrors();
    let ok = true;
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name) { showError('name', 'Name is required.'); ok = false; }
    if (!email) { showError('email', 'Email is required.'); ok = false; }
    else if (!emailRe.test(email)) { showError('email', 'Please enter a valid email address.'); ok = false; }
    if (!message) { showError('message', "Please tell us what's slowing you down."); ok = false; }

    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitterName = form.querySelector('[name="name"]').value.trim();

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.hidden = true;
        if (successEl) {
          const nameEl = successEl.querySelector('[data-name]');
          if (nameEl) nameEl.textContent = submitterName;
          successEl.hidden = false;
        }
      } else {
        showError('message', 'Something went wrong. Please email us directly at hello@tumpline.ca');
      }
    } catch {
      showError('message', 'Something went wrong. Please email us directly at hello@tumpline.ca');
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (successEl) successEl.hidden = true;
      form.reset();
      form.hidden = false;
      clearErrors();
    });
  }
}

initForm();
