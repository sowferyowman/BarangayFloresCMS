import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  Users,
  FolderArchive,
  BarChart3,
  Settings,
  Plus,
  Search,
  Pencil,
  Trash2,
  FilePlus2,
  LogOut,
} from 'lucide-react';
import type { Case, Person } from './types';
import { age } from './types';
import { store } from './lib/storage';
import { GradualSpacing } from './components/ui/gradual-spacing';
import './styles.css';

const person = (): Person => ({
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  contact_number: '',
  house_building_number: '',
  street: '',
  barangay: 'Flores',
  city_municipality: '',
  region: 'Region IV-A',
});

const blank = (): Case => ({
  case_number: '',
  status: 'Active',
  nature_of_case: '',
  case_description: '',
  place_of_incident: '',
  date_of_incident: '',
  time_of_incident: '',
  date_of_lupon_hearing: '',
  complainant: person(),
  respondent: person(),
});

const name = (p: Person) =>
  [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ') || '—';

const caseNatures = [
  'Physical Injury / Assault',
  'Threats',
  'Harassment',
  'Verbal Abuse',
  'Public Disturbance',
  'Property Damage',
  'Theft',
  'Boundary / Property Dispute',
  'Land / Property Dispute',
  'Noise Complaint',
  'Animal-Related Complaint',
  'Debt / Unpaid Obligation',
  'Family / Domestic Dispute',
  'Neighbor Dispute',
  'Trespassing',
  'Vandalism',
  'Gambling-Related Complaint',
  'Curfew Violation',
  'Barangay Ordinance Violation',
  'Traffic / Road-Related Complaint',
  'Environmental / Sanitation Complaint',
  'Other',
];

function Field({
  label,
  value,
  set,
  type = 'text',
  required,
  error,
}: {
  label: string;
  value: string;
  set: (x: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      <input type={type} value={value || ''} onChange={(e) => set(e.target.value)} />
      {error && <small>{error}</small>}
    </label>
  );
}

function PersonFields({
  title,
  value,
  set,
  errors,
}: {
  title: string;
  value: Person;
  set: (p: Person) => void;
  errors: Record<string, string>;
}) {
  const edit = (k: keyof Person) => (v: string) => set({ ...value, [k]: v });

  return (
    <section className="form-section">
      <h3>{title}</h3>
      <div className="form-grid">
        <Field
          label="First Name"
          required
          value={value.first_name}
          set={edit('first_name')}
          error={errors.first_name}
        />
        <Field label="Middle Name" value={value.middle_name} set={edit('middle_name')} />
        <Field
          label="Last Name"
          required
          value={value.last_name}
          set={edit('last_name')}
          error={errors.last_name}
        />
        <label className="field">
          <span>Gender *</span>
          <select value={value.gender} onChange={(e) => edit('gender')(e.target.value)}>
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Prefer not to say</option>
          </select>
        </label>
        <Field
          label="Date of Birth"
          required
          type="date"
          value={value.date_of_birth}
          set={edit('date_of_birth')}
          error={errors.date_of_birth}
        />
        <Field label="Age" value={age(value.date_of_birth)} set={() => {}} />
        <Field
          label="Contact Number"
          required
          value={value.contact_number}
          set={edit('contact_number')}
          error={errors.contact_number}
        />
      </div>

      <h4>Address</h4>
      <div className="form-grid">
        <Field
          label="House/Building Number"
          value={value.house_building_number}
          set={edit('house_building_number')}
        />
        <Field label="Street" value={value.street} set={edit('street')} />
        <Field label="Barangay" required value={value.barangay} set={edit('barangay')} />
        <Field
          label="City/Municipality"
          required
          value={value.city_municipality}
          set={edit('city_municipality')}
        />
        <Field label="Region" required value={value.region} set={edit('region')} />
      </div>
    </section>
  );
}

function Editor({
  item,
  save,
  close,
}: {
  item: Case;
  save: (c: Case) => Promise<void>;
  close: () => void;
}) {
  const [c, setC] = useState(item);
  const [e, setE] = useState<Record<string, string>>({});

  const submit = async (x: React.FormEvent) => {
    x.preventDefault();
    const z: Record<string, string> = {};

    (
      [
        'case_number',
        'nature_of_case',
        'case_description',
        'place_of_incident',
        'date_of_incident',
        'date_of_lupon_hearing',
      ] as const
    ).forEach((k) => {
      if (!c[k]) z[k] = 'Required.';
    });

    (['complainant', 'respondent'] as const).forEach((r) => {
      const p = c[r];
      if (!p.first_name) z[r + '.first_name'] = 'Required.';
      if (!p.last_name) z[r + '.last_name'] = 'Required.';
      if (!p.date_of_birth || new Date(p.date_of_birth) > new Date())
        z[r + '.date_of_birth'] = 'Enter a valid past date.';
      if (!/^09\d{9}$/.test(p.contact_number))
        z[r + '.contact_number'] = 'Use an 11-digit number beginning with 09.';
    });

    setE(z);
    if (Object.keys(z).length) return;

    try {
      await save(c);
      close();
    } catch (err) {
      setE({ form: err instanceof Error ? err.message : 'Unable to save.' });
    }
  };

  const errs = (r: string) =>
    Object.fromEntries(
      Object.entries(e)
        .filter(([k]) => k.startsWith(r + '.'))
        .map(([k, v]) => [k.slice(r.length + 1), v])
    );

  return (
    <div className="modal-backdrop">
      <form className="modal form" onSubmit={submit}>
        <div className="modal-head">
          <h2>{c.id ? 'Edit Case' : 'New Case'}</h2>
          <button type="button" className="icon-btn" onClick={close}>
            ×
          </button>
        </div>

        {e.form && <div className="alert">{e.form}</div>}

        <section className="form-section">
          <h3>Case Information</h3>
          <div className="form-grid">
            <Field
              label="Case Number"
              required
              value={c.case_number}
              set={(v) => setC({ ...c, case_number: v })}
              error={e.case_number}
            />
            <label className="field">
              <span>Nature of Case *</span>
              <select
                value={c.nature_of_case}
                onChange={(x) => setC({ ...c, nature_of_case: x.target.value })}
              >
                <option value="">Select nature of case</option>
                {caseNatures.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              {e.nature_of_case && <small>{e.nature_of_case}</small>}
            </label>
            <label className="field">
              <span>Case Status *</span>
              <select value={c.status} onChange={(x) => setC({ ...c, status: x.target.value as Case['status'] })}>
                <option>Active</option>
                <option>Settled</option>
                <option>Unsettled</option>
              </select>
            </label>
            <Field
              label="Place of Incident"
              required
              value={c.place_of_incident}
              set={(v) => setC({ ...c, place_of_incident: v })}
            />
            <Field
              label="Date of Incident"
              required
              type="date"
              value={c.date_of_incident}
              set={(v) => setC({ ...c, date_of_incident: v })}
            />
            <Field
              label="Time of Incident"
              type="time"
              value={c.time_of_incident}
              set={(v) => setC({ ...c, time_of_incident: v })}
            />
            <Field
              label="Date of Lupon Hearing"
              required
              type="date"
              value={c.date_of_lupon_hearing}
              set={(v) => setC({ ...c, date_of_lupon_hearing: v })}
            />
          </div>
          <label className="field full">
            <span>Case Description *</span>
            <textarea
              value={c.case_description}
              onChange={(x) => setC({ ...c, case_description: x.target.value })}
            />
          </label>
        </section>

        <PersonFields
          title="Complainant Information"
          value={c.complainant}
          set={(p) => setC({ ...c, complainant: p })}
          errors={errs('complainant')}
        />
        <PersonFields
          title="Respondent Information"
          value={c.respondent}
          set={(p) => setC({ ...c, respondent: p })}
          errors={errs('respondent')}
        />

        <div className="actions end">
          <button type="button" className="secondary" onClick={close}>
            Cancel
          </button>
          <button>Save Case</button>
        </div>
      </form>
    </div>
  );
}

function Table({
  data,
  edit,
  del,
}: {
  data: Case[];
  edit: (c: Case) => void;
  del: (id: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Case Number</th>
            <th>Nature</th>
            <th>Status</th>
            <th>Description</th>
            <th>Place of Incident</th>
            <th>Incident Date</th>
            <th>Incident Time</th>
            <th>Lupon Hearing</th>
            <th>Complainant First Name</th>
            <th>Complainant Middle Name</th>
            <th>Complainant Last Name</th>
            <th>Complainant Gender</th>
            <th>Complainant Date of Birth</th>
            <th>Complainant Age</th>
            <th>Complainant Contact</th>
            <th>Complainant House/Building</th>
            <th>Complainant Street</th>
            <th>Complainant Barangay</th>
            <th>Complainant City/Municipality</th>
            <th>Complainant Region</th>
            <th>Respondent First Name</th>
            <th>Respondent Middle Name</th>
            <th>Respondent Last Name</th>
            <th>Respondent Gender</th>
            <th>Respondent Date of Birth</th>
            <th>Respondent Age</th>
            <th>Respondent Contact</th>
            <th>Respondent House/Building</th>
            <th>Respondent Street</th>
            <th>Respondent Barangay</th>
            <th>Respondent City/Municipality</th>
            <th>Respondent Region</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id}>
              <td>
                <b>{c.case_number}</b>
              </td>
              <td>{c.nature_of_case}</td>
              <td><span className={`status ${c.status.toLowerCase()}`}>{c.status}</span></td>
              <td>{c.case_description}</td>
              <td>{c.place_of_incident}</td>
              <td>{c.date_of_incident}</td>
              <td>{c.time_of_incident}</td>
              <td>{c.date_of_lupon_hearing}</td>
              <PersonTableCells person={c.complainant} />
              <PersonTableCells person={c.respondent} />
              <td className="row-actions">
                <button className="icon-btn" onClick={() => edit(c)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => del(c.id!)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PersonTableCells({ person }: { person: Person }) {
  return <>
    <td>{person.first_name}</td><td>{person.middle_name}</td><td>{person.last_name}</td><td>{person.gender}</td>
    <td>{person.date_of_birth}</td><td>{age(person.date_of_birth)}</td><td>{person.contact_number}</td>
    <td>{person.house_building_number}</td><td>{person.street}</td><td>{person.barangay}</td>
    <td>{person.city_municipality}</td><td>{person.region}</td>
  </>;
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <img
      className={small ? 'logo small-logo' : 'logo'}
      src="/images/barangay-flores-seal.jpg"
      alt="Sangguniang Barangay ng Flores seal"
    />
  );
}

function Login({ ok }: { ok: () => void }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [e, setE] = useState('');

  return (
    <main className="login">
      <section className="login-shell">
        <div className="login-brand">
          <Logo />
          <div className="login-brand-copy">
            <p className="login-eyebrow">Sangguniang Barangay ng Flores</p>
            <h1 className="login-animated-title">
              <GradualSpacing text="CASE" className="login-title-letter" />
              <GradualSpacing text="MANAGEMENT" className="login-title-letter" />
              <GradualSpacing text="SYSTEM" className="login-title-letter" />
            </h1>
            <p>
              Secure local access for authorized judicial and administrative personnel of
              Barangay Flores.
            </p>
          </div>
        </div>

        <form
          className="login-form"
          onSubmit={async (x) => {
            x.preventDefault();
            if (await store.login(u, p)) ok();
            else setE('Invalid username or password.');
          }}
        >
          <h2>Welcome back</h2>
          <p>Please sign in to your local account.</p>
          {e && <div className="alert">{e}</div>}
          <label>
            <span>Username</span>
            <input value={u} placeholder="Username" onChange={(x) => setU(x.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={p}
              placeholder="Password"
              onChange={(x) => setP(x.target.value)}
              required
            />
          </label>
          <button>
            Login to System <span aria-hidden="true">›</span>
          </button>
          <small>
            ● &nbsp; Default credentials: <kbd>admin / admin123</kbd>
          </small>
        </form>
      </section>
    </main>
  );
}

function Empty({ title, add }: { title: string; add?: () => void }) {
  return (
    <div className="empty">
      <FolderArchive size={34} />
      <h3>{title}</h3>
      <p>Records will appear here once added.</p>
      {add && (
        <button onClick={add}>
          <Plus size={17} /> Create New Case
        </button>
      )}
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(sessionStorage.getItem('bf-auth') === 'yes');
  const [page, setPage] = useState('Dashboard');
  const [cases, setCases] = useState<Case[]>([]);
  const [edit, setEdit] = useState<Case | null>(null);
  const [q, setQ] = useState('');
  const [note, setNote] = useState('');

  const load = () => store.cases().then(setCases);
  const refreshForAuthChange = () => window.location.reload();

  useEffect(() => {
    load();
  }, []);

  if (!auth)
    return (
      <Login
        ok={() => {
          sessionStorage.setItem('bf-auth', 'yes');
          setAuth(true);
          refreshForAuthChange();
        }}
      />
    );

  const save = async (c: Case) => {
    await store.saveCase(c);
    load();
    setNote('Case record saved successfully.');
  };

  const del = async (id: number) => {
    if (confirm('Delete this case record?')) {
      await store.deleteCase(id);
      load();
    }
  };

  const filtered = useMemo(
    () => cases.filter((c) => JSON.stringify(c).toLowerCase().includes(q.toLowerCase())),
    [cases, q]
  );

  let body: React.ReactNode;

  if (page === 'Dashboard') {
    body = (
      <>
        <div className="stats">
          <Stat label="Total Cases" value={cases.length} />
          <Stat label="Total Complainants" value={cases.length} />
          <Stat label="Total Respondents" value={cases.length} />
        </div>
        <DashboardCharts cases={cases} />
      </>
    );
  } else if (page === 'Cases') {
    body = (
      <>
        <div className="toolbar">
          <div className="search">
            <Search size={18} />
            <input
              value={q}
              placeholder="Search case number, person, or nature"
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button onClick={() => setEdit(blank())}>
            <FilePlus2 size={17} /> New Case
          </button>
        </div>
        <section className="card">
          {filtered.length ? (
            <Table data={filtered} edit={setEdit} del={del} />
          ) : (
            <Empty
              title={q ? 'No matching cases found.' : 'No cases found.'}
              add={() => setEdit(blank())}
            />
          )}
        </section>
      </>
    );
  } else if (page === 'Residents') {
    body = <Residents />;
  } else if (page === 'Reports') {
    body = <Reports cases={cases} />;
  } else {
    body = <SettingsPage note={setNote} />;
  }

  const nav = [
    ['Dashboard', LayoutDashboard],
    ['Residents', Users],
    ['Cases', FolderArchive],
    ['Reports', BarChart3],
    ['Settings', Settings],
  ] as const;

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <Logo small />
          <span>
            Barangay Flores
            <small>Case Management</small>
          </span>
        </div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button key={label} className={page === label ? 'active' : ''} onClick={() => setPage(label)}>
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <button
          className="logout"
          onClick={() => {
            sessionStorage.clear();
            setAuth(false);
            refreshForAuthChange();
          }}
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <main className="content">
        <header>
          <div>
            <p className="crumb">Home / {page}</p>
            <h1>{page}</h1>
          </div>
          {page === 'Dashboard' && (
            <button onClick={() => setEdit(blank())}>
              <Plus size={17} /> New Case
            </button>
          )}
        </header>
        {note && <div className="notice">{note}</div>}
        {body}
      </main>

      {edit && <Editor item={edit} save={save} close={() => setEdit(null)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function HorizontalBars({ title, data, color = 'teal' }: { title: string; data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="card chart-card"><h2>{title}</h2><div className="horizontal-bars">{data.map((item) => <div className="bar-row" key={item.label}><span title={item.label}>{item.label}</span><div className="bar-track"><i className={color} style={{ width: `${item.value / max * 100}%` }} /></div><b>{item.value}</b></div>)}</div></section>;
}

function DashboardCharts({ cases }: { cases: Case[] }) {
  const people = cases.flatMap((item) => [item.complainant, item.respondent]);
  const nature = caseNatures.map((label) => ({ label, value: cases.filter((item) => item.nature_of_case === label).length }));
  const genders = ['Female', 'Male', 'Prefer not to say', 'Unspecified'].map((label) => ({ label, value: people.filter((person) => (person.gender || 'Unspecified') === label).length }));
  const ranges = [['Under 18', 0, 17], ['18–29', 18, 29], ['30–44', 30, 44], ['45–59', 45, 59], ['60+', 60, Infinity]] as const;
  const ages = ranges.map(([label, min, max]) => ({ label, value: people.filter((person) => { const value = Number(age(person.date_of_birth)); return Number.isFinite(value) && value >= min && value <= max; }).length }));
  return <div className="dashboard-charts"><HorizontalBars title="Cases by Nature" data={nature} /><div className="chart-pair"><HorizontalBars title="Cases by Gender" data={genders} color="blue" /><HorizontalBars title="Age Distribution" data={ages} color="green" /></div></div>;
}

function Residents() {
  const [data, setData] = useState<Person[]>([]);

  useEffect(() => {
    store.people().then(setData);
  }, []);

  return (
    <section className="card">
      <h2>Residents</h2>
      {data.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}>
                  <td>{name(p)}</td>
                  <td>{p.role}</td>
                  <td>{p.gender}</td>
                  <td>{age(p.date_of_birth)}</td>
                  <td>{p.contact_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No residents found." />
      )}
    </section>
  );
}

function Reports({ cases }: { cases: Case[] }) {
  return (
    <section className="card report">
      <h2>Printable Reports</h2>
      <p>Prepare reports from locally stored case records.</p>
      <div className="report-options">
        <button onClick={() => print()}>Print Case List</button>
        <span>{cases.length} record(s) available.</span>
      </div>
      {cases.length ? (
        <Table data={cases} edit={() => {}} del={() => {}} />
      ) : (
        <Empty title="No cases available for a report." />
      )}
    </section>
  );
}

function SettingsPage({ note }: { note: (v: string) => void }) {
  const backup = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.backup()], { type: 'application/json' }));
    a.download = `BarangayFlores_${new Date().toISOString().slice(0, 10)}.backup.json`;
    a.click();
    note('Backup downloaded. Store it on the designated external drive.');
  };

  const restore = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        store.restore(String(r.result));
        location.reload();
      } catch {
        note('Invalid or failed backup restore.');
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="settings">
      <section className="card">
        <h2>Database Backup</h2>
        <p>
          Create a portable snapshot of all local records. The native desktop backend provides
          safe SQLite snapshot commands for production deployment.
        </p>
        <button onClick={backup}>Backup Now</button>
        <p className="muted">
          Configure the selected removable-drive folder for first-day-of-month backups after
          installation.
        </p>
      </section>
      <section className="card">
        <h2>Database Restore</h2>
        <p>Restoring replaces current records with a prior backup.</p>
        <label className="secondary file">
          <input type="file" accept=".json,.backup" onChange={(e) => restore(e.target.files?.[0])} />{' '}
          Select Backup File
        </label>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
