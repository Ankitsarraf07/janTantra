# Jan Tantra

Jan Tantra is a digital governance platform with a React frontend and a Node.js/Express backend.

This folder contains the frontend client built with Vite.

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios, Recharts
- Backend: Node.js, Express, MongoDB (Mongoose), JWT authentication

## Project Structure

- `client/` Frontend app
- `server/` Backend API

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB connection string

## Environment Variables (Backend)

Create `server/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

## Run Locally

### 1. Start backend

```bash
cd server
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2. Start frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Available Scripts

### Client

- `npm run dev` Start Vite dev server
- `npm run build` Build production bundle
- `npm run preview` Preview production build

### Server

- `npm start` Run server in production mode
- `npm run dev` Run server with nodemon
- `npm run seed` Seed database data

## API Base URL

The frontend is configured to call:

- `http://localhost:5000/api`

## Main API Modules

- Auth: `/api/auth`
- Users: `/api/users`
- Areas: `/api/areas`
- Issues: `/api/issues`
- Funds: `/api/funds`
- Feedback: `/api/feedback`
- Rankings: `/api/rankings`

## Security Note

Do not commit `server/.env` or any real credentials to GitHub. If credentials were ever exposed, rotate them immediately.
