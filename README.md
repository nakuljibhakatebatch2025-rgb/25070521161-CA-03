# Personal Expense Tracker

A simple full-stack expense tracker with JWT authentication.

- **Backend:** Express + Mongoose (MongoDB), JWT, bcrypt
- **Frontend:** Vite + React, React Router, plain CSS

## Project structure

```
server/   Express API (auth + expenses)
client/   React single-page app
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or MongoDB Atlas)

## 1. Run the backend

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example` and fill in the values:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=some-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5174
```

If your local MongoDB requires authentication, include the credentials:

```env
MONGODB_URI=mongodb://<user>:<password>@127.0.0.1:27017/expense_tracker?authSource=admin
```

For MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string, for example:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/expense_tracker?retryWrites=true&w=majority
```

Start the API:

```bash
npm run dev
```

The server runs on http://localhost:5001.

## 2. Run the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs on http://localhost:5174. Vite proxies `/api` requests to the backend, so no extra configuration is needed.

> Ports are set to `5001` (API) and `5174` (client) to avoid clashing with other local projects. If you change `PORT` in `server/.env`, update the proxy target in `client/vite.config.js` too.

## API

All expense routes require `Authorization: Bearer <token>`.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account (`name`, `email`, `password`) |
| POST | `/api/auth/login` | Log in (`email`, `password`) |
| GET | `/api/auth/me` | Get the current user |
| GET | `/api/expenses` | List the current user's expenses |
| POST | `/api/expenses` | Add an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

Expense fields: `title`, `amount`, `category`, `date`, `note`.

## Production build

```bash
cd client
npm run build
```

The static files are generated in `client/dist` and can be served by any static host. The API can be started with `npm start` in `server/`.
