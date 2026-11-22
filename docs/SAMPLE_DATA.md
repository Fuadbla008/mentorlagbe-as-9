# Adding sample data to MongoDB

MongoDB is empty on a fresh deployment. You have two safe options.

## Option A — recommended: seed through the API

The seeder uses the same public endpoints as the UI, so the documents always match the backend schema and passwords are hashed by the server.

```bash
npm run seed:sample
```

Override the backend if needed:

```bash
API_URL=http://localhost:5000/api npm run seed:sample
SAMPLE_PASSWORD='YourOwnStrongPassword' npm run seed:sample
```

The script is idempotent: if an email already exists it signs in instead of failing. It creates:

- 3 tutor accounts
- 4 student accounts
- 6 tuitions (submitted as `pending`)

Sample logins (default password `Sample@12345`):

| Role | Email |
| --- | --- |
| Tutor | `sadia@mentorlagbe.com` |
| Tutor | `rahmat@mentorlagbe.com` |
| Tutor | `tanvir@mentorlagbe.com` |
| Student | `ayesha@example.com` |
| Student | `rakib@example.com` |

The script does **not** create an admin. Create one as described in [SETUP_GUIDE.md](./SETUP_GUIDE.md#4-creating-an-admin-account), then approve the pending tuitions at `/dashboard/admin/tuitions`.

> If `POST /tuitions` returns an error about a missing field or plan, that field is enforced by your backend version. Open `scripts/seed-sample-data.mjs`, adjust the payload, and re-run — existing emails are reused.

---

## Option B — direct MongoDB inserts

Use this only if you are comfortable with your backend's Mongoose schema. Collection names below are the common defaults; verify them against the server models before running.

```js
use <your database name>

db.users.insertMany([
  {
    name: "Sadia Karim",
    email: "sadia@mentorlagbe.com",
    // password MUST be a hash produced by the server's bcrypt/argon2 config.
    // Plain text will not work. Prefer Option A so the server hashes it.
    role: "tutor",
    plan: "free",
    createdAt: new Date()
  }
])
```

Because password hashing is server-specific, direct inserts are only practical for **tuitions** once a tutor account exists:

```js
db.tuitions.insertMany([
  {
    title: "HSC Mathematics — Complete Course",
    subject: "Mathematics",
    classLevel: "HSC",
    mode: "Online",
    location: "Dhaka",
    monthlyFee: 2500,
    daysPerWeek: 4,
    bannerImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    description: "Weekly tests, past-paper practice and personal feedback.",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date()
  }
])
```

Add the tutor owner fields (`tutor`, `tutorEmail`, `tutorName`, etc.) exactly as your `Tuition` model declares them — otherwise the API will not show the listing. **Option A avoids this guesswork entirely.**

---

## Removing sample data

Sign in as admin and delete tuitions from `/dashboard/tutor/my-tuitions` (per tutor) or moderate them from `/dashboard/admin/tuitions`. To remove everything:

```js
use <your database name>
db.tuitions.deleteMany({ email: /@mentorlagbe\.com|@example\.com/ })
db.applications.deleteMany({})
db.bookmarks.deleteMany({})
db.users.deleteMany({ email: /@mentorlagbe\.com|@example\.com/ })
```

Replace the filters with the actual field names from your server models. Always take a backup before bulk deletes.
