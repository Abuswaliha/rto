# Future Architecture

Citizen Browser → Next.js frontend → secure API gateway → application, identity, notification, appointment, and payment services → authorized government integrations.

A production design would require encryption in transit and at rest, explicit consent records, least-privilege RBAC, tamper-evident audit logs, approved identity verification, secrets management, rate limits, fraud controls, payload-safe observability, DPDP-compliant minimization and retention, incident response, backups, disaster recovery, and periodic security/accessibility audits. Logs must never contain identity, document, OTP, or payment payloads.

These are future concepts only. This prototype intentionally contains no such integration.
