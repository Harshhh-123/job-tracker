# Job Tracker

An AI-assisted job application tracker built with the MERN stack.

## Features
- JWT Authentication (Register/Login)
- Kanban board with 5 stages: Applied, Phone Screen, Interview, Offer, Rejected
- Drag and drop cards between columns
- Add, Edit, Delete job applications
- Data persisted in MongoDB Atlas

## Tech Stack
- Frontend: React, Vite, CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas + Mongoose
- Auth: JWT + bcryptjs

## How to Run

### Backend
cd server
npm install
npm run dev

### Frontend
cd client
npm install
npm run dev

## Environment Variables
Create a `.env` file in the `server` folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

## Decisions
- Used standard MongoDB connection string instead of SRV for compatibility
- JWT stored in localStorage for session persistence
- Kanban drag-and-drop built with HTML5 native drag events