import { logAuditEvent } from '@/lib/audit'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuditEvent, AuditLogger } from '../application/ports'

/** Writes training events to the platform's existing audit_logs table. */
export class AuditLogAdapter implements AuditLogger {
  constructor(
    private readonly client: SupabaseClient,
    private readonly requestHeaders: Headers,
  ) {}

  async log(event: AuditEvent): Promise<void> {
    await logAuditEvent(this.client, this.requestHeaders, event)
  }
}
