# AI Project Generator

A clean SaaS web app that helps students generate and save software project ideas based on their skills, domain, and difficulty.

Week 1 uses predefined backend generation logic and saves generated projects to MongoDB. Gemini or other AI providers can be added later behind the service layer.

## Tech Stack

- Frontend: React, JavaScript, Tailwind CSS, React Router, Fetch API, Clerk
- Backend: Node.js, Express.js, MongoDB, Mongoose, Clerk JWT auth
- Deployment: Vercel frontend, Render backend

## Project Structure

```txt
client/     React frontend
server/     Express API
```

## Environment Variables

Create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
VITE_API_URL=http://localhost:5000
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-project-generator
CLERK_SECRET_KEY=sk_test_your_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Local Installation

```bash
npm run install:all
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## API

All project routes require a Clerk bearer token.

- `POST /api/projects` creates and saves a generated project
- `GET /api/projects` returns all projects for the authenticated user
- `GET /api/projects/:id` returns one project
- `DELETE /api/projects/:id` deletes one project
- `GET /api/health` health check

## Deployment

### Backend on Render

1. Create a new Render Web Service from this repository.
2. Set root directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add `MONGODB_URI`, `CLERK_SECRET_KEY`, `CLIENT_URL`, and `NODE_ENV=production`.

### Frontend on Vercel

1. Create a new Vercel project from this repository.
2. Set root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` pointing to the Render backend URL.

## Notes

- Clerk protects frontend routes and backend API calls.
- MongoDB stores users on first authenticated API request.
- Generation templates are isolated in `server/services/projectGenerator.service.js` for future AI integration.
