# TechKraft Real Estate - Assessment Submission

Hey team! Here is my submission for the Mid-level Full-Stack Engineer assessment. I've built out the core property listing backbone exactly as requested.

I decided to run with Next.js 16 (App Router) since it handles both frontend and API routes smoothly. Everything is tied to a PostgreSQL database (I used Neon DB while building this).

## What I've implemented:
- **Backend API**: Created RESTful endpoints for `/listings` (with filters) and `/listings/[id]` (for returning details).
- **Frontend**: A minimal, functional property search page. I tailored the design to mirror local Nepali real estate formats (using NPR formatting, Lakhs/Crores, and local cities).
- **Database**: We have two core tables (`properties` and `agents`). I also threw in some indexing on `suburb`, `price`, and `property_type` just to ensure things scale fine if the table gets massive.
- **The "Admin" Role Requirement**: Instead of doing a heavy full auth setup (which felt like overkill for a take-home exam), I simulated a server-side admin check via HTTP headers. Toggling "Admin Mode" on the frontend sends an `x-user-role: admin` header to the backend API, unlocking the protected `internal_status_notes` data.
- **Unit Tests**: Wrote a couple of vitest specs over the endpoints to verify exactly that securely.

---

## How to get this running locally

**1. Setup your database**
Just create a `.env.local` file at the root. You'll need to drop in a standard Postgres string:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname?sslmode=require"
```

**2. Install everything**
```bash
npm install
```

**3. Seed the dummy data**
I wrote a quick script to drop old tables, recreate them, and dump some realistic mock properties into the DB so you don't have to test with an empty screen. Highly recommend running this!
```bash
npm run seed
```

**4. Spin it up**
```bash
npm run dev
```
Then just navigate to `http://localhost:3000`.

## Testing
If you want to verify the API role logic works safely, I set up Vitest. Just execute:
```bash
npm run test
```

## Example Raw API Calls
If you prefer testing endpoints manually via terminal:

*Search for properties over 1.5 CR in Kathmandu:*
```bash
curl "http://localhost:3000/api/listings?suburb=Kathmandu&type=House&price=15000000-"
```

*Fetch details as a normal user (won't return internal team notes):*
```bash
curl "http://localhost:3000/api/listings/1"
```

*Fetch details pretending to be an admin (returns extra metadata):*
```bash
curl -H "x-user-role: admin" "http://localhost:3000/api/listings/1"
```

Let me know if you run into any issues setting it up!
