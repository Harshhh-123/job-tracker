# Job Application Tracker

A full-stack MERN app to track job applications on a Kanban board with AI-powered job description parsing and resume suggestions.

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
GEMINI_API_KEY=your_gemini_api_key
## Decisions Made
- Used Gemini API instead of OpenAI (free tier available)
- AI logic kept in service layer (aiService.js)
- JWT stored in localStorage for persistent login
- Mongoose for MongoDB schema validation