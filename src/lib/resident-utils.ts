import type { Person } from '../types';
import { age } from '../types';
import { normalizeSearch } from './case-utils';

export const residentColumns:{id:string;label:string;value:(person:Person)=>string}[]=[
  {id:'first-name',label:'First Name',value:p=>p.first_name},{id:'middle-name',label:'Middle Name',value:p=>p.middle_name},{id:'last-name',label:'Last Name',value:p=>p.last_name},{id:'role',label:'Role',value:p=>p.role||''},{id:'gender',label:'Gender',value:p=>p.gender},{id:'birth-date',label:'Date of Birth',value:p=>p.date_of_birth},{id:'age',label:'Age',value:p=>age(p.date_of_birth)},{id:'contact',label:'Contact Number',value:p=>p.contact_number},{id:'house',label:'House/Building Number',value:p=>p.house_building_number},{id:'street',label:'Street',value:p=>p.street},{id:'barangay',label:'Barangay',value:p=>p.barangay},{id:'city',label:'City/Municipality',value:p=>p.city_municipality},{id:'region',label:'Region',value:p=>p.region}
];
export const matchesResidentSearch=(person:Person,query:string)=>{const text=normalizeSearch(residentColumns.map(column=>column.value(person)).join(' '));return normalizeSearch(query).split(' ').filter(Boolean).every(term=>text.includes(term));};
