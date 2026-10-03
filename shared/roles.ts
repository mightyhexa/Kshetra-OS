import { UserPersona, UserRole } from './types';

export const PERSONAS: Record<UserRole, UserPersona> = {
  citizen: {
    id: 'CITIZEN-KA-118',
    fullName: 'Rajesh K. Verma',
    role: 'citizen',
    aadhaarMasked: 'XXXX-XXXX-9182',
    designation: 'Citizen / Landholder',
    jurisdictionDistrict: 'Bengaluru Urban',
    jurisdictionState: 'Karnataka'
  },
  officer: {
    id: 'OFFICER-KA-09',
    fullName: 'Anil Kumar Sharma',
    role: 'officer',
    designation: 'Tahsildar & Executive Magistrate',
    officerBadgeId: 'KA-REV-2026-081',
    jurisdictionDistrict: 'Bengaluru East',
    jurisdictionState: 'Karnataka'
  },
  policy_admin: {
    id: 'ADMIN-NSDI-01',
    fullName: 'Dr. Sunita Deshmukh, IAS',
    role: 'policy_admin',
    designation: 'Joint Secretary (Land Governance DPI)',
    officerBadgeId: 'IAS-GOI-2012-404',
    jurisdictionDistrict: 'National NSDI Directorate',
    jurisdictionState: 'Government of India'
  }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Citizen User',
  officer: 'Land Officer (Tahsildar)',
  policy_admin: 'Policy Administrator'
};

export function isOfficerOrAdmin(role: UserRole): boolean {
  return role === 'officer' || role === 'policy_admin';
}
