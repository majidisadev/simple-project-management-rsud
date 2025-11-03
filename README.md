# Project Management Web App

A full-stack project management application with user authentication, daily reports with calendar view, and Kanban board functionality.

## Features

- **User Authentication**: Register and login functionality
- **Daily Reports**: 
  - Calendar view to see all reports
  - Add, edit, view, and delete reports
  - Users can only edit/delete their own reports
  - All users can view all reports
- **Kanban Board**:
  - Four columns: Backlog, Todo, In Progress, Done
  - Create, edit, delete tasks
  - Change task status
  - Priority levels (Low, Medium, High)

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, React Router, TailwindCSS
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your-secret-key-change-this-in-production
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## Project Structure

```
rsud-project-management/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Report.js
│   │   └── KanbanTask.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   └── kanban.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── DailyReports.js
│   │   │   ├── KanbanBoard.js
│   │   │   └── Navbar.js
│   │   ├── services/
│   │   │   ├── auth.js
│   │   │   ├── reports.js
│   │   │   └── kanban.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Daily Reports**: 
   - Click on any date in the calendar to add or edit a report
   - View reports for the selected date in the sidebar
   - Edit or delete your own reports
3. **Kanban Board**:
   - Click "Add Task" to create a new task
   - Drag tasks between columns (or use the "Move to" buttons)
   - Edit or delete tasks
   - Set priority levels

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - Get all reports for current user
- `GET /api/reports/calendar?startDate=&endDate=` - Get reports by date range
- `GET /api/reports/:id` - Get a single report
- `POST /api/reports` - Create a report
- `PUT /api/reports/:id` - Update a report (own reports only)
- `DELETE /api/reports/:id` - Delete a report (own reports only)

### Kanban
- `GET /api/kanban` - Get all tasks for current user
- `GET /api/kanban/:id` - Get a single task
- `POST /api/kanban` - Create a task
- `PUT /api/kanban/:id` - Update a task (own tasks only)
- `DELETE /api/kanban/:id` - Delete a task (own tasks only)

## License

ISC

