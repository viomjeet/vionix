# Vionix &mdash; Modern Social Media Platform

A full-stack, scalable, responsive Social Media Web Application built with React, TypeScript, Node.js, Express, Prisma, and SQLite.

The application operates locally with **zero external database configuration** using an embedded SQLite database (`file:./dev.db`). The user interface is intentionally clean, minimal, and sober with a light & dark color palette designed for comfortable, distraction-free social networking.

---

## Features

- **Authentication & Security**:
  - Manual Email/Username + Password authentication with bcrypt hashing.
  - One-click **Continue with Google** OAuth integration.
  - Protected routes redirect unauthenticated users to `/login`.
  - Forgot & Reset Password flows.
  - JWT authentication stored securely with automatic request headers.
- **Feed & Media Mechanics**:
  - **Home Feed**: Curated feed displaying posts from the logged-in user and followed creators.
  - **Explore Feed**: Platform-wide stream of all posts with keyword & hashtag filtering.
  - **Local Media Upload**: Direct photo & video uploads from laptop/mobile with instant preview.
  - **Image & Video Lightbox**: Full-screen modal with Next/Previous arrows, post caption, download protection, and live comment sync.
  - **Download Protection**: Transparent shield overlay, right-click disabling, and drag protection.
- **Engagement & Productivity**:
  - **Bookmarks / Saved Posts**: Save posts with a single tap; dedicated "Saved" tab on user profile.
  - **Global Search Bar**: Real-time debounced search for creators and posts in the top navigation.
  - **Clickable `#hashtags`**: Automatic tag detection that filters the explore feed.
  - **Likes & Comments**: Interactive reactions with live count updates.
  - **Follow / Unfollow**: Creator discovery and relationship management.
  - **Edit Profile Modal**: Custom display name, bio with character limit, and avatar photo upload.
- **Sober & Balanced Design**:
  - Fully responsive full-screen layout on wide displays with zero dead margins.
  - Clean obsidian dark theme with muted emerald/teal accents inspired by modern minimal aesthetics.
  - Light/Dark mode switcher with persistent `localStorage` preference.
  - Premium typography powered by **Plus Jakarta Sans**.
  - Built with Tailwind CSS and Lucide React icons.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router DOM, Axios
- **Backend**: Node.js, Express, TypeScript (Strict mode, zero `any`), Prisma ORM, SQLite, JWT, bcryptjs

---

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all # Or npm install in root, server, and client
```

### 2. Database Setup & Seed
```bash
npm --prefix server run db:push
npm --prefix server run seed
```

### 3. Run Development Server
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## Documentation

All architectural documents, coding standards, and API specifications are maintained inside the [`docs/`](./docs/) directory:

- [**API Specifications**](./docs/API_SPECS.md) &mdash; Detailed REST endpoints, request/response models, and error envelopes.
- [**Architecture Guide**](./docs/ARCHITECTURE.md) &mdash; System layers, CSR pattern, and component hierarchy.
- [**Coding Standards & Guidelines**](./docs/CLAUDE.md) &mdash; Best practices, TypeScript conventions, and database rules.
- [**Full Project Documentation**](./docs/README.md) &mdash; Complete documentation archive.

---

## License
MIT
