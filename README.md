# ClubSphere — Campus Clubs Management System

A full-stack web platform for SLIIT students to discover, join, and engage with campus communities and events.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios, Framer Motion, Lucide React |
| Backend | Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, Multer, Nodemailer |

---

## Project Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
# create .env (see Environment Variables section below)
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables (`backend/.env`)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

## User Roles & Access Control

ClubSphere has four roles. Each role has a distinct set of pages and API endpoints it can access.

| Role | Description | Default Route |
|---|---|---|
| `admin` | Platform administrator | `/admin` |
| `community_admin` | Community/club organizer | `/community-admin` |
| `student` | SLIIT student | `/student` |
| `external` | External event participant (no login required) | Event page via code |

---

## Role Access Matrix

### Admin
> Full platform control — manages users, communities, and events.

| Feature | Access |
|---|---|
| View all users | Read |
| Approve / reject community admins | Write |
| Approve / reject communities | Write |
| Approve / reject events | Write |
| View & verify payment receipts | Write |
| View platform analytics | Read |
| View all events (any status) | Read |

**Pages:**
- `/admin` — Dashboard with platform-wide statistics
- `/admin/users` — Manage all users
- `/admin/communities` — Approve/reject communities
- `/admin/events` — Approve/reject events, view all events

---

### Community Admin
> Manages their own community, members, and events.

| Feature | Access |
|---|---|
| Edit community profile | Write |
| View & manage community members | Write |
| Approve / reject student join requests | Write |
| Remove members | Write |
| Create & manage events (draft → submit for approval) | Write |
| Mark attendance for events | Write |
| Bulk mark attendance | Write |
| View event participants | Read |
| View community dashboard stats | Read |

**Pages:**
- `/community-admin` — Dashboard with community stats
- `/community-admin/profile` — Edit community profile and social links
- `/community-admin/members` — View members, approve/reject join requests, remove members
- `/community-admin/events` — Create events, manage status, view participants, mark attendance

---

### Student
> Discovers communities and events, joins communities, registers for events.

| Feature | Access |
|---|---|
| Browse all approved communities | Read |
| Browse all published events | Read |
| View event details | Read |
| Request to join a community | Write |
| Register / unregister for events | Write |
| Upload payment receipt for paid events | Write |
| Submit event feedback & ratings | Write |
| View in-app notifications | Read |
| Mark notifications as read | Write |
| View and edit personal profile | Write |

**Pages:**
- `/student` — Dashboard with enrolled communities and upcoming events
- `/student/profile` — Edit personal profile
- `/events` — Browse all published events
- `/events/:id` — Event detail, register, submit feedback
- `/clubs` — Browse all approved communities, request to join

---

### External Participant
> Accesses a specific event via a unique event code — no login required.

| Feature | Access |
|---|---|
| Join event via event code | Write |
| View event details | Read |

**Entry point:** Event page with a code field — no account needed.

---

## User Flows

### Flow 1 — Admin

```
1. Admin registers → Admin approves own account (or is seeded directly)
2. Admin logs in → routed to /admin dashboard
3. Reviews platform stats (users, communities, events)
4. Manages Users:
   └── Approves or rejects community admin registrations
   └── Approves or rejects student accounts
5. Manages Communities:
   └── Reviews pending communities
   └── Approves → community becomes visible on /clubs
   └── Rejects with reason
6. Manages Events:
   └── Reviews pending_approval events
   └── Approves → event becomes published and visible on /events
   └── Rejects with reason → community admin is notified
7. Verifies payment receipts:
   └── Reviews uploaded slips
   └── Approves or rejects payment for paid events
8. Views analytics dashboard for insights
```

---

### Flow 2 — Community Admin

```
1. Community admin registers with role = community_admin
2. Admin approves their account
3. Community admin logs in → routed to /community-admin
4. Sets up community profile:
   └── Name, description, logo, social links
5. Submits community for approval → Admin reviews
6. Once approved, community appears on /clubs
7. Manages members:
   └── Students request to join
   └── Community admin approves / rejects join requests
   └── Can remove existing members
8. Creates events:
   └── Fills in event details (title, date, capacity, paid/free, event code)
   └── Saves as Draft
   └── Submits for Admin approval (status → pending_approval)
   └── Admin approves → status becomes published
   └── Notification sent to community members
9. Manages event lifecycle:
   └── Can update event details
   └── Marks event as Completed after it runs
10. Tracks attendance:
    └── Marks individual or bulk attendance for participants
11. Views participant list and registration data
```

---

### Flow 3 — Student

```
1. Student signs up with SLIIT email
2. OTP sent to email → verified
3. Admin or community admin approves student account
4. Student logs in → routed to /student dashboard
5. Discovers communities:
   └── Browses /clubs
   └── Requests to join a community
   └── Community admin approves/rejects
6. Discovers events:
   └── Browses /events (all published events)
   └── Views event details at /events/:id
7. Registers for events:
   └── Free events → instant registration
   └── Paid events → uploads payment receipt
   └── Admin verifies receipt → registration confirmed
8. Receives notifications:
   └── New event published in their community
   └── Event starting soon reminders
   └── Registration / rejection updates
9. Attends event:
   └── Community admin marks attendance
10. After event, submits feedback & rating
11. Can unregister from events before they start
```

---

### Flow 4 — External Participant

```
1. External participant receives event code from organizer
2. Visits ClubSphere → enters event code on the event page
3. Gains access to event details
4. No account creation required
```

---

## Team Ownership

| Member | Owned Features | Key Pages & Routes |
|---|---|---|
| **Member 1** — User, Community & Event Control | Signup/Login, Role management, Community registration & approval, Community profile, Member management, Event creation & publishing, External participant access | `/signup`, `/signin`, `/admin/users`, `/admin/communities`, `/community-admin`, `/community-admin/profile`, `/community-admin/members`, `/community-admin/events` |
| **Member 2** — Registration, Attendance & Payments | Event registration/unregistration, Capacity enforcement, Attendance marking (manual/QR), Paid event receipts, Export data to Excel | `/events/:id` (register), `PUT /api/events/:id/attendance`, `POST /api/receipts/upload`, `GET /api/admin/receipts` |
| **Member 3** — Notifications & Community Activity Feed | Notification triggers, In-app notification dashboard, Read/unread tracking, "What's Happening" community feed | `NotificationBell` component, `/api/notifications`, community feed on `/community-admin` and `/student` |
| **Member 4** — Feedback, Analytics & Financial Analysis | Event feedback & ratings, Analytics dashboards, Event financial analysis (income/cost/profit), Excel report export | `FeedbackModal` component, `/api/feedback`, `/api/admin/analytics`, `/admin` dashboard |

---

## Status Flows

### User Status
```
[registered] → pending → approved / rejected
```

### Community Status
```
[submitted] → pending → approved / rejected
```

### Event Status
```
draft → pending_approval → published → completed
                       ↘ rejected (can resubmit)
                                   ↘ cancelled
```

### Membership Status
```
[requested] → pending → approved / rejected
```

---

## API Reference

### Auth (`/api/auth`)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/send-otp` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |

### Users (`/api/users`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users` | Admin |
| GET | `/api/users/pending-community-admins` | Admin |
| GET | `/api/users/stats` | Admin |
| PUT | `/api/users/:id/approve` | Admin / Community Admin |
| PUT | `/api/users/:id/reject` | Admin / Community Admin |
| PUT | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |

### Communities (`/api/communities`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/communities` | Public |
| GET | `/api/communities/all` | Admin |
| GET | `/api/communities/my/profile` | Community Admin |
| PUT | `/api/communities/:id` | Community Admin / Admin |
| PUT | `/api/communities/:id/approve` | Admin |
| PUT | `/api/communities/:id/reject` | Admin |
| GET | `/api/communities/:id/members` | Community Admin / Admin |
| POST | `/api/communities/:id/join` | Student |
| GET | `/api/communities/:id/join-requests` | Community Admin |
| PUT | `/api/communities/:id/join-requests/:requestId/approve` | Community Admin |
| PUT | `/api/communities/:id/join-requests/:requestId/reject` | Community Admin |
| DELETE | `/api/communities/:id/members/:userId` | Community Admin |

### Events (`/api/events`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/events` | Public |
| GET | `/api/events/my-community` | Community Admin |
| GET | `/api/events/pending` | Admin |
| GET | `/api/events/all` | Admin |
| POST | `/api/events` | Community Admin |
| PUT | `/api/events/:id` | Community Admin / Admin |
| PUT | `/api/events/:id/status` | Community Admin / Admin |
| PUT | `/api/events/:id/approve` | Admin |
| PUT | `/api/events/:id/reject` | Admin |
| POST | `/api/events/join/:code` | Public (External) |
| POST | `/api/events/:id/register` | Student |
| GET | `/api/events/:id/participants` | Community Admin / Admin |
| PUT | `/api/events/:id/attendance` | Community Admin / Admin |
| PUT | `/api/events/:id/attendance/bulk` | Community Admin / Admin |
| DELETE | `/api/events/:id` | Community Admin / Admin |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/notifications` | Protected |
| PUT | `/api/notifications/read-all` | Protected |
| PUT | `/api/notifications/:id/read` | Protected |

### Receipts & Payments (`/api/receipts`, `/api/admin`)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/receipts` | Protected |
| POST | `/api/receipts/upload` | Protected |
| DELETE | `/api/receipts/:id` | Protected |
| GET | `/api/admin/receipts` | Admin |
| PATCH | `/api/admin/receipts/:id` | Admin |

### Feedback & Analytics
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/feedback` | Protected |
| GET | `/api/feedback/:eventId` | Public |
| GET | `/api/admin/analytics` | Admin |

---

## Folder Structure

```
Campus-Clubs-System-ClubSphere/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── feedbackController.js
│   │   └── receiptController.js
│   ├── middleware/
│   │   └── auth.js           # JWT + role-based authorization
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Community.js
│   │   ├── Event.js
│   │   ├── Membership.js
│   │   ├── Feedback.js
│   │   ├── Notification.js
│   │   ├── Receipt.js
│   │   └── OTP.js
│   ├── routes/               # Express routers
│   │   ├── authRoutes.js
│   │   ├── users.js
│   │   ├── communities.js
│   │   ├── events.js
│   │   ├── memberships.js
│   │   ├── feedbackRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── notifications.js
│   │   └── receiptRoutes.js
│   ├── uploads/              # Uploaded files (logos, receipts)
│   └── index.js              # App entry point
└── frontend/
    └── src/
        ├── pages/
        │   ├── admin/             # Admin dashboard pages
        │   ├── communityAdmin/    # Community admin pages
        │   └── student/           # Student pages
        ├── components/            # Reusable UI components
        ├── context/
        │   └── AuthContext.js     # Global auth state
        └── utils/
            └── api.js             # Axios instance
```
