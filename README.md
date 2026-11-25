
# Mini Project Manager

A full-stack Project Management application built using Next.js, React, Redux Toolkit, Node.js, Express, and MongoDB. It allows users to create and manage projects and organize tasks with status, priority, and due dates.

## Features

### Authentication
- User registration and login using email and password.
- JWT-based authentication.
- Password hashing using bcryptjs.
- Authentication token stored in HTTP-only cookies.
- Logout functionality.
- Protected backend API routes.

### Projects
- Create new projects.
- View all projects.
- Update project details.
- Delete projects.
- Each project belongs to the logged-in user.
- Project status management (Active, Completed, On Hold).
- Search and filter projects.

### Tasks
- Create tasks under a project.
- View, update, and delete tasks.
- Each task is associated with a project.
- Task status management:
  - Todo
  - In Progress
  - Done
- Task priority management:
  - Low
  - Medium
  - High
- Set due dates for tasks.
- Search tasks by title and description.
- Filter tasks by status and priority.
- Filter tasks by due date (Upcoming and Overdue).
- Sort tasks by creation date and due date.

### Dashboard
- View project and task summaries.
- Display task status counts.
- View project and task information.

## Technology Stack

**Frontend:**
- React 19
- Next.js 16
- Redux Toolkit
- Axios
- Tailwind CSS
- Lucide React

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```text
mini-project-manager/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/
    │   │   ├── login/
    │   │   ├── projects/
    │   │   ├── register/
    │   │   └── tasks/
    │   │
    │   ├── redux/
    │   │   ├── slices/
    │   │   │   ├── authSlice.js
    │   │   │   ├── projectSlice.js
    │   │   │   └── taskSlice.js
    │   │   ├── Provider.js
    │   │   └── store.js
    │   │
    │   ├── services/
    │   │   └── api.js
    │   │
    │   └── package.json
```

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB (Local or MongoDB Atlas)
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd mini-project-manager
```

### 2. Backend Setup

Open the terminal and navigate to the backend folder.

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and add the following environment variables.

### 3. Environment Variables

Create `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Update the MongoDB connection string and JWT secret with your own values.

### 4. Frontend Setup

Open another terminal and navigate to the frontend folder.

```bash
cd frontend
npm install
```

The frontend uses the following API URL by default:

```text
http://localhost:5000/api
```

If you want to configure a different API URL, create a `.env.local` file inside the frontend folder.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend

From the backend folder:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

### Start Frontend

From the frontend folder:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:3000
```

Open the frontend URL in your browser.

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login user |
| POST | /auth/logout | Logout user |
| GET | /auth/me | Get logged-in user details |

### Project APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /projects | Create a project |
| GET | /projects | Get all user projects |
| GET | /projects/:id | Get project by ID |
| PUT | /projects/:id | Update project |
| DELETE | /projects/:id | Delete project |

### Task APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /tasks | Create a task |
| GET | /tasks | Get all user tasks |
| GET | /tasks/:id | Get task by ID |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

### Task Filtering

The task listing API supports the following query parameters:

| Parameter | Description |
|---|---|
| status | Filter tasks by status |
| priority | Filter tasks by priority |
| sort | Sort tasks by creation date |

Example:

```text
/api/tasks?status=in-progress&priority=high&sort=oldest
```

Due-date filtering and sorting are handled on the frontend.

## Authentication and Authorization

- Users can register and log in using email and password.
- Passwords are hashed using bcryptjs.
- JWT tokens are generated after successful registration and login.
- JWT tokens are stored in HTTP-only cookies.
- Backend authentication middleware verifies the JWT token.
- Project and task APIs are protected.
- Users can access and manage only their own projects and tasks.
- The dashboard checks the authentication state before displaying its content.

## Database Models

### User Model
- name
- email
- password
- createdAt
- updatedAt

### Project Model
- title
- description
- status
- owner
- createdAt
- updatedAt

### Task Model
- title
- description
- status
- priority
- dueDate
- project
- assignedTo
- createdBy
- createdAt
- updatedAt

## Task Status Management

Tasks support three statuses:

| Status | Description |
|---|---|
| todo | Task is not started |
| in-progress | Task is currently in progress |
| done | Task is completed |

The default task status is `todo`.

## Task Filtering and Sorting

Users can filter tasks based on:

- Task status
- Task priority
- Upcoming tasks
- Overdue tasks

Users can also sort tasks by:

- Newest first
- Oldest first
- Due date (earliest first)
- Due date (latest first)

## Important Notes

- Every project is associated with its owner.
- Every task must belong to an existing project.
- Users can create tasks only under their own projects.
- Task updates and deletions are restricted to the task creator.
- Project and task APIs require JWT authentication.
- Deleting a project does not automatically delete its associated tasks.
- Frontend authentication checks are implemented in the dashboard layout. The projects and tasks pages do not have the same page-level protection.
- Due-date filtering and sorting are handled on the frontend.

## Screenshots

Add application screenshots here.

### Login Page

![Login Page](./docs/screenshots/login.png)

### Dashboard

![Dashboard](./docs/screenshots/dashboard.png)

### Projects

![Projects](./docs/screenshots/projects.png)

### Tasks

![Tasks](./docs/screenshots/tasks.png)

## Deployment

Deployment URL: Not deployed yet.
