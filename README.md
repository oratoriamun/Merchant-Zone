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
  - Secure credential-based login (Username: `admin`, Default Password: `Rocky@22` or customized via `ADMIN_INITIAL_PASSWORD`).
  - Dashboard stats & metrics.
  - Order review with payment screenshot lightbox preview and UTR checking.
  - Change payment status (`RECEIVED`, `REJECTED`, `PENDING`) and order lifecycle status (`PROCESSING`, `COMPLETED`, `CANCELLED`).
  - Replaceable payment QR in Admin Settings (`/admin/settings`). Custom uploaded QRs persist on persistent disk.
  - Service catalog management (pricing & active status toggling).
  - Immutable audit logs (`/admin/audit`).

---

## Production Deployment on Render

### Why Persistent Disk is Required
Render containers use an ephemeral filesystem by default (local disk is wiped upon restart or redeploy). To ensure orders, settings, custom QR codes, and customer payment screenshots remain permanently saved, this project is configured to store all persistent data on a Render **Persistent Disk** mounted at `/var/data`:
- SQLite Database: `/var/data/merchant_zone.db`
- Uploaded Proofs & QR: `/var/data/uploads`

*(Render Persistent Disks are supported on the Starter web service plan or above).*

---

### Method A: Deploy via Blueprint (Fastest & Automated)

1. Fork or push this repository to your GitHub account: `https://github.com/oratoriamun/Merchant-Zone`.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect the `Merchant-Zone` repository.
5. Render reads `render.yaml` and will automatically configure:
   - Node Web Service
   - Persistent Disk (`merchant-zone-data` at `/var/data`, 1 GB)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Generated `SESSION_SECRET`
6. Enter the required secret values when prompted (`ADMIN_INITIAL_PASSWORD` and `NEXT_PUBLIC_BASE_URL`).
7. Click **Apply**.

---

### Method B: Deploy Manually as a Web Service

1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select your repository: `https://github.com/oratoriamun/Merchant-Zone`.
3. Configure the following service settings:
   - **Name**: `merchant-zone` (or your choice)
   - **Region**: Choose closest to your users (e.g., Oregon, Singapore, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime / Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Plan**: `Starter` (Required for attaching a Persistent Disk)

4. **Add Persistent Disk**:
   - Scroll down to **Disks** section (or click **Add Disk**).
   - **Name**: `merchant-zone-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (or more as desired)

5. **Set Environment Variables**:
   Under **Environment Variables**, add the following keys and values:

   | Key | Recommended Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & secure cookies |
   | `DATABASE_PATH` | `/var/data/merchant_zone.db` | Saves SQLite DB on persistent disk |
   | `UPLOAD_DIR` | `/var/data/uploads` | Saves screenshots & custom QR on persistent disk |
   | `MAX_FILE_SIZE` | `5242880` | Maximum upload size (5MB in bytes) |
   | `SESSION_SECRET` | *(32+ char random string)* | Secret for encrypting admin session cookies |
   | `ADMIN_USERNAME` | `admin` | Initial admin username |
   | `ADMIN_INITIAL_PASSWORD` | `YourSecurePassword!` | Initial admin password for first login |
   | `NEXT_PUBLIC_BASE_URL` | `https://merchant-zone.onrender.com` | Your Render service URL (without trailing slash) |

   *(Note: Render automatically injects `PORT` into the container. Next.js automatically detects `process.env.PORT` and binds to `0.0.0.0` automatically).*

6. Click **Create Web Service**.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Build project
npm run build

# 4. Start production server
npm run start

# Or start in development mode
npm run dev
```
Access at [http://localhost:3000](http://localhost:3000).
Admin panel is available at [http://localhost:3000/admin](http://localhost:3000/admin).
