import { Pencil, Trash2 } from 'lucide-react';
import type { Case } from '../types';
import { tableColumns } from '../lib/case-utils';

export function CaseTable({data,edit,del,visibleColumns,onOpenHistory}:{data:Case[];edit:(item:Case)=>void;del:(id:number)=>void;visibleColumns?:string[];onOpenHistory?:(item:Case)=>void}) {
  const columns=visibleColumns?tableColumns.filter(column=>visibleColumns.includes(column.id)):tableColumns;
  return <div className="table-wrap"><table><thead><tr>{columns.map(column=><th key={column.id}>{column.label}</th>)}<th>Actions</th></tr></thead><tbody>{data.map(item=><tr key={item.id} className={onOpenHistory?'case-row':''} onClick={()=>onOpenHistory?.(item)}>{columns.map(column=><td key={column.id}>{column.value(item)}</td>)}<td className="row-actions"><button className="icon-btn" onClick={event=>{event.stopPropagation();edit(item)}}><Pencil size={16}/></button><button className="icon-btn danger" onClick={event=>{event.stopPropagation();del(item.id!)}}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
}
