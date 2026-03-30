# BYU Pathway — Job Listings (Local Dev Model)

> Standalone mockup built in VS Code.  
> Mirrors the structure that will transfer into the Power Pages repo.

---

## Folder Structure

```
byu-job-listings/
├── index.html                          ← Main page (header + filters + grid + footer)
├── css/
│   └── styles.css                      ← All styles (BYU navy/gold branding)
├── js/
│   └── main.js                         ← Filter logic, card rendering, pagination
├── data/
│   └── jobs.json                       ← Mock job data for local dev
├── templates/
│   └── job-listings-template.liquid    ← Power Pages Liquid web template
└── docs/
    └── README.md                       ← This file
```

---

## Running Locally

Because `main.js` fetches `data/jobs.json`, you need a local server
(browsers block `fetch()` from `file://`). Two easy options:

**Option A — VS Code Live Server (recommended)**
1. Install the "Live Server" extension by Ritwick Dey
2. Right-click `index.html` → **Open with Live Server**
3. Opens at `http://127.0.0.1:5500`

**Option B — Node http-server**
```bash
npx http-server . -p 5500
# then open http://localhost:5500
```

---

## What Each File Does

| File | Local Dev | Power Pages equivalent |
|------|-----------|------------------------|
| `index.html` | Full page with mock header/footer | Individual sections handled by site Web Templates |
| `css/styles.css` | All page styles | Copy into Power Pages custom CSS (Site Settings → CSS) |
| `js/main.js` | Filters + renders from JSON | Replaced by Liquid `{% for %}` loop + FetchXML |
| `data/jobs.json` | Simulates Dataverse records | Replaced by actual Dataverse `cr_job_listing` table |
| `templates/job-listings-template.liquid` | Reference only | Paste into Power Pages Studio → Web Templates |

---

## Transferring to Power Pages Repo

When you gain repo access, here is the file mapping:

```
LOCAL FILE                              → REPO DESTINATION
─────────────────────────────────────────────────────────────
css/styles.css                          → web-files/job-listings.css
js/main.js                              → NOT needed (Liquid handles rendering)
templates/job-listings-template.liquid  → web-templates/job-listings.liquid
data/jobs.json                          → NOT needed (use Dataverse table)
```

### Steps
1. `pac auth create --url https://yourorg.crm.dynamics.com`
2. `pac pages download --path ./repo` (pulls existing site files)
3. Copy `css/styles.css` → `repo/web-files/job-listings.css`
4. Copy `templates/job-listings-template.liquid` → `repo/web-templates/job-listings.liquid`
5. `pac pages upload --path ./repo`

---

## Dataverse Table Setup

Create a table called **Job Listing** (`cr_job_listing`):

| Display Name   | Logical Name          | Type                          |
|----------------|-----------------------|-------------------------------|
| Title          | cr_title              | Single line of text           |
| Organization   | cr_organization       | Single line of text           |
| Position Type  | cr_position_type      | Choice (Full-time/Part-time/Internship) |
| Program        | cr_program            | Choice (Business Mgmt, etc.)  |
| Location Type  | cr_location_type      | Choice (Remote/Hybrid/On-site)|
| Region         | cr_region             | Choice (Americas/Africa/etc.) |
| Posted Date    | cr_posted_date        | Date Only                     |
| Apply URL      | cr_apply_url          | URL                           |

Set **Table Permissions** → Read access for **Anonymous Users** web role.

---

## VS Code Extensions Recommended

| Extension | Purpose |
|-----------|---------|
| Live Server | Run local dev server |
| Liquid | Syntax highlighting for `.liquid` files |
| Power Platform Tools | Connect VS Code to Power Pages environment |
| Prettier | Format HTML/CSS/JS |
| Error Lens | Inline error display |
