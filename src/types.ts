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
