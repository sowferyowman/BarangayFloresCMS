import type { Person } from '../types';
import { age } from '../types';

export function Field({label,value,set,type='text',required,error}:{label:string;value:string;set:(value:string)=>void;type?:string;required?:boolean;error?:string}) {
  return <label className="field"><span>{label}{required&&<b> *</b>}</span><input type={type} value={value||''} onChange={event=>set(event.target.value)}/>{error&&<small>{error}</small>}</label>;
}

export function PersonFields({title,value,set,errors}:{title:string;value:Person;set:(person:Person)=>void;errors:Record<string,string>}) {
  const edit=(key:keyof Person)=>(next:string)=>set({...value,[key]:next});
  return <section className="form-section"><h3>{title}</h3><div className="form-grid">
    <Field label="First Name" required value={value.first_name} set={edit('first_name')} error={errors.first_name}/><Field label="Middle Name" value={value.middle_name} set={edit('middle_name')}/><Field label="Last Name" required value={value.last_name} set={edit('last_name')} error={errors.last_name}/>
    <label className="field"><span>Gender *</span><select value={value.gender} onChange={event=>edit('gender')(event.target.value)}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
    <Field label="Date of Birth" required type="date" value={value.date_of_birth} set={edit('date_of_birth')} error={errors.date_of_birth}/><Field label="Age" value={age(value.date_of_birth)} set={()=>{}}/><Field label="Contact Number" required value={value.contact_number} set={edit('contact_number')} error={errors.contact_number}/>
  </div><h4>Address</h4><div className="form-grid"><Field label="House/Building Number" value={value.house_building_number} set={edit('house_building_number')}/><Field label="Street" value={value.street} set={edit('street')}/><Field label="Barangay" required value={value.barangay} set={edit('barangay')}/><Field label="City/Municipality" required value={value.city_municipality} set={edit('city_municipality')}/><Field label="Region" required value={value.region} set={edit('region')}/></div></section>;
}
