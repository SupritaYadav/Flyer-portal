import { useEffect, useMemo, useState } from 'react';
import { loadMembers, saveMembers } from './lib/api';
import { sanitize, validate, tierFor } from './lib/input';
import { track } from './lib/analytics';

const EMPTY_FORM = { name: '', email: '', miles: '' };
const FIELDS = [
  { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { key: 'miles', label: 'Miles balance', type: 'text', inputMode: 'numeric', autoComplete: 'off' },
];

export default function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;
    loadMembers()
      .then((data) => active && (setMembers(data), setNotice('')))
      .catch(() => active && setNotice('Could not load members. Check your connection and try again.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [attempt]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? members.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(q))
      : members;
  }, [members, query]);

  function retry() {
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  async function persist(next) {
    setSaving(true);
    try {
      await saveMembers(next);
      setMembers(next);
      setNotice('');
      track();
      return true;
    } catch {
      setNotice('Could not save your change. Check your connection and try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const clean = {
      name: sanitize(form.name),
      email: sanitize(form.email),
      miles: sanitize(form.miles),
    };
    const found = validate(clean);
    setErrors(found);
    const firstInvalid = FIELDS.find((f) => found[f.key]);
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid.key}`)?.focus();
      return;
    }
    const member = { id: `m-${Date.now()}-${members.length}`, ...clean, miles: Number(clean.miles) };
    if (await persist([member, ...members])) setForm(EMPTY_FORM);
  }

  function handleRemove(id) {
    persist(members.filter((m) => m.id !== id));
  }

  return (
    <>
      <header className="site-header">
        <div className="container">
          <h1>End-to-End Frequent Flyer Portal</h1>
          <p>Look up members and register new ones at the desk.</p>
        </div>
      </header>

      <main className="container">
        {notice && (
          <div className="banner" role="alert">
            <span>{notice}</span>
            <button type="button" className="btn" onClick={retry}>Retry</button>
          </div>
        )}

        <section aria-labelledby="register-heading" className="panel">
          <h2 id="register-heading">Register a member</h2>
          <form onSubmit={handleSubmit} noValidate className="form">
            {FIELDS.map(({ key, label, ...rest }) => (
              <div className="field" key={key}>
                <label htmlFor={`field-${key}`}>{label}</label>
                <input
                  id={`field-${key}`}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  aria-invalid={errors[key] ? 'true' : 'false'}
                  aria-describedby={errors[key] ? `error-${key}` : undefined}
                  className={errors[key] ? 'invalid' : ''}
                  disabled={saving}
                  {...rest}
                />
                {errors[key] && (
                  <p id={`error-${key}`} className="error" role="alert">{errors[key]}</p>
                )}
              </div>
            ))}
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Register member'}
            </button>
          </form>
        </section>

        <section aria-labelledby="members-heading" className="panel">
          <h2 id="members-heading">Members</h2>
          <div className="field">
            <label htmlFor="search">Search by name or email</label>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>

          {loading ? (
            <p role="status" className="status">
              <span className="spinner" aria-hidden="true" /> Loading members…
            </p>
          ) : visible.length === 0 ? (
            <p role="status" className="status">
              No data found. {query ? 'Try a different search.' : 'Register the first member above.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <caption className="sr-only">Frequent flyer members</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Miles</th>
                    <th scope="col">Tier</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => (
                    <tr key={m.id}>
                      <th scope="row">{m.name}</th>
                      <td>{m.email}</td>
                      <td>{m.miles.toLocaleString('en-US')}</td>
                      <td>{tierFor(m.miles)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleRemove(m.id)}
                          disabled={saving}
                          aria-label={`Remove ${m.name}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
