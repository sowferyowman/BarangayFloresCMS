import type { Case } from '../types';
import { CaseTable } from '../components/CaseTable';
import { Empty } from '../components/common';
export function Reports({cases}:{cases:Case[]}) { return <section className="card report"><h2>Printable Reports</h2><p>Prepare reports from locally stored case records.</p><div className="report-options"><button onClick={()=>print()}>Print Case List</button><span>{cases.length} record(s) available.</span></div>{cases.length?<CaseTable data={cases} edit={()=>{}} del={()=>{}}/>:<Empty title="No cases available for a report."/>}</section>; }
