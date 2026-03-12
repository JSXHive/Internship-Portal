💼 Internship Portal – InfoTech Corporation of Goa Ltd.

A comprehensive **Internship Management System** built using **Next.js**, **React.js**, and **PostgreSQL**, developed for **InfoTech Corporation of Goa Limited**, Altinho, Panaji–Goa.  
This system facilitates seamless management of internships involving **students**, **mentors**, and **administrators**, providing tools for applications, task management, attendance, and certification.

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn** package manager
- **Git** (for version control)

---

## 🚀 Getting Started

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd Internship-Portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in your project root and add:

   ```bash
   DATABASE_URL=postgresql://postgres:admin@localhost:5432/student
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-app-password
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Internship-Portal/
├── backend/
│   └── server.js                
│
├── lib/
│   ├── db.js                    
│   ├── multer.js                
│   ├── otpUtils.js              
│   └── send-email.js            
│
├── pages/
│   ├── index.js                 
│   ├── login.js                 
│   ├── signup.js                
│   ├── download-certificate.js  
│   │
│   ├── admin/
│   │   ├── dashboard.js         
│   │   └── certificates.js      
│   │
│   ├── mentor/
│   │   ├── dashboard.js         
│   │   ├── certificates.js      
│   │   └── profile.js           
│   │
│   ├── student/
│   │   ├── dashboard.js         
│   │   ├── certificate.js       
│   │   └── status.js            
│   │
│   └── api/
│       ├── login.js             
│       ├── mentors.js           
│       ├── getApplications.js   
│       ├── getUserData.js       
│       ├── download-certificate.js
│       │
│       ├── admin/
│       │   ├── certificates.js
│       │   └── correction-requests.js
│       │
│       ├── mentor/
│       │   ├── certificates.js
│       │   ├── createprofile.js
│       │   ├── dashboard-data.js
│       │   └── profile.js
│       │
│       └── student/
│           └── certificate.js
│
├── public/                      
├── styles/                      
├── package.json
├── next.config.js
├── jsconfig.json
├── eslint.config.mjs
└── .env.local
```

---

## 🧱 Database Setup (PostgreSQL)

### 🗄️ Create Database

```sql
CREATE DATABASE student;
```

### 🧩 Core Tables

#### `users`
```sql
CREATE TABLE public.users (
  user_id VARCHAR(50) PRIMARY KEY,
  user_role VARCHAR(20) CHECK (user_role IN ('student', 'admin', 'mentor')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone VARCHAR(20),
  mentor_type VARCHAR(50),
  student_id VARCHAR(12) UNIQUE,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `applications`
```sql
CREATE TABLE public.applications (
  application_id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES public.users(user_id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  contact VARCHAR(20),
  college VARCHAR(255),
  branch VARCHAR(255),
  year_of_study VARCHAR(50),
  cgpa NUMERIC(3,2),
  areas_of_interest TEXT,
  duration_months INTEGER,
  start_date DATE,
  end_date DATE,
  resume_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  mentor VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `student_profiles`
```sql
CREATE TABLE public.student_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES public.users(user_id) ON DELETE CASCADE,
  name VARCHAR(100),
  email VARCHAR(255),
  dob DATE,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
  college VARCHAR(255),
  branch VARCHAR(100),
  year_of_study VARCHAR(20),
  cgpa NUMERIC(4,2),
  skills TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  resume TEXT,
  address TEXT,
  mentor VARCHAR,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `attendance`
```sql
CREATE TABLE public.attendance (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES public.users(user_id),
  student_id VARCHAR(12) REFERENCES public.users(student_id),
  name VARCHAR(100),
  email VARCHAR(100),
  date DATE DEFAULT CURRENT_DATE,
  entry_time TIME WITH TIME ZONE,
  exit_time TIME WITH TIME ZONE,
  work_mode VARCHAR(10) CHECK (work_mode IN ('office', 'home')),
  status VARCHAR(20) DEFAULT 'pending',
  is_late BOOLEAN DEFAULT FALSE,
  is_early BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

#### `certificates`
```sql
CREATE TABLE public.certificates (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES public.users(student_id) ON DELETE CASCADE,
  program_name VARCHAR(200),
  issue_date DATE,
  certificate_id VARCHAR(100) UNIQUE,
  verification_id VARCHAR(100),
  file_path VARCHAR(500),
  duration VARCHAR(50),
  domain TEXT,
  student_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending_verification',
  issued_by VARCHAR(50),
  verified_by VARCHAR(50),
  completion_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `student_tasks`
```sql
CREATE TABLE public.student_tasks (
  task_id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  assigned_by VARCHAR(50) REFERENCES users(user_id),
  assigned_to VARCHAR(50) REFERENCES users(user_id),
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `task_submissions`
```sql
CREATE TABLE public.task_submissions (
  submission_id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES student_tasks(task_id) ON DELETE CASCADE,
  student_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  file_paths TEXT[],
  marks INTEGER CHECK (marks >= 0 AND marks <= 100),
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'rejected', 'resubmitted')),
  mentor_feedback TEXT,
  reviewed_by VARCHAR(50) REFERENCES users(user_id),
  feedback_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `task_queries`
```sql
CREATE TABLE public.task_queries (
  query_id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES student_tasks(task_id),
  student_id VARCHAR(50) REFERENCES users(user_id),
  mentor_id VARCHAR(50) REFERENCES users(user_id),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `mentor_profiles`
```sql
CREATE TABLE public.mentor_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) UNIQUE REFERENCES public.users(user_id),
  name VARCHAR(100),
  email VARCHAR(100),
  contact_no VARCHAR(15),
  designation VARCHAR(100),
  area_of_expertise VARCHAR(100),
  years_of_experience INTEGER,
  bio TEXT,
  profile_photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧩 Features Summary

### 🎓 Student Features
- Apply for internships
- Upload assignments and deliverables
- View mentor feedback
- Download completion certificates
- Mark and check attendance
- Raise task-related queries
- Track internship progress

### 🧑‍🏫 Mentor Features
- Assign tasks to students
- Review and grade submissions
- Provide feedback and resolve queries
- Manage student progress
- Track attendance of assigned students

### 🧑‍💼 Admin Features
- Approve/reject internship applications
- Assign students to mentors
- Issue certificates
- Track attendance and performance
- Manage correction requests
- Generate reports

---

## 📚 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - New user registration

### Student
- `GET /api/student/dashboard` - Get student dashboard data
- `POST /api/student/attendance` - Mark attendance
- `GET /api/student/tasks` - View assigned tasks
- `POST /api/student/submissions` - Submit task
- `GET /api/student/certificate` - View/download certificate

### Mentor
- `GET /api/mentor/dashboard-data` - Mentor dashboard stats
- `POST /api/mentor/tasks` - Create new task
- `GET /api/mentor/students` - View assigned students
- `PUT /api/mentor/submissions/:id` - Review submission

### Admin
- `GET /api/admin/applications` - View all applications
- `PUT /api/admin/applications/:id` - Update application status
- `POST /api/admin/certificates` - Issue certificate

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password encryption
- **Input Validation** - All user inputs are sanitized
- **SQL Injection Protection** - Parameterized queries
- **File Upload Restrictions** - Limited file types and sizes
- **Role-Based Access Control** - Different permissions per user type

---

## ⚡ Performance Optimizations

- **Server-Side Rendering** - Fast initial page loads
- **API Route Optimization** - Efficient data fetching
- **Database Indexing** - Optimized queries
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Code splitting for better performance

---

## 🧪 Testing

### Test Credentials

| Role    | Email              | Password    |
|---------|-------------------|-------------|
| Admin   | admin@itg.com     | Admin@123   |
| Mentor  | mentor@itg.com    | Mentor@123  |
| Student | student@itg.com   | Student@123 |

---

## 🌱 Sample Seed Data

```sql
-- Admin
INSERT INTO users (user_id, user_role, name, email, password)
VALUES ('admin_001', 'admin', 'ITG Admin', 'admin@itg.com', 'hashed_password_here');

-- Mentor
INSERT INTO users (user_id, user_role, name, email, password)
VALUES ('mentor_001', 'mentor', 'John Mentor', 'mentor@itg.com', 'hashed_password_here');

-- Student
INSERT INTO users (user_id, user_role, name, email, password)
VALUES ('student_001', 'student', 'Jane Student', 'student@itg.com', 'hashed_password_here');
```

---

## 🔍 Troubleshooting

**Database Connection Error**
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check DATABASE_URL in .env.local
- Ensure database 'student' exists

**Email Not Sending**
- Enable "Less secure app access" or use App Password
- Check EMAIL_USER and EMAIL_PASS in .env.local
- Verify port 587 is open

**File Upload Issues**
- Check `uploads/` directory permissions
- Verify multer configuration in `lib/multer.js`

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   ```bash
   npm install -g vercel
   vercel deploy
   ```

3. **Set Environment Variables** in Vercel dashboard

---

## 🧠 Future Enhancements

- Internship Analytics Dashboard
- QR-based Certificate Verification
- Automated Reminders and Notifications
- AI-based Progress Evaluation
- Mobile App (React Native)
- Video Conferencing Integration

---

## 🛠️ Technologies Used

- **Next.js 14** – Full-stack React framework
- **React.js 18** – Frontend UI library
- **PostgreSQL 14** – Relational database
- **Node.js 18** – Backend runtime
- **Multer** – File upload handling
- **Nodemailer** – Email notifications
- **JWT** – Secure authentication
- **Bcrypt** – Password hashing
- **Tailwind CSS** – Styling

---

## 📞 Support

For technical support or queries:
- **Email**: support@itg.goa.gov.in
- **Phone**: +91-832-XXX-XXXX
- **Address**: InfoTech Corporation of Goa Limited, Altinho, Panaji–Goa, India

---

## 📜 License

This project is developed exclusively for **InfoTech Corporation of Goa Ltd.**
All rights reserved © 2026 InfoTech Corporation of Goa Limited.

---

**Built with ❤️ in Goa for the future of tech education**
