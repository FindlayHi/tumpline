const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function initForm() {
  const form = document.getElementById('consult-form');
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const resetBtn = successEl && successEl.querySelector('[data-reset]');
  const submitBtn = form.querySelector('[type="submit"]');

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

  function showSuccess(name) {
    form.hidden = true;
    if (successEl) {
      const nameEl = successEl.querySelector('[data-name]');
      if (nameEl) nameEl.textContent = name;
      successEl.hidden = false;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cfg = window.TUMPLINE_CONFIG || {};
    const fd = new FormData(form);
    const payload = {
      name:      fd.get('name')?.toString().trim(),
      email:     fd.get('email')?.toString().trim(),
      company:   fd.get('company')?.toString().trim() || null,
      team_size: fd.get('teamSize')?.toString() || null,
      message:   fd.get('message')?.toString().trim() || null,
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    try {
      const isConfigured = cfg.supabaseUrl && cfg.supabaseUrl !== 'REPLACE_ME' &&
                           cfg.supabaseAnonKey && cfg.supabaseAnonKey !== 'REPLACE_ME';

      if (isConfigured) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
        const { error } = await supabase.from('tumpline_leads').insert(payload);
        if (error) throw error;
      }

      const cal = cfg.calendlyUrl;
      if (cal && !cal.includes('REPLACE_ME') && cal.length > 0) {
        const url = new URL(cal);
        if (payload.name)  url.searchParams.set('name', payload.name);
        if (payload.email) url.searchParams.set('email', payload.email);
        window.open(url.toString(), '_blank', 'noopener');
      }

      showSuccess(payload.name);
    } catch {
      // Don't lose the lead's intent — still acknowledge submission.
      showSuccess(payload.name);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Request my consult'; }
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
