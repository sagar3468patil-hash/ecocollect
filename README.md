# EcoCollect — Smart Waste Collection & Recycling Platform

EcoCollect is a full-stack, responsive municipal waste collection and recycling coordination platform developed as a hackathon MVP. It bridges the communication gap between citizens needing recyclable and bulk waste pickup and municipal collection teams planning collection routes.

---

## Problem Statement

In rapidly growing urban areas like Pune, recyclable and specialized waste (particularly electronic waste, bulk paper, and time-sensitive organics) piles up simply because:
1. **Citizens lack visibility and simplicity**: There is no transparent, low-friction channel to schedule pickups and track status.
2. **Collection teams lack real-time data**: Municipal operators cannot see pending waste loads across neighborhoods, leading to inefficient routing, missed hazardous pickups, and overflowing community collection points.

---

## Solution

EcoCollect provides an integrated two-sided portal:
- **Citizen Portal**: Fast 60-second pickup scheduling with instant deterministic priority feedback, status timeline tracking (`SUBMITTED` → `REVIEWED` → `SCHEDULED` → `COLLECTED`), and cancellation support for pending requests.
- **Admin Operations Hub**: Real-time triage table with live search and multi-attribute filters, lifecycle status progression, and an Analytics Dashboard powered by Recharts showing category distribution and collection pipeline metrics.

---

## Key Features

- **Transparent Request Tracking**: Unique readable tracking codes (`ECO-XXXXXXX`) for every request.
- **Deterministic Priority Engine**: Automated, rule-based triage algorithm (strictly not AI/ML) that explains to both citizens and operators why a request was marked Low, Medium, or High priority.
- **Visual Status Timeline**: Progress visualization from initial intake through final collection.
- **Admin Analytics Dashboard**: Recharts-powered distribution of waste types and stage breakdowns backed by live database aggregation.
- **Editorial Design System**: Custom palette using warm off-white (`--paper: #F6F4EE`), deep forest green (`--forest: #1E4432`), sage (`--sage: #DCE6DA`), muted amber (`--amber: #B8791F`), and clay (`--clay: #A8422F`), styled with Fraunces serif headings and Inter sans body text.
- **Fully Responsive**: Collapsible navigation drawer on mobile and responsive table-to-stacked-card layout on small viewports.

---

## User Workflows

### 1. Citizen Workflow
1. **Explore Landing Page**: View community mission and click "Request a pickup".
2. **Dashboard / Overview**: View personal submissions or browse community requests in demo mode.
3. **Submit Request**: Specify waste category (`Plastic`, `Paper`, `Organic`, `E-Waste`, `Glass`, `Metal`, `Mixed Waste`), quantity (kg), pickup address, and preferred time slot.
4. **Instant Priority Feedback**: Live rule engine displays immediate calculation and reason.
5. **Confirmation**: Receives assigned tracking code (e.g. `ECO-R9JWYL0`).
6. **Track / Cancel**: Monitor status on the Request Details timeline; cancel while still in `SUBMITTED` status if plans change.

### 2. Admin Workflow
1. **Operations Dashboard**: Monitor real-time KPIs (Total requests, Submitted, Scheduled, High Priority) and Recharts analytics.
2. **Filter & Search**: Search by citizen name, tracking code, address, category, or status.
3. **Triage Request**: Click into any request to inspect details and the deterministic priority rule reason.
4. **Transition Status**: Transition requests sequentially:
   - `SUBMITTED` $\rightarrow$ `REVIEWED`
   - `REVIEWED` $\rightarrow$ `SCHEDULED`
   - `SCHEDULED` $\rightarrow$ `COLLECTED` (or `CANCELLED`)

---

## Smart Priority Engine (Deterministic, Rule-Based — NOT AI/ML)

EcoCollect intentionally avoids opaque "black-box" machine learning for operational waste triage. Instead, it utilizes an explainable, deterministic rule-based priority engine located in [`src/utils/priorityEngine.js`](src/utils/priorityEngine.js).

### Priority Precedence:
1. **E-Waste with quantity $\ge$ 5 kg** $\rightarrow$ `HIGH`
   - *Reason*: Hazardous electrical components combined with heavy volume.
2. **Any category with quantity $\ge$ 10 kg** $\rightarrow$ `HIGH`
   - *Reason*: Bulk volume threshold requiring dedicated vehicle dispatch.
3. **Organic waste (any quantity)** $\rightarrow$ `MEDIUM`
   - *Reason*: Time-sensitive decomposition and odor management.
4. **Standard recyclables (Plastic, Paper, Glass, Metal) $\ge$ 5 kg** $\rightarrow$ `MEDIUM`
   - *Reason*: Moderate recyclable volume.
5. **E-Waste < 5 kg** $\rightarrow$ `MEDIUM`
   - *Reason*: Regulated electrical items requiring specialized processing.
6. **Otherwise** $\rightarrow$ `LOW`
   - *Reason*: Standard recyclables at low volumes.

Every calculation returns both the categorical priority and an explicit human-readable string explaining the decision.

---

## Technology Stack

- **Frontend**: React 19, Vite 8, React Router v7
- **Styling**: Tailwind CSS v4, Custom CSS Tokens, Lucide React icons
- **Charts & Data Viz**: Recharts
- **Database & Backend**: Supabase (PostgreSQL with Row-Level Security)
- **Deployment & Containers**: Multi-stage Docker (Node.js build + Nginx Alpine), Google Cloud Run ready

---

## Database Schema

Database table: `waste_requests`

```sql
create table waste_requests (
  id              uuid primary key default gen_random_uuid(),
  request_code    text not null unique,
  user_name       text not null,
  user_email      text not null,
  waste_category  text not null check (waste_category in ('Plastic','Paper','Organic','E-Waste','Glass','Metal','Mixed Waste')),
  quantity_kg     numeric(6,2) not null check (quantity_kg > 0),
  pickup_address  text not null,
  pickup_date     date not null,
  pickup_time     text not null,
  notes           text,
  priority        text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH')),
  status          text not null default 'SUBMITTED' check (status in ('SUBMITTED','REVIEWED','SCHEDULED','COLLECTED','CANCELLED')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

---

## Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd ecocollect
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials in `.env`:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database
Run `supabase/schema.sql` and optionally `supabase/seed.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Docker Instructions

### Build Docker Image
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t ecocollect:latest .
```

### Run Container
```bash
docker run -p 8080:8080 ecocollect:latest
```
Open `http://localhost:8080`.

---

## Google Cloud Run Deployment

Deploy directly from source using Google Cloud Build:

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set project ID
gcloud config set project <YOUR_PROJECT_ID>

# 3. Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Deploy to Cloud Run
gcloud run deploy ecocollect \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-build-env-vars="VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY"
```

---

## Screenshots

| View | Description |
| --- | --- |
| **Landing Page** | Clean editorial hero introducing the initiative and dual role entry |
| **Citizen Dashboard** | Summary stat cards, quick request CTA, and recent personal/community feed |
| **New Request Form** | Multi-attribute input with client validation and live rule priority preview |
| **Request Details** | Request breakdown with active status timeline and rule explanation |
| **Admin Operations** | Full requests table with search, status filters, and priority pills |
| **Admin Analytics** | Recharts bar charts showing volume by status and waste classification |

---

## Future Improvements

1. **Route Optimization Engine**: Cluster scheduled pickups by geolocation and generate turn-by-turn routes for drivers.
2. **Citizen Photo Uploads**: Supabase Storage integration for uploading photos of waste items.
3. **SMS / WhatsApp Alerts**: Real-time status update notifications using Twilio or WhatsApp Business API.
4. **Driver Mobile App**: Offline-first lightweight PWA for collection crews with digital signature confirmation.
