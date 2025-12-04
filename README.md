# 🏆 TryMe! – Challenge Tracking Web App

A full-stack web application where users create accounts, join or create weekly challenges, and check in daily to stay active. Includes MFA, authentication, rankings, and a dynamic leaderboard.

This document explains how to install dependencies, configure environment variables, and run the application locally.

## Prerequisites

Before running the project locally, you must have:
* Node.js
  * Download: [https://nodejs.org/en/download](https://nodejs.org/en/download)
  * npm (comes with Node): used to manage dependencies
* A MongoDB Atlas cluster and connection string

## Environment Variables

Create the `backend/.env` file and add:

```
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

```

## Installation and Running the App Locally

This project has two servers:

* Frontend (Vite dev server)
* Backend (Express API server)

Start them separately and run them at the same time.

### 1. Frontend (React/Vite)

From the project root, install dependencies and start the frontend:

```
npm install
npm run dev
```

Vite will start on:

```
http://localhost:5173
```


### 2. Backend server

Then repeat for the backend, inside the backend directory:

```
cd backend
npm install
npm run dev
```
When the server starts, you should see:
```
Mongo connected
API on 4000
```

The backend API runs at:
```
http://localhost:4000
```
