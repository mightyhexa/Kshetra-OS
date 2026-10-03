import { Response } from 'express';

export type SystemEventType = 'LEDGER_BLOCK' | 'REQUEST_STATUS' | 'PING';

export interface SystemEventPayload {
  type: SystemEventType;
  timestamp: string;
  data: unknown;
}

class EventBroadcaster {
  private clients: Set<Response> = new Set();

  public subscribe(res: Response): void {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(type: SystemEventType, data: unknown): void {
    const payload: SystemEventPayload = {
      type,
      timestamp: new Date().toISOString(),
      data
    };
    const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(message);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  public getSubscriberCount(): number {
    return this.clients.size;
  }
}

export const eventBroadcaster = new EventBroadcaster();
