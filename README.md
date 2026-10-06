# MERCHANT ZONE — Digital Payment & Banking Solutions Portal

Official production portal for **MERCHANT ZONE**.

## Features

- **Customer Portal**:
  - Full catalog of 28 merchant, wallet, savings, current account, and agent onboarding services.
  - Working dynamic "Apply Now" buttons carrying service details & pricing.
  - Interactive onboarding documents guide (Aadhaar, PAN, Bank details).
  - Integrated BharatPe UPI payment QR with 1-click copy for UPI ID (`BHARATPE2L0X0O7J8C90743@unitype`).
  - UTR / Transaction reference verification and screenshot upload.
  - Instant Order ID generation (e.g. `ORD-2026-XXXXXX`).
  - Real-time customer order tracking at `/track`.

- **Admin Management Panel (`/admin`)**:
  - Secure credential-based login (Username: `admin`, Default Password: `Rocky@22`).
  - Dashboard stats & metrics.
  - Order review with payment screenshot lightbox preview and UTR checking.
  - Change payment status (`RECEIVED`, `REJECTED`, `PENDING`) and order lifecycle status (`PROCESSING`, `COMPLETED`, `CANCELLED`).
  - Replaceable payment QR in Admin Settings (`/admin/settings`).
  - Service catalog management (pricing & active status toggling).
  - Immutable audit logs (`/admin/audit`).

## Running Locally

```bash
# Build
npm run build

# Start production server
npm run start

# Or development server
npm run dev
```
