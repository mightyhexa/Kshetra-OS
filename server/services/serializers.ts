import { Parcel, UserRole } from '../../shared/types';
import { isOfficerOrAdmin } from '../../shared/roles';

/**
 * Strips sensitive banking and judicial fields when role is 'citizen'.
 * For citizens, these keys are physically absent from the returned JSON.
 */
export function serializeParcel(parcel: Parcel, role: UserRole): Partial<Parcel> {
  // Deep clone to prevent mutating internal storage
  const cloned: Parcel = JSON.parse(JSON.stringify(parcel));

  if (isOfficerOrAdmin(role)) {
    return cloned;
  }

  // Role: Citizen -> Strip restricted fields
  // 1. Encumbrance: strip mortgageDetails, courtCaseNumber, stayOrderDetails
  delete cloned.encumbrance.mortgageDetails;
  delete cloned.encumbrance.courtCaseNumber;
  delete cloned.encumbrance.stayOrderDetails;

  if (cloned.encumbrance.disputeFlag) {
    cloned.encumbrance.disputeReason = 'Dispute notice registered on record. Access detailed judicial dockets via Land Officer.';
  }

  // 2. Ownership: strip co-owner names and private details
  delete cloned.ownership.coOwners;

  // 3. Financial institution charges: remove CERSAI banking charges completely
  delete cloned.cersaiCharges;

  return cloned;
}

/**
 * Deep scan utility to verify no forbidden keys exist in a citizen response.
 * Used by unit tests and internal sanity assertions.
 */
export function scanForForbiddenCitizenKeys(obj: unknown): string[] {
  const forbidden = [
    'mortgagedetails',
    'courtcasenumber',
    'stayorderdetails',
    'coowners',
    'cersaicharges',
    'aadhaar',
    'aadhaarmasked'
  ];
  const violations: string[] = [];

  function recurse(val: unknown, currentPath: string) {
    if (!val || typeof val !== 'object') return;

    if (Array.isArray(val)) {
      val.forEach((item, idx) => recurse(item, `${currentPath}[${idx}]`));
      return;
    }

    for (const [key, propVal] of Object.entries(val as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (forbidden.includes(lowerKey) && propVal !== undefined) {
        violations.push(`${currentPath}.${key}`);
      }
      recurse(propVal, `${currentPath}.${key}`);
    }
  }

  recurse(obj, 'root');
  return violations;
}
