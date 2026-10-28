# StaffSync — Modern Human Resource Management Solution

StaffSync is an enterprise-grade, clean, and reliable Human Resource Management System (HRMS) built on the MERN stack (MongoDB, Express.js, React, Node.js). It streamlines core organizational processes across three distinct role levels: **HR Personnel**, **Team Managers**, and **Employees**.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 18, Vite 6, Bootstrap 5.3, Bootstrap Icons, Axios.
- **Backend**: Node.js, Express.js (MVC-style modular architecture).
- **Database**: MongoDB Atlas compatible using Mongoose 8.
- **Security & Authentication**: JSON Web Tokens (JWT), bcryptjs password hashing, role-based middleware.
- **Routing**: React Router DOM v6 with SPA rewrites for Vercel.

---

## 2. User Roles & Permissions

| Feature | HR Admin | Team Manager | Employee |
| :--- | :---: | :---: | :---: |
| **Secure Dashboard** | Full Organization View | Team-specific View | Personal Overview |
| **Employee Directory** | Create, View, Edit, Delete | View Assigned Team | View Own Profile |
| **Daily Attendance** | View All Staff Records | — | Punch In / Punch Out, History |
| **Leave Management** | Approve / Reject Any Leave | Approve / Reject Team Leaves | Apply, View Personal Status |
| **Announcements** | Create, Publish, Delete | View Role & All Notices | View Role & All Notices |
| **Training Programs** | View All Programs | Create, Edit, Assign Team | View Assigned Programs |

> **Backend-Enforced Authorization:** Security rules are strictly enforced at the API controller and middleware level. Public self-registration assigns the `employee` role only. Elevating accounts to Manager or HR is restricted to HR administrators or safe database seeding.

---

## 3. Project Structure

```text
staffsync/
├── .gitignore                     # Git ignore rules for node_modules, .env, and dist
├── README.md                      # Complete setup, deployment and API guide
├── client/                        # React + Vite Frontend
│   ├── .env.example               # Frontend environment template
│   ├── index.html                 # App HTML template with Inter typography
│   ├── package.json               # Client scripts and dependencies
│   ├── vercel.json                # Vercel SPA routing rewrite rule
│   ├── vite.config.js             # Vite configuration
│   └── src/
│       ├── api/                   # Axios API services (auth, employee, attendance, etc.)
│       ├── components/            # Reusable UI widgets (Navbar, Sidebar, StatCard, Badges)
│       ├── context/               # AuthContext (JWT session state, login, logout)
│       ├── pages/
│       │   ├── Login.jsx          # Sign-in page with 1-click Demo credentials
│       │   ├── Register.jsx       # Public employee onboarding
│       │   ├── Dashboard.jsx      # Dynamic role dashboard router
│       │   ├── hr/                # HR views (Employees, Attendance, Leaves, Notices, Training)
│       │   ├── manager/           # Manager views (Team Leaves, Training, Team Directory)
│       │   └── employee/          # Employee views (Profile, Punch Clock, Leaves, Notices)
│       ├── App.jsx                # Protected routes & role access control
│       ├── App.css                # Polished SaaS styling
│       └── main.jsx               # React DOM bootstrap
└── server/                        # Express.js REST API Backend
    ├── .env.example               # Backend environment template
    ├── package.json               # Server scripts and dependencies
    ├── server.js                  # Express bootstrap, CORS & MongoDB startup
    ├── scripts/
    │   └── seed.js                # Safe, idempotent demo accounts seed script
    ├── tests/
    │   └── smoke.test.js          # Automated end-to-end API verification suite
    └── src/
        ├── config/db.js           # Safe MongoDB connection & URI validation
        ├── middleware/            # JWT auth, role authorization, error handling
        ├── models/                # Mongoose schemas (User, Employee, Attendance, Leave, etc.)
        ├── controllers/           # Business logic & controller handlers
        └── routes/                # Express API endpoints
```

---

## 4. Demo Login Credentials

The project comes with pre-configured demonstration accounts for immediate evaluation:

| Role | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `hr@staffsync.com` | `Password123!` | Full organization management, all attendance, employee directory, leave approval, announcements |
| **Manager** | `manager@staffsync.com` | `Password123!` | Oversees Engineering team, approves team member leaves, creates & assigns training programs |
| **Employee** | `employee@staffsync.com` | `Password123!` | Reports to Manager, punches attendance, applies for leave, tracks assigned trainings |

*(Additional team members included in seed: `sarah.design@staffsync.com` / `Password123!`)*

---

## 5. Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB instance (local `mongod` or free cloud MongoDB Atlas cluster)

### Step 1: Clone and Configure Backend
1. Open terminal in `server/`:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Edit `server/.env` with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/staffsync?retryWrites=true&w=majority
   JWT_SECRET=staffsync_super_secret_jwt_key_change_in_production_2026
   CLIENT_URL=http://localhost:5173
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed demo accounts & records:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   # or: npm start
   ```
   API health endpoint is available at: `http://localhost:5000/api/health`

### Step 2: Configure & Run Frontend
1. Open a new terminal in `client/`:
   ```bash
   cd client
   cp .env.example .env
   ```
2. Set the API URL in `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at: `http://localhost:5173`

---

## 6. Deployment Guide (Zero Configuration Friction)

Push this entire single repository to GitHub, then configure MongoDB Atlas, Render (Backend), and Vercel (Frontend).

### Phase 1: MongoDB Atlas Database Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Security > Database Access**:
   - Create a database user (e.g. `staffsync_admin`).
   - Assign **Read and write to any database** permissions.
4. Under **Security > Network Access**:
   - Add IP Access: `0.0.0.0/0` (Allow access from anywhere) so cloud hosting platforms like Render can connect dynamically.
5. Under **Database > Connect**:
   - Choose **Connect your application (Drivers)**.
   - Copy the SRV URI:
     `mongodb+srv://staffsync_admin:<password>@cluster0.abcde.mongodb.net/staffsync?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password.

---

### Phase 2: Deploy Backend to Render
1. Log in to [Render](https://render.com).
2. Click **New +** > **Web Service**.
3. Select your GitHub repository.
4. Configure service details:
   - **Name**: `staffsync-api`
   - **Language**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. In **Environment Variables**, add:
   | Key | Value | Purpose |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `MONGO_URI` | `mongodb+srv://...` | Full MongoDB connection string |
   | `JWT_SECRET` | `your_strong_random_secret_string` | Signs JWT session tokens |
   | `CLIENT_URL` | `https://staffsync-app.vercel.app` | (Update after deploying Vercel frontend) |
6. Click **Create Web Service**.
7. Once deployed, note down your Render service URL (e.g., `https://staffsync-api.onrender.com`).
8. Seed the remote database:
   - In Render dashboard, open the **Shell** tab of your service.
   - Run: `node scripts/seed.js`

---

### Phase 3: Deploy Frontend to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   - **Project Name**: `staffsync`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   | Key | Value | Purpose |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://staffsync-api.onrender.com/api` | Your live Render backend URL + `/api` |
6. Click **Deploy**.
7. Copy your production Vercel URL (e.g., `https://staffsync-app.vercel.app`).

---

### Phase 4: Finalize Production CORS
1. Return to your **Render** dashboard for `staffsync-api`.
2. Update the `CLIENT_URL` environment variable to match your live Vercel URL:
   `CLIENT_URL=https://staffsync-app.vercel.app`
3. Save and trigger a redeploy on Render.
4. Open the Vercel URL and sign in using the demo accounts!

---

## 7. Database Models & Schema Design

### `User`
- `name`: String (required)
- `email`: String (required, unique, lowercase)
- `password`: String (bcrypt hashed, `select: false`)
- `role`: Enum `['hr', 'manager', 'employee']` (default: `'employee'`)
- `timestamps`: true

### `Employee`
- `user`: ObjectId (ref: `User`, unique)
- `employeeId`: String (unique identifier, e.g. `EMP-001`)
- `firstName`, `lastName`: String
- `email`: String (unique)
- `phone`: String
- `department`: String (e.g. Engineering, HR, Sales, Marketing, Finance)
- `designation`: String (e.g. Senior Frontend Engineer)
- `role`: Enum `['hr', 'manager', 'employee']`
- `manager`: ObjectId (ref: `User`, reports to manager)
- `status`: Enum `['Active', 'Inactive', 'On Leave']`
- `joiningDate`: Date

### `Attendance`
- `employee`: ObjectId (ref: `Employee`)
- `user`: ObjectId (ref: `User`)
- `date`: String (`YYYY-MM-DD` indexed compound key `{ employee: 1, date: 1 }`)
- `checkIn`: Date (timestamp)
- `checkOut`: Date (timestamp)
- `workHours`: Number (calculated hours worked)
- `status`: Enum `['Present', 'Half Day', 'Late']`
- `notes`: String

### `Leave`
- `employee`: ObjectId (ref: `Employee`)
- `user`: ObjectId (ref: `User`)
- `leaveType`: Enum `['Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity/Paternity Leave', 'Unpaid Leave']`
- `startDate`: Date
- `endDate`: Date
- `days`: Number (calculated inclusive days)
- `reason`: String
- `status`: Enum `['Pending', 'Approved', 'Rejected']`
- `reviewedBy`: ObjectId (ref: `User`)
- `reviewerName`: String
- `reviewRemarks`: String

### `Announcement`
- `title`: String
- `message`: String
- `priority`: Enum `['Low', 'Medium', 'High', 'Urgent']`
- `targetAudience`: Enum `['All', 'hr', 'manager', 'employee']`
- `author`: ObjectId (ref: `User`)
- `authorName`: String

### `Training`
- `title`: String
- `description`: String
- `instructor`: String
- `department`: String
- `startDate`: Date
- `endDate`: Date
- `status`: Enum `['Upcoming', 'In Progress', 'Completed']`
- `assignedEmployees`: Array of ObjectId (ref: `Employee`)
- `createdBy`: ObjectId (ref: `User`)

---

## 8. REST API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Public registration (strictly creates `employee` accounts).
- `POST /api/auth/login` — Authenticates email and password, returns JWT and user profile.
- `GET /api/auth/me` — Fetches authenticated user and linked employee record.
- `PUT /api/auth/profile` — Allows employee to update contact details (phone, address).

### Employee Management (`/api/employees`)
- `GET /api/employees` — List employees with search, department, role and status filtering. *(HR & Manager)*
- `GET /api/employees/:id` — View specific employee details. *(HR, Manager for team, Employee for self)*
- `POST /api/employees` — Create new employee and user login. *(HR only)*
- `PUT /api/employees/:id` — Update employee role, department, manager, status. *(HR only)*
- `DELETE /api/employees/:id` — Remove employee and linked login. *(HR only)*
- `GET /api/employees/meta/managers` — Get list of managers for assignment dropdown. *(HR & Manager)*
- `GET /api/employees/team/me` — List team members reporting to current Manager. *(Manager only)*

### Attendance (`/api/attendance`)
- `POST /api/attendance/check-in` — Punch in for current date (validates single check-in per day).
- `POST /api/attendance/check-out` — Punch out (calculates shift duration in hours).
- `GET /api/attendance/today` — Status of today's attendance for authenticated user.
- `GET /api/attendance/my-history` — Personal historical attendance logs.
- `GET /api/attendance` — Organization-wide attendance log with date filter. *(HR only)*

### Leave Management (`/api/leaves`)
- `POST /api/leaves` — Apply for leave with start date, end date, type and reason.
- `GET /api/leaves/my-leaves` — View personal leave applications and decisions.
- `GET /api/leaves` — View leave requests for review. *(HR sees all; Manager sees direct reports)*
- `PUT /api/leaves/:id/status` — Approve or Reject pending leave request. *(HR & Manager)*

### Announcements (`/api/announcements`)
- `GET /api/announcements` — Retrieve notices filtered by role audience. *(Authenticated users)*
- `POST /api/announcements` — Publish new announcement. *(HR only)*
- `DELETE /api/announcements/:id` — Delete announcement. *(HR only)*

### Training Programs (`/api/training`)
- `GET /api/training` — List training courses (employees see assigned & departmental programs).
- `POST /api/training` — Create course and assign employees. *(Manager & HR)*
- `PUT /api/training/:id` — Update course details or enrollments. *(Manager & HR)*
- `DELETE /api/training/:id` — Remove training program. *(Manager & HR)*

### Health Check
- `GET /api/health` — Returns server uptime, database status, and environment.

---

## 9. Verification & Smoke Test Checklist

The project includes an automated test suite verifying core functional requirements:

```bash
cd server
npm run test:smoke
```

### Verified Scenarios:
1. `GET /api/health` endpoint returns HTTP 200 with service status `ok`.
2. Protected endpoints reject missing JWT tokens with HTTP 401.
3. Protected endpoints reject forged or malformed tokens with HTTP 401.
4. Database connection handler validates `MONGO_URI` format and detects unresolved `<password>` tokens.
5. Role authorization middleware blocks unauthorized access with HTTP 403.
6. Public registration strictly forces `role: 'employee'` and validates required parameters.
7. Leave date validator rejects invalid ranges where `endDate < startDate`.
8. Attendance checkout validator prevents check-out without an active check-in.
9. Manager leave authorization ensures managers can only approve leaves for their direct reports.
10. Announcements endpoint enforces role-based audience visibility rules.
11. Frontend Vite production build executes with zero compilation errors (`npm run build`).

---

## 10. Documented Limitations & Scope

- **Scope Adherence**: In accordance with system specifications, features such as external payroll payment gateways, video interviews, real-time socket chat, and complex multi-level approval hierarchies are omitted to maintain maximum reliability, performance, and simplicity.
- **Timezone Standardization**: Attendance records store dates in normalized ISO string format (`YYYY-MM-DD`) based on the server's standard clock, with check-in/out timestamps in UTC ISO format.
- **Public Registration**: Self-registered users are assigned to the `Operations` department as standard employees by default. An HR administrator can reassign them to specific departments and reporting managers at any time.
