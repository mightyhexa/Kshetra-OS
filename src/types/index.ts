/**
 * Land Stack (SIH26014) - Core Data Types & Schemas
 * Re-exports canonical shared types from /shared
 */

export * from '../../shared/types';
export * from '../../shared/roles';
export * from '../../shared/ulpin';

// Compatibility aliases for legacy component typings
export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: import('../../shared/types').UserRole;
  aadhaarMasked?: string;
  designation?: string;
  department?: string;
  jurisdictionState?: string;
  jurisdictionDistrict?: string;
  officerBadgeId?: string;
}

export interface AdminAnalyticsSummary {
  totalParcelsIndexed: number;
  totalStatesCovered: number;
  totalDistrictsCovered: number;
  activeDisputeCount: number;
  flaggedParcelsCount: number;
  totalServiceRequests: number;
  pendingReviewCount: number;
  crossVerifiedCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalAuditBlocks: number;
  averageTurnaroundDays: number;
}
