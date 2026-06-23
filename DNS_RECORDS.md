# DNS Records Reference — parishva.in

To configure email authentication and protect your domain against spoofing, add the following TXT records to your DNS provider (e.g., Cloudflare, GoDaddy, Namecheap).

---

## 1. DMARC Record (Requested)
DMARC (Domain-based Message Authentication, Reporting, and Conformance) checks SPF and DKIM signatures to verify email authenticity.

| Type | Host / Name | Value / Content | Purpose |
| :--- | :--- | :--- | :--- |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; pct=100; rua=mailto:dmarc-reports@parishva.in` | **Monitor Only:** Receives reports at `dmarc-reports@parishva.in` without rejecting emails. |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@parishva.in` | **Quarantine:** Sends failing emails to spam/quarantine folder. |
| **TXT** | `_dmarc` | `v=DMARC1; p=reject; pct=100; rua=mailto:dmarc-reports@parishva.in` | **Strict Reject:** Blocks failing emails completely from delivery. |

> [!TIP]
> Start with the **Monitor Only (`p=none`)** record first to collect reports for a few weeks and ensure legitimate emails (like Firebase Auth or newsletters) aren't failing authentication. Once verified, change the policy to `p=quarantine` or `p=reject`.

---

## 2. SPF Record (Recommended Companion)
Sender Policy Framework defines which mail servers are authorized to send email on behalf of your domain.

If you send emails via **Google Workspace**, the record is:
*   **Type:** `TXT`
*   **Host / Name:** `@`
*   **Value:** `v=spf1 include:_spf.google.com ~all`

If you also send emails using **Firebase / Mailgun**, you will need to merge them:
*   **Value:** `v=spf1 include:_spf.google.com include:mailgun.org ~all`

---

## 3. DKIM Record (Recommended Companion)
DomainKeys Identified Mail adds a cryptographic signature to emails. This record must be generated directly from your email workspace provider (e.g., Google Workspace Admin Console or Mailgun Console).

*   **Type:** `TXT`
*   **Host / Name:** `google._domainkey` (or selector name provided by host)
*   **Value:** `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...[YOUR_KEY]`
