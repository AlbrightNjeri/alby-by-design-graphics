# Alby by Design Graphics — Backend

Node.js + Express + PostgreSQL backend for the Alby by Design portfolio site.

---

## Folder Structure

```
your-project/
├── index.html          ← Frontend (untouched)
├── styles.css
├── script.js
├── images/
├── backend/
│   ├── server.js           ← Express entry point
│   ├── package.json
│   ├── .env                ← Your secrets (never commit this)
│   ├── .env.example        ← Template
│   ├── db/
│   │   ├── pool.js         ← PostgreSQL connection pool
│   │   └── schema.sql      ← Run once to create tables
│   ├── routes/
│   │   ├── auth.js         ← POST /api/login
│   │   ├── projects.js     ← CRUD /api/projects
│   │   ├── contact.js      ← POST /api/contact + /api/inquiries
│   │   └── upload.js       ← POST /api/upload (R2)
│   └── middleware/
│       └── auth.js         ← JWT verification
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted — Neon, Railway, Supabase DB, etc.)
- A Cloudflare R2 bucket with a public domain enabled

---

## Step-by-Step Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create your .env file

```bash
cp .env.example .env
```

Edit `.env` with real values:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/alby_design
PORT=3000
JWT_SECRET=some_long_random_string_at_least_32_chars

CLOUDFLARE_R2_ACCESS_KEY=your_key_id
CLOUDFLARE_R2_SECRET_KEY=your_secret
CLOUDFLARE_R2_BUCKET=alby-design
CLOUDFLARE_R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-XXXXXXXX.r2.dev

ADMIN_SEED_SECRET=any_private_phrase_to_protect_first_admin_creation
FRONTEND_ORIGIN=https://yourdomain.com
```

### 3. Create the PostgreSQL database

```bash
createdb alby_design
# or via psql:
psql -c "CREATE DATABASE alby_design;"
```

### 4. Run the schema

```bash
psql $DATABASE_URL -f db/schema.sql
```

### 5. Create your admin account

With the server running, make this one-time request:

```bash
curl -X POST http://localhost:3000/api/register-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"albrightnjeri@gmail.com","password":"YourStrongPass1!","secret":"your_ADMIN_SEED_SECRET"}'
```

Once your admin exists, you can remove or comment out the `/register-admin` route.

### 6. Start the server

```bash
# Development (auto-restarts on change)
npm run dev

# Production
npm start
```

Visit `http://localhost:3000` — the frontend loads and all API calls go to the same origin.

---

## Cloudflare R2 Setup

1. Go to Cloudflare dashboard → R2 → Create bucket (e.g. `alby-design`)
2. Under bucket settings, enable **Public Access** and copy the public URL
3. Under **R2 API Tokens**, create a token with **Object Read & Write** on your bucket
4. Copy the Access Key ID and Secret — paste into `.env`
5. Your endpoint is: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## API Reference

### Public Endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | All projects (newest first) |
| GET | `/api/projects/:id` | Single project |
| POST | `/api/contact` | Submit contact form |

### Admin Endpoints (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | Get JWT token |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/inquiries` | All contact submissions |
| PATCH | `/api/inquiries/:id` | Update inquiry status |
| DELETE | `/api/inquiries/:id` | Delete inquiry |
| POST | `/api/upload` | Upload image to R2 |
| DELETE | `/api/upload` | Delete image from R2 |

---

## Example API Responses

### GET /api/projects
```json
[
  {
    "id": 1,
    "title": "Glow Skincare Co.",
    "category": "branding",
    "description": "Complete brand identity for a premium Nairobi-based skincare startup.",
    "image_url": "https://pub-xxx.r2.dev/portfolio/1720000000000-abc123.jpg",
    "video_url": null,
    "project_url": null,
    "featured": true,
    "created_at": "2024-11-01T10:30:00.000Z"
  }
]
```

### POST /api/contact
Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Bloom Studio",
  "subject": "brand-identity",
  "budget": "15k-50k",
  "message": "I need a full brand identity for my new skincare line."
}
```
Response `201`:
```json
{ "success": true, "id": 5 }
```

### POST /api/login
```json
{ "email": "albrightnjeri@gmail.com", "password": "YourStrongPass1!" }
```
Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": { "id": 1, "email": "albrightnjeri@gmail.com" }
}
```

### POST /api/upload (multipart/form-data, field: "image")
Response:
```json
{
  "url": "https://pub-xxx.r2.dev/portfolio/1720000000000-abc123.jpg",
  "key": "portfolio/1720000000000-abc123.jpg"
}
```

### PATCH /api/inquiries/:id
```json
{ "status": "contacted" }
```
Returns the updated inquiry row.

---

## Using the Admin API

```bash
# 1. Login and grab your token
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@email.com","password":"yourpass"}' | jq -r .token)

# 2. Upload an image
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/glow.jpg"

# 3. Create a project (using the returned URL)
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Glow Skincare Co.",
    "category": "branding",
    "description": "Premium brand identity for a Nairobi skincare startup.",
    "image_url": "https://pub-xxx.r2.dev/portfolio/glow.jpg",
    "featured": true
  }'
```

---

## Deployment Notes

- Set `NODE_ENV=production` in your hosting environment
- Use a process manager like **PM2**: `pm2 start server.js --name alby-backend`
- Or deploy directly to **Railway**, **Render**, or **Fly.io** — they auto-detect `npm start`
- Add all `.env` vars to your host's environment config panel
- For SSL in production, put Nginx or Cloudflare in front
