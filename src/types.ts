export type Person = {
  id?: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  contact_number: string;
  house_building_number: string;
  street: string;
  barangay: string;
  city_municipality: string;
  region: string;
  role?: 'complainant' | 'respondent';
};

export type Case = {
  id?: number;
  case_number: string;
  status: 'Active' | 'Settled' | 'Unsettled';
  nature_of_case: string;
  case_description: string;
  place_of_incident: string;
  date_of_incident: string;
  time_of_incident: string;
  date_of_lupon_hearing: string;
  complainant: Person;
  respondent: Person;
  created_at?: string;
  updated_at?: string;
};

export type CaseLog = {
  id: number;
  case_id: number;
  log_type: 'Case Filed' | 'Hearing Scheduled' | 'Lupon Hearing' | 'Mediation' | 'Settlement Discussion' | 'Follow-up' | 'Agreement / Settlement' | 'Other';
  title: string;
  description: string;
  log_date: string;
  log_time: string;
  next_action?: string;
  next_action_date?: string;
  status_after?: Case['status'];
  created_by?: string;
  created_at: string;
  updated_at?: string;
};

export const age = (dob: string) => {
  if (!dob) return '—';

  const d = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();

  if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) {
    a--;
  }

  return String(a);
};
