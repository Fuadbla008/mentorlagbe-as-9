/**
 * Seeds sample users and tuitions into the live MongoDB through the Express API.
 * This is safe: it uses the same public endpoints as the UI, so documents always
 * match the backend schema and passwords are hashed by the server.
 *
 * Usage:
 *   API_URL=https://mentorlagbe-as-9-server.onrender.com/api npm run seed:sample
 *
 * Existing emails are reused (sign-in instead of sign-up), so the script is
 * idempotent. It does NOT create an admin — promote an account in MongoDB.
 */

const API_URL = (process.env.API_URL || "https://mentorlagbe-as-9-server.onrender.com/api").replace(/\/$/, "");
const PASSWORD = process.env.SAMPLE_PASSWORD || "Sample@12345";

const TUTORS = [
  { name: "Sadia Karim", email: "sadia@mentorlagbe.com", phone: "+8801711000001", bio: "HSC Mathematics tutor with 8 years of experience." },
  { name: "Rahmatullah Amin", email: "rahmat@mentorlagbe.com", phone: "+8801711000002", bio: "Physics and chemistry mentor, focused on exam technique." },
  { name: "Tanvir Rahman", email: "tanvir@mentorlagbe.com", phone: "+8801711000003", bio: "Full-stack developer teaching practical web development." },
];

const STUDENTS = [
  { name: "Ayesha Siddika", email: "ayesha@example.com", role: "student" },
  { name: "Rakibul Islam", email: "rakib@example.com", role: "student" },
  { name: "Jannatul Ferdous", email: "jannat@example.com", role: "student" },
  { name: "Mehedi Hasan", email: "mehedi@example.com", role: "student" },
];

const TUITIONS = [
  { tutor: 0, title: "HSC Mathematics — Complete Course", subject: "Mathematics", classLevel: "HSC", mode: "Online", location: "Dhaka", monthlyFee: 2500, daysPerWeek: 4, description: "A complete HSC mathematics course with weekly tests, past-paper practice and personal feedback." },
  { tutor: 0, title: "Higher Mathematics Problem Solving", subject: "Mathematics", classLevel: "HSC", mode: "Offline", location: "Dhaka", monthlyFee: 3000, daysPerWeek: 3, description: "Advanced problem-solving drills for students aiming for top grades." },
  { tutor: 1, title: "HSC Physics Masterclass", subject: "Physics", classLevel: "HSC", mode: "Online", location: "Chattogram", monthlyFee: 2800, daysPerWeek: 3, description: "Concept clarity, derivation techniques and board-exam preparation." },
  { tutor: 1, title: "Chemistry for HSC", subject: "Chemistry", classLevel: "HSC", mode: "Online", location: "Chattogram", monthlyFee: 2600, daysPerWeek: 3, description: "Organic and inorganic chemistry made simple with guided practice." },
  { tutor: 2, title: "Full-Stack Web Development", subject: "Programming", classLevel: "University", mode: "Online", location: "Remote", monthlyFee: 6000, daysPerWeek: 2, description: "Learn React, Next.js, Node.js and MongoDB by building real projects." },
  { tutor: 2, title: "JavaScript Fundamentals", subject: "Programming", classLevel: "University", mode: "Online", location: "Remote", monthlyFee: 3500, daysPerWeek: 2, description: "A gentle but thorough introduction to modern JavaScript." },
];

const BANNERS = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
];

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

async function ensureAccount(account, role) {
  const created = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ ...account, role, password: PASSWORD }),
  });
  if (created.ok) return created.body?.token;

  const signedIn = await request("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email: account.email, password: PASSWORD }),
  });
  if (signedIn.ok) return signedIn.body?.token;

  throw new Error(`${account.email}: ${signedIn.body?.message || created.body?.message || "unknown error"}`);
}

async function main() {
  console.log(`Seeding ${API_URL}\n`);

  for (const account of STUDENTS) {
    await ensureAccount(account, "student");
    console.log(`  student  ${account.email}`);
  }

  const tokens = [];
  for (const account of TUTORS) {
    const token = await ensureAccount({ name: account.name, email: account.email }, "tutor");
    tokens.push(token);
    console.log(`  tutor    ${account.email}`);
  }

  let created = 0;
  for (const [index, tuition] of TUITIONS.entries()) {
    const result = await request("/tuitions", {
      method: "POST",
      token: tokens[tuition.tutor],
      body: JSON.stringify({
        title: tuition.title,
        subject: tuition.subject,
        classLevel: tuition.classLevel,
        mode: tuition.mode,
        location: tuition.location,
        monthlyFee: tuition.monthlyFee,
        daysPerWeek: tuition.daysPerWeek,
        bannerImage: BANNERS[index % BANNERS.length],
        description: tuition.description,
      }),
    });
    if (result.ok) created += 1;
    console.log(`  tuition  ${tuition.title} -> ${result.status} ${result.body?.message || ""}`);
  }

  console.log(`\nDone. ${created} tuition(s) submitted for admin approval.`);
  console.log("Log in as a tutor and approve them from /dashboard/admin after promoting an account to admin.");
}

main().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
});
