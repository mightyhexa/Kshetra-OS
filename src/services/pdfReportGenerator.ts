import { Parcel, UserRole } from '../types';
import { apiClient } from './apiClient';

/**
 * Downloads the official, role-masked, and cryptographic ledger-anchored
 * Cadastral Dossier PDF directly from the KSHETRA OS backend server.
 */
export async function generateParcelPdfReport(parcel: Parcel, _userRole: UserRole = 'citizen'): Promise<void> {
  try {
    const blob = await apiClient.downloadDossierPdf(parcel.ulpin);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BhuAadhaar_Dossier_${parcel.ulpin}_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download official dossier PDF:', err);
    throw err;
  }
}

export const downloadServerDossierPdf = async (parcelOrUlpin: Parcel | string, _userRole?: UserRole): Promise<void> => {
  const ulpin = typeof parcelOrUlpin === 'string' ? parcelOrUlpin : parcelOrUlpin.ulpin;
  const blob = await apiClient.downloadDossierPdf(ulpin);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BhuAadhaar_Dossier_${ulpin}_${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
