import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import type { Case, CaseLog, Person } from '../types';
import { age } from '../types';
import { name } from './case-utils';

export const reportTemplateMap: Record<string, string> = {
  'Affidavit':'/templates/affidavit.docx','Agreement for Arbitration':'/templates/agreement-for-arbitration.docx','Amicable Settlement':'/templates/amicable-settlement.docx','Arbitration Award':'/templates/arbitration-award.docx','Case History Report':'/templates/case-history-report.docx','Certificate to Bar Action':'/templates/certificate-to-bar-action.docx','Certificate to File Action':'/templates/certificate-to-file-action.docx','Certification':'/templates/certification.docx','Complaint':'/templates/complaint.docx','List of Pangkat':'/templates/list-of-pangkat.docx','Notice of Appointment':'/templates/notice-of-appointment.docx','Notice of Hearing':'/templates/notice-of-hearing.docx','Notice to Constitute the Lupon':'/templates/notice-to-constitute-the-lupon.docx','Notice to Constitute the Pangkat':'/templates/notice-to-constitute-the-pangkat.docx','Oath of Lupon Member':'/templates/oath-of-lupon-member.docx','Official Letter':'/templates/official-letter.docx','Subpoena':'/templates/subpoena.docx','Summons':'/templates/summons.docx',
};

export type TemplateCaseData = {
  case_number:string; nature_of_case:string; case_description:string; place_of_incident:string; date_of_incident:string; time_of_incident:string; date_of_lupon_hearing:string; status:string;
  complainant: ReturnType<typeof personData>; respondent: ReturnType<typeof personData>;
  case_logs: { date:string; time:string; created_by:string; content:string; type:string }[];
};
const personData=(person:Person)=>({first_name:person.first_name,middle_name:person.middle_name,last_name:person.last_name,full_name:name(person),gender:person.gender,date_of_birth:person.date_of_birth,age:age(person.date_of_birth),contact_number:person.contact_number,house_building_number:person.house_building_number,street:person.street,barangay:person.barangay,city_municipality:person.city_municipality,region:person.region});
export const buildTemplateCaseData=(caseItem:Case,logs:CaseLog[]):TemplateCaseData=>({case_number:caseItem.case_number,nature_of_case:caseItem.nature_of_case,case_description:caseItem.case_description,place_of_incident:caseItem.place_of_incident,date_of_incident:caseItem.date_of_incident,time_of_incident:caseItem.time_of_incident,date_of_lupon_hearing:caseItem.date_of_lupon_hearing,status:caseItem.status,complainant:personData(caseItem.complainant),respondent:personData(caseItem.respondent),case_logs:logs.map(log=>({date:log.log_date,time:log.log_time,created_by:log.created_by||'',content:log.description,type:log.log_type}))});
export const fillDocxTemplate=(template:ArrayBuffer,data:TemplateCaseData)=>{const zip=new PizZip(template);const doc=new Docxtemplater(zip,{paragraphLoop:true,linebreaks:true});doc.render(data);return doc.getZip().generate({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});};
