# Security

## Threat model

| Risk | Mitigation |
|---|---|
| A citizen enters real Aadhaar or PAN data | Masked, read-only synthetic examples and repeated warnings; no verification or transmission |
| XSS through user input | React escaping; no raw HTML or dynamic script execution |
| Malicious upload | Uploads are simulated; no file is executed, parsed, or sent externally |
| API-key exposure | No secret or server integration exists |
| Misleading official branding | Persistent prototype disclosure; no emblems or government logos |
| Shared-computer persistence | Only demo data is allowed; privacy guidance explains clearing browser data |
| AI data leakage | Assistant content is local and deterministic; identity, OTP, file, and payment data is never sent |
| Payment confusion | Test-payment labels, synthetic amounts, and explicit “No money will be charged” copy |

Security headers disable framing, MIME sniffing, sensitive browser permissions, and unsafe referrer leakage. Real sensitive data must never be used in this repository.
