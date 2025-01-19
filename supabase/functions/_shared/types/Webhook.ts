export type WebhookType = 'UPDATE' | 'INSERT' | 'DELETE';

export interface WebhookPayload<T = any> {
    type: WebhookType;
    table: string;
    record: T;
    schema: string;
    old_record?: T;
} 