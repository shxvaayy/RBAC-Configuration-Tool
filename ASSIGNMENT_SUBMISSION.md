# RBAC Configurator - Assignment Submission

## 📦 Project Overview

This is a complete full-stack RBAC (Role-Based Access Control) configuration tool built as per the assignment requirements.

## ✅ Completed Features

### Core Requirements
- ✅ User Authentication with Supabase Auth
- ✅ Permission Management (Full CRUD)
- ✅ Role Management (Full CRUD)
- ✅ Role-Permission Assignment Interface
- ✅ View Permissions by Role

### Bonus Feature
- ⭐ Natural Language Configuration using Google Gemini API

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Create a project at supabase.com
   - Run the SQL schema from `supabase/schema.sql`
   - Get your project URL and anon key

3. **Configure Environment**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials
   - Add your Gemini API key (optional, for Natural Language feature)

4. **Create Test User**
   - Go to Supabase Dashboard > Authentication
   - Create a new user

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📋 Test Credentials

After creating a user in Supabase Authentication, use those credentials to log in.

**Note:** You need to create the user in Supabase Dashboard first.

## 🔗 Important Links

- **GitHub Repository:** https://github.com/shxvaayy/RBAC-Configuration-Tool
- **Live URL:** https://rbac-configuration-tool-rosy.vercel.app

## 📝 RBAC Explanation for Kids

**What is RBAC?**

Imagine you have a big toy box with lots of toys. RBAC is like having different rules for who can play with which toys. Some kids (roles) can play with all toys, some can only play with certain toys (permissions), and some can't play with any toys at all. This way, everyone knows what they're allowed to do, and the toys stay organized and safe!

## 🛠️ Tech Stack

- Next.js 16 with TypeScript
- Supabase (PostgreSQL + Auth)
- Shadcn UI
- Tailwind CSS
- Google Gemini API (for Natural Language feature)

## 📁 Project Structure

```
rbac-configurator/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/supabase/          # Supabase client setup
├── types/                 # TypeScript types
└── supabase/              # Database schema
```

## 🎯 Features Demo

1. **Login Page** - Secure authentication
2. **Dashboard** - Overview with navigation cards
3. **Permissions** - Create, edit, delete permissions
4. **Roles** - Create, edit, delete roles
5. **Assign Permissions** - Link permissions to roles with checkboxes
6. **Natural Language** - Configure using plain English commands

## 🚢 Deployment

The project is ready for Vercel deployment. Just:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

## 📧 Contact

For any questions about this assignment, please contact:
- Email: [Your email]
- Phone: +91-7291967432 (Akshat)

---

**Built with ❤️ for the Full-Stack Intern Assignment**

