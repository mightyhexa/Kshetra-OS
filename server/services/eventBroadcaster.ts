import { Response } from 'express';
import { UserRole } from '../../shared/types';
import { serializeLedgerBlock } from './serializers';

export type SystemEventType = 'LEDGER_BLOCK' | 'REQUEST_STATUS' | 'PING' | 'NOTIFICATION';

export interface SystemEventPayload {
  type: SystemEventType;
  timestamp: string;
  data: unknown;
}

export interface SubscriberUser {
  id: string;
  role: UserRole;
  fullName: string;
}

class EventBroadcaster {
  private clients: Map<Response, SubscriberUser> = new Map();

  public subscribe(res: Response, user?: SubscriberUser): void {
    const subscriber: SubscriberUser = user || {
      id: 'default-subscriber',
      role: 'officer',
      fullName: 'Default Subscriber'
    };
    this.clients.set(res, subscriber);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(type: SystemEventType, data: unknown): void {
    const timestamp = new Date().toISOString();

    for (const [client, user] of this.clients.entries()) {
      try {
        const role = user?.role || 'officer';
        const clientPayloadData = this.filterPayloadForUser(data, role);
        const payload: SystemEventPayload = {
          type,
          timestamp,
          data: clientPayloadData
        };
        const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
        client.write(message);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  /**
   * Filters and strips sensitive judicial, banking, and officer remarks for citizen subscribers.
   */
  public filterPayloadForUser(data: unknown, role: UserRole): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const cloned = JSON.parse(JSON.stringify(data));

    if (role !== 'citizen') {
      return cloned;
    }

    // Citizen role: recursively strip forbidden keys
    const forbiddenKeys = [
      'courtcasenumber',
      'courtdocket',
      'courtcase',
      'courtnumber',
      'stayorderdetails',
      'stayorder',
      'mortgagedetails',
      'loandetails',
      'loan',
      'bankdetails',
      'bankname',
      'bankaccount',
      'chargeamount',
      'officerremarks',
      'internalremarks',
      'cersaicharges',
      'coowners',
      'aadhaar',
      'aadhaarmasked'
    ];

    const sanitize = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(item => sanitize(item));
        return;
      }

      // If it has block structure
      if (obj.action && obj.blockIndex !== undefined && obj.hash) {
        const serializedBlock = serializeLedgerBlock(obj, 'citizen');
        Object.keys(obj).forEach(k => delete obj[k]);
        Object.assign(obj, serializedBlock);
      }

      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        if (forbiddenKeys.includes(lowerKey)) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }

      // If remarks exist and contain sensitive officer prefixes
      if (typeof obj.remarks === 'string' && (
        obj.remarks.toLowerCase().includes('officer') ||
        obj.remarks.toLowerCase().includes('stay order') ||
        obj.remarks.toLowerCase().includes('mortgage') ||
        obj.remarks.toLowerCase().includes('court')
      )) {
        obj.remarks = 'Application status updated in accordance with statutory procedures.';
      }
    };

    sanitize(cloned);
    return cloned;
  }

  public getSubscriberCount(): number {
    return this.clients.size;
  }
}

export const eventBroadcaster = new EventBroadcaster();
