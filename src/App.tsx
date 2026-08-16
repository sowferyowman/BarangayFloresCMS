import { useEffect, useMemo, useState } from 'react';
import { BarChart3, FolderArchive, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import type { Case } from './types';
import { store } from './lib/storage';
import { blankCase, matchesCaseSearch, tableColumns } from './lib/case-utils';
import { CaseEditor } from './components/CaseEditor';
import { CaseHistory } from './components/CaseHistory';
import { AdminConfirmationDialog } from './components/AdminConfirmationDialog';
import { DeleteCaseConfirmationDialog } from './components/DeleteCaseConfirmationDialog';
import { Logo, SkeletonDashboard } from './components/common';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Cases } from './pages/Cases';
import { Residents } from './pages/Residents';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import './styles.css';

type Page = 'Dashboard' | 'Involved Persons' | 'Cases' | 'Reports' | 'Settings';

export default function App() {
  const [auth, setAuth] = useState(sessionStorage.getItem('bf-auth') === 'yes');
  const [page, setPage] = useState<Page>('Dashboard');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Case | null>(null);
  const [historyCase, setHistoryCase] = useState<Case | null>(null);
  const [pendingEdit, setPendingEdit] = useState<Case | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Case | null>(null);
  const [query, setQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(() => tableColumns.map(c => c.id));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('bf-dark-theme') === 'on');

  const load = () => {
    setLoading(true);
    return store.cases().then(setCases).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteCase = async () => {
    if (!pendingDelete?.id) return;
    await store.deleteCase(pendingDelete.id);
    setPendingDelete(null);
    setNote('Case record deleted.');
    load();
  };

  const save = async (caseItem: Case) => {
    await store.saveCase(caseItem);
    load();
    setNote('Case record saved successfully.');
  };

  const filtered = useMemo(() => cases.filter(caseItem => matchesCaseSearch(caseItem, query)), [cases, query]);

  if (!auth) return <Login ok={() => { sessionStorage.setItem('bf-auth', 'yes'); location.reload(); }} />;

  const body = page === 'Dashboard'
    ? (loading ? <SkeletonDashboard /> : <Dashboard cases={cases} />)
    : page === 'Cases'
      ? <Cases query={query} setQuery={setQuery} data={filtered} edit={setPendingEdit} del={id => setPendingDelete(cases.find(caseItem => caseItem.id === id) ?? null)} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} columnsOpen={columnsOpen} setColumnsOpen={setColumnsOpen} add={() => setEdit(blankCase())} loading={loading} onOpenHistory={setHistoryCase} />
      : page === 'Involved Persons'
        ? <Residents />
        : page === 'Reports'
          ? <Reports cases={cases} />
          : <SettingsPage note={setNote} darkMode={darkMode} setDarkMode={setDarkMode} />;

  const nav: [Page, typeof LayoutDashboard][] = [['Dashboard', LayoutDashboard], ['Involved Persons', Users], ['Cases', FolderArchive], ['Reports', BarChart3], ['Settings', Settings]];

  return <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
    <aside>
      <div className="brand"><Logo small /><span>Barangay Flores<small>Case Management</small></span></div>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={page === label ? 'active' : ''} onClick={() => setPage(label)}><Icon size={19} />{label}</button>)}</nav>
      <button className="logout" onClick={() => { sessionStorage.clear(); location.reload(); }}><LogOut size={18} /> Sign out</button>
    </aside>
    <main className="content">
      <header>
        <div><h1>{page}</h1></div>
      </header>
      {note && <div className="notice">{note}</div>}
      {body}
    </main>
    {historyCase && <CaseHistory caseItem={historyCase} close={() => setHistoryCase(null)} />}
    {pendingEdit && <AdminConfirmationDialog onClose={() => setPendingEdit(null)} onConfirm={() => { setEdit(pendingEdit); setPendingEdit(null); }} />}
    {pendingDelete && <DeleteCaseConfirmationDialog caseItem={pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={deleteCase} />}
    {edit && <CaseEditor item={edit} save={save} close={() => setEdit(null)} />}
  </div>;
}
