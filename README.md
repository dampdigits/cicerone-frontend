# Cicerone Frontend

A modern, responsive, and interactive frontend for **Cicerone** (OAuth Setup Research Engine).

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Lucide Icons**, and **Framer Motion**.

---

## Features

### 1. Research Input Form
- **Provider Name** input with quick-selection pills for popular providers (GitHub, Google, Slack, Microsoft, Discord, Spotify, GitLab, Atlassian).
- **Collapsible Advanced Options**:
  - \`doc_url\`: Documentation seed URL
  - \`domains\`: Allowed official domains (comma-separated)
  - \`seeds\`: Additional seed URLs for site mapping
  - \`select_paths\` & \`exclude_paths\`: Regex path filters
  - \`max_urls\`: Interactive slider (5 to 60 pages, default 30)
  - \`dry_run\`: Discovery-only preview mode (no model calls or token costs)

### 2. Live Job Progress & Polling
- Real-time polling of \`/api/jobs/{job_id}/status/\` using dynamic backend intervals.
- Visual stepper indicating the 5 pipeline stages:
  1. **Resolving Config** (domain validation)
  2. **Discovering URLs** (Tavily search & site mapping)
  3. **Extracting Docs** (batch text retrieval)
  4. **Analyzing Topics** (evidence verification with verbatim citations)
  5. **Building Workflow** (synthesizing steps, branching & totals)
- Elapsed timer, activity details, and error notifications.

### 3. Client-Side Temporary Storage
- Results, current state, and checklist progress are stored in \`localStorage\` / \`sessionStorage\`.
- **History Drawer**: Revisit up to 15 past research runs, switch between providers, or clear history.
- **Persistent Checklists**: Completed sub-steps remain saved across browser reloads.
- **Export Options**: One-click Copy Markdown and Download JSON payload.

### 4. Dual-Section Output Switcher
Seamless switching between two complementary views:
- **Markdown Document**: Formatted with GitHub-flavored typography, code copy buttons, and official doc links.
- **Workflow UI**: Interactive visual pipeline with branching, checklist progress tracking, and confetti celebrations.

### 5. Branching Workflow & Scenarios
Supports branching based on:
- **Service Specialization Tracks**: e.g., Google Meet (conferencing) vs Google Drive/Tasks (file storage), Slack Bot vs User tokens, GitHub App vs OAuth App.
- **Alternative Implementation Routes**: e.g., Public Client (PKCE) vs Confidential Client (Secret).
- **Scope Tracks**: Minimum Dev Setup (quick start) vs Full Production & Verification.

### 6. Card Zoom-In Detail Modal
- Each step is presented as a summary card with badges for basis (\`verified\` vs \`inferred\`), scope (\`Core Setup\` vs \`Production Gate\`), time estimates, and sub-step completion indicators.
- **Clicking any card smoothly zooms it in** using Framer Motion shared layout animation into an expanded focused view containing:
  - Interactive sub-step checklist with strike-through completion
  - Estimated time, documented basis, and pipeline reasoning
  - Required Pre-requisites & Dependencies
  - Associated Review Gates & Approvals (approvers, conditions, wait times)
  - Known Roadblocks & Mitigations
  - Verified Official Documentation Evidence Quotes with direct links
  - Previous / Next step navigation (with keyboard arrow key support)

---

## Getting Started

### 1. Prerequisites
- Node.js >= 18 (Tested on v24)
- \`pnpm\` >= 9 (Tested on v11)
- Cicerone Django backend running on \`http://127.0.0.1:8000\`

### 2. Configure Environment Variables
Create or edit \`.env.local\` in the project root:
\`\`\`env
# Cicerone Backend API Domain URL
VITE_BACKEND_DOMAIN_URL=http://localhost:8000

# Optional API Key / Bearer Token for authenticated endpoints
# VITE_API_KEY=your_optional_api_key_here
# VITE_AUTH_HEADER=Authorization
\`\`\`

### 3. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 4. Run Development Server
\`\`\`bash
pnpm dev
\`\`\`
The frontend will start on \`http://localhost:3000\` and communicate with the backend domain specified in \`VITE_BACKEND_DOMAIN_URL\`.

### 5. Build for Production
\`\`\`bash
pnpm build
pnpm preview
\`\`\`

---

## Instant Demo Mode
If the Django backend is not running yet or API keys are being configured, you can click **"Load Google Demo Result"** on the home screen to test all features (branching graph, checklists, zooming cards, and Markdown viewer) immediately.
