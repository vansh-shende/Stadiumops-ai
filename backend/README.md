# StadiumOps AI — Backend

Backend server for the **StadiumOps AI** hackathon project.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** SQLite3
- **Dev Tooling:** nodemon, dotenv

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Start the dev server
npm run dev
```

The server will start on the port defined in `.env` (default **3000**).

## Project Structure

```
backend/
├── database/    # Database setup & migrations
├── routes/      # Express route modules
├── scripts/     # Utility & seed scripts
├── server.js    # Application entry point
├── package.json
├── .env.example
└── .gitignore
```

## Available Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm start`     | Run the server with Node           |
| `npm run dev`   | Run the server with nodemon (HMR)  |
