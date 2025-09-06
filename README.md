# TeamNest - Team Collaboration Platform

A modern, responsive team collaboration platform built with React and Node.js, featuring project management, task tracking, drag-and-drop functionality and team communication.

## 🎯 Project Overview

**SynergySphere – Advanced Team Collaboration Platform**

TeamNest is a comprehensive team collaboration platform designed to help teams manage projects, track tasks and communicate effectively. It is built with modern web technologies, it provides an intuitive interface for project management and team coordination.

## 👥 Team Information

### Team Name: Cortex

### Problem Statement
**SynergySphere – Advanced Team Collaboration Platform**

### Team Leader
- **Name:** Sunny Radadiya
- **Email:** 23ce122@charusat.edu.in
- **Mobile:** 9586591497

### Team Members
- **Aayush Tilva**
  - Email: 23ce137@charusat.edu.in
  
- **Prisha Hadvani**
  - Email: 23ce038@charusat.edu.in
  
- **Palak Dave**
  - Email: 23ce018@charusat.edu.in

### Institution
**Charotar University of Science and Technology (CHARUSAT)**

## 📚 Academic Context

This project was developed as part of academic coursework at CHARUSAT, demonstrating practical application of modern web development technologies in creating real-world solutions for team collaboration and project management.

### Project Goals
- Implement a full-stack web application using React and Node.js
- Demonstrate understanding of modern development practices
- Create a practical solution for team collaboration challenges
- Showcase skills in database design, API development, and user interface design

## 🚀 Key Features

### 🔐 Authentication & User Management
- ✅ Username-based login system
- ✅ Email verification with OTP
- ✅ Secure password reset functionality
- ✅ JWT-based authentication
- ✅ User profile management

### 📁 Project Management
- ✅ Create and manage projects
- ✅ Add/remove team members
- ✅ Project dashboard with statistics
- ✅ Role-based access control
- ✅ Professional UI design

### 📋 Task Management
- ✅ Create tasks with assignees and due dates
- ✅ Drag-and-drop task status updates
- ✅ Task filtering and search
- ✅ Priority levels and categories
- ✅ Real-time task updates

### 💬 Team Communication
- ✅ Project discussion threads
- ✅ Real-time messaging
- ✅ Reply functionality
- ✅ Message editing and deletion

### 🎨 User Interface
- ✅ Modern, responsive design
- ✅ Professional sidebar navigation
- ✅ Interactive drag-and-drop
- ✅ Smooth animations and transitions
- ✅ Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **SQLite** - Local database (PostgreSQL for production)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Prisma Studio** - Database management

## 📁 Project Structure

```
TeamNest/
├── frontend-react/          # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Common/     # Shared components (Navbar, Sidebar)
│   │   │   ├── Discussion/ # Discussion components
│   │   │   ├── Project/    # Project-related components
│   │   │   └── Task/       # Task management components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx       # Application entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/                # Node.js backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   ├── utils/        # Utility functions
│   │   └── server.js     # Server entry point
│   ├── prisma/           # Database schema and migrations
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeamNest
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   PORT=3001
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend-react
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   cd frontend-react
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 🧪 Testing

### Test User Credentials
For testing purposes, you can use these credentials:
- **Username:** `testuser`
- **Password:** `password123`

### Creating a New User
1. Navigate to the signup page
2. Enter your details including username
3. Verify your email with the OTP
4. Complete registration

## 📱 Usage

### Getting Started
1. **Register/Login** - Create an account or login with existing credentials
2. **Create a Project** - Set up your first project
3. **Add Team Members** - Invite team members to collaborate
4. **Create Tasks** - Add tasks and assign them to team members
5. **Track Progress** - Use drag-and-drop to update task status
6. **Communicate** - Use the discussion feature for team communication

### Key Features
- **Drag & Drop Tasks** - Move tasks between To-Do, In Progress, and Done columns
- **Sidebar Navigation** - Quick access to different sections
- **Real-time Updates** - See changes immediately
- **Responsive Design** - Works on desktop and mobile devices

## 🔧 Configuration

### Database
The application uses SQLite for local development. For production, you can switch to PostgreSQL by updating the `DATABASE_URL` in your `.env` file.

### Email Service
Configure your email service in the `.env` file to enable email verification and notifications.

### Authentication
JWT tokens are used for authentication. Make sure to set a strong `JWT_SECRET` in your environment variables.

## 🚀 Deployment

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Update environment variables for production
3. Run database migrations
4. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the production version
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP for email verification
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member
- `DELETE /api/projects/:id/members/:userId` - Remove project member

### Tasks
- `GET /api/tasks/projects/:projectId` - Get project tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Discussions
- `GET /api/discussions/projects/:projectId` - Get project messages
- `POST /api/discussions/projects/:projectId` - Create new message
- `PUT /api/discussions/:id` - Update message
- `DELETE /api/discussions/:id` - Delete message

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Team Cortex
- **Sunny Radadiya** - Team Leader & Full-stack Development
- **Aayush Tilva** - Backend Development & Database Design
- **Prisha Hadvani** - Frontend Development & UI/UX Design
- **Palak Dave** - Frontend Development & Testing

Technology Acknowledgments

React Team – For building and maintaining such a powerful and flexible front-end framework that makes creating dynamic, component-driven user interfaces efficient and enjoyable.

Tailwind CSS Team – For introducing a utility-first CSS framework that simplifies styling and enables developers to design responsive, modern UIs with speed and consistency.

Prisma Team – For providing an intuitive and type-safe ORM that bridges databases with applications seamlessly, improving developer productivity and reducing errors.

Express.js Team – For creating a minimal yet robust backend framework that powers scalable server-side applications and simplifies API development.

All Contributors and Testers – To the open-source community, maintainers, and everyone who tests and contributes to these technologies, ensuring they remain stable, evolving, and accessible for developers worldwide.

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/TeamNest/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Collaborating! 🚀**
