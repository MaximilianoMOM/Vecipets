# Frontend Technical Setup

This commit adds a concise technical description of the frontend project configuration.

## Stack
- **Framework**: Next.js (latest)
- **Language**: TypeScript (configured via `tsconfig.json` – inherits from root if present)
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Authentication**: Google Sign‑In using `@react-oauth/google`
- **Forms & Validation**: `react-hook-form`, `yup`, `@hookform/resolvers`
- **UI Components**: Radix UI icons and toast, utility classes via `clsx` and `tailwind-merge`
- **HTTP client**: Axios

## Scripts
- `npm run dev` – Starts the Next.js development server.
- `npm run build` – Generates a production build.
- `npm run start` – Serves the built application.

## Dependencies
All required runtime and dev dependencies are listed in `apps/frontend/package.json` and have been installed.

This file serves as reference for future contributors and CI pipelines.
