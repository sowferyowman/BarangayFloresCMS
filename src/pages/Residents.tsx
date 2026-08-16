import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Person } from '../types';
import { store } from '../lib/storage';
import { residentColumns, matchesResidentSearch } from '../lib/resident-utils';
import { Empty, SkeletonTable } from '../components/common';

export function Residents() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [columns, setColumns] = useState(() => residentColumns.map(column => column.id));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    store.people().then(setData).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => data.filter(person => matchesResidentSearch(person, query)), [data, query]);
  const visible = residentColumns.filter(column => columns.includes(column.id));

  return <>
    <div className="toolbar">
      <div className="cases-controls">
        <div className="search">
          <Search size={18} />
          <input value={query} placeholder="Search any involved person detail, address, or contact" onChange={event => setQuery(event.target.value)} />
        </div>
        <div className="column-picker">
          <button type="button" className={`column-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
            Filter Columns ({columns.length}/{residentColumns.length}) <span>⌄</span>
          </button>
          {open && <div className="column-menu">
            <div className="column-menu-actions">
              <button type="button" onClick={() => setColumns(residentColumns.map(column => column.id))}>Show all</button>
              <button type="button" onClick={() => setColumns([])}>Hide all</button>
            </div>
            {residentColumns.map(column => <button key={column.id} type="button" className={columns.includes(column.id) ? 'selected' : ''} onClick={() => setColumns(current => current.includes(column.id) ? current.filter(id => id !== column.id) : [...current, column.id])}>
              <input type="checkbox" checked={columns.includes(column.id)} readOnly />{column.label}
            </button>)}
          </div>}
        </div>
      </div>
    </div>
    <section className="card">
      {loading ? <SkeletonTable rows={5} /> : filtered.length ? <div className="table-wrap">
        <table>
          <thead><tr>{visible.map(column => <th key={column.id}>{column.label}</th>)}</tr></thead>
          <tbody>{filtered.map((person, index) => <tr key={index}>{visible.map(column => <td key={column.id}>{column.value(person)}</td>)}</tr>)}</tbody>
        </table>
      </div> : <Empty title={query ? 'No matching involved persons found.' : 'No involved persons found.'} />}
    </section>
  </>;
}
