import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import AIChatAssistant from '../components/AIChatAssistant';

/* ── Interests chip selector ─────────────────────────────────── */
const SUGGESTED_INTERESTS = [
  'Web Development', 'Data Analytics', 'Machine Learning',
  'UI/UX Design', 'Cloud Computing', 'Cybersecurity',
  'Mobile Development', 'Blockchain', 'DevOps', 'AI & NLP',
];

function InterestTag({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        selected
          ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
          : 'bg-white border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-500'
      }`}
    >
      {selected ? '✓ ' : '+ '}{label}
    </button>
  );
}

/* ── Avatar initials ─────────────────────────────────────────── */
function Avatar({ name, size = 'lg' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const sizes = {
    lg: 'w-24 h-24 text-3xl',
    sm: 'w-10 h-10 text-sm',
  };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-xl shadow-indigo-500/30 flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ── Field component ─────────────────────────────────────────── */
function Field({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, token, logout } = useAuth();

  const [form, setForm] = useState({
    name:             '',
    email:            '',
    role:             '',
    interestedFields: [],
    customInterest:   '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');   // success message
  const [apiErr,  setApiErr]  = useState('');

  /* Load profile from backend */
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const u = d.data;
          setForm({
            name:             u.name  || '',
            email:            u.email || '',
            role:             u.role  || '',
            interestedFields: Array.isArray(u.interestedFields) ? u.interestedFields : [],
            customInterest:   '',
          });
        } else throw new Error(d.message);
      })
      .catch(e => setApiErr(e.message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  /* Validation */
  const validate = () => {
    const e = {};
    if (!form.name.trim())                  e.name  = 'Name is required.';
    if (!form.email.trim())                 e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                            e.email = 'Enter a valid email address.';
    if (!form.role.trim())                  e.role  = 'Role is required.';
    return e;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const toggleInterest = (interest) => {
    setForm(f => ({
      ...f,
      interestedFields: f.interestedFields.includes(interest)
        ? f.interestedFields.filter(i => i !== interest)
        : [...f.interestedFields, interest],
    }));
  };

  const addCustomInterest = () => {
    const val = form.customInterest.trim();
    if (val && !form.interestedFields.includes(val)) {
      setForm(f => ({ ...f, interestedFields: [...f.interestedFields, val], customInterest: '' }));
    }
  };

  const removeInterest = (i) => {
    setForm(f => ({ ...f, interestedFields: f.interestedFields.filter(x => x !== i) }));
  };

  /* Submit */
  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiErr('');
    try {
      const res = await fetch('/api/users/me', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:             form.name.trim(),
          email:            form.email.trim(),
          role:             form.role.trim(),
          interestedFields: form.interestedFields,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed.');
      setToast('✅ Profile updated successfully!');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      setApiErr(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: '#10b981', color: '#fff', fontSize: 14, fontWeight: 600,
          padding: '10px 22px', borderRadius: 12, boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
        }}>
          {toast}
        </div>
      )}

      <div className="page-enter" style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* ── Profile Header ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100/80 p-8 mb-6 flex flex-col items-center text-center">
              <Avatar name={form.name} size="lg" />
              <h1 className="text-2xl font-extrabold text-slate-900 mt-4">{form.name || 'Your Name'}</h1>
              <span className="inline-block mt-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                {form.role || 'Student'}
              </span>
              {form.interestedFields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {form.interestedFields.slice(0, 4).map(f => (
                    <span key={f} className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">{f}</span>
                  ))}
                  {form.interestedFields.length > 4 && (
                    <span className="text-[11px] text-slate-400 px-2 py-0.5">+{form.interestedFields.length - 4} more</span>
                  )}
                </div>
              )}
            </div>

            {/* ── User Information ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100/80 p-6 mb-6 space-y-5">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                👤 User Information
              </h2>

              {apiErr && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-600">
                  ⚠️ {apiErr}
                </div>
              )}

              <Field label="Full Name" error={errors.name}>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    errors.name
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-indigo-300 focus:border-indigo-400'
                  }`}
                />
              </Field>

              <Field label="Email Address" error={errors.email}>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-indigo-300 focus:border-indigo-400'
                  }`}
                />
              </Field>

              <Field label="Role" error={errors.role}>
                <input
                  type="text" name="role" value={form.role} onChange={handleChange}
                  placeholder="e.g. Student, Developer, Designer"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    errors.role
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-indigo-300 focus:border-indigo-400'
                  }`}
                />
              </Field>

              {/* Interested Fields */}
              <Field label="Interested Fields">
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUGGESTED_INTERESTS.map(interest => (
                    <InterestTag
                      key={interest}
                      label={interest}
                      selected={form.interestedFields.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                    />
                  ))}
                </div>

                {/* Selected chips with remove */}
                {form.interestedFields.filter(i => !SUGGESTED_INTERESTS.includes(i)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.interestedFields.filter(i => !SUGGESTED_INTERESTS.includes(i)).map(interest => (
                      <span key={interest} className="flex items-center gap-1 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                        {interest}
                        <button type="button" onClick={() => removeInterest(interest)} className="ml-1 hover:text-indigo-200 font-bold">✕</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom interest input */}
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={form.customInterest}
                    onChange={e => setForm(f => ({ ...f, customInterest: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                    placeholder="Add custom interest and press Enter…"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={addCustomInterest}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Click a chip to toggle it, or type a custom interest above.</p>
              </Field>
            </div>

            {/* ── Update Section ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100/80 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Save Changes</p>
                <p className="text-xs text-slate-400 mt-0.5">Your profile will be updated instantly.</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                ) : '💾 Update Profile'}
              </button>
            </div>

          </form>
        )}
      </div>
      <AIChatAssistant />
    </Layout>
  );
}
