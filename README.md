# RBAC Configurator - Permissions & Roles Manager

A full-stack internal tool for managing Role-Based Access Control (RBAC) built with Next.js, TypeScript, Supabase, and Shadcn UI.

## 🎯 Features

### Core Features
- ✅ **User Authentication** - Secure login using Supabase Auth
- ✅ **Permission Management** - Full CRUD operations for permissions
- ✅ **Role Management** - Full CRUD operations for roles
- ✅ **Role-Permission Linking** - Assign permissions to roles and view associations
- ✅ **Permission View by Role** - See which permissions are assigned to specific roles

### Bonus Feature
- ⭐ **Natural Language Configuration** - Configure RBAC using plain English commands powered by Google Gemini AI

## 🛠️ Tech Stack

- **Framework:** Next.js 16 with TypeScript
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **UI Library:** Shadcn UI
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API (for Natural Language feature)

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Google Gemini API key (for Natural Language feature)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd rbac-configurator
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 5. Create a Test User

1. Go to Supabase Dashboard > Authentication > Users
2. Create a new user with email and password
3. Use these credentials to log in to the application

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
rbac-configurator/
├── app/
│   ├── login/          # Login page
│   ├── permissions/     # Permission management
│   ├── roles/          # Role management
│   ├── assign/         # Role-permission assignment
│   ├── natural-language/ # Natural language configurator
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/             # Shadcn UI components
│   ├── permissions-manager.tsx
│   ├── roles-manager.tsx
│   ├── assign-permissions-manager.tsx
│   └── natural-language-configurator.tsx
├── lib/
│   └── supabase/       # Supabase client configuration
├── types/
│   └── database.ts     # TypeScript types
└── supabase/
    └── schema.sql      # Database schema
```

## 🗄️ Database Schema

The application uses four main tables:

- **permissions** - Stores individual permissions
- **roles** - Stores roles
- **role_permissions** - Junction table linking roles to permissions
- **user_roles** - Junction table linking users to roles

See `supabase/schema.sql` for the complete schema with RLS policies.

## 🎮 Usage

### Managing Permissions

1. Navigate to "Permissions" from the dashboard
2. Click "Add Permission" to create a new permission
3. Edit or delete existing permissions using the action buttons

### Managing Roles

1. Navigate to "Roles" from the dashboard
2. Click "Add Role" to create a new role
3. Edit or delete existing roles using the action buttons

### Assigning Permissions to Roles

1. Navigate to "Assign Permissions"
2. Select a role from the dropdown
3. Check/uncheck permissions to assign or remove them
4. Click "Save Permissions" to apply changes

### Natural Language Configuration

1. Navigate to "Natural Language"
2. Type a command in plain English, for example:
   - "Create a new permission called publish content"
   - "Give the role Content Editor the permission to edit articles"
   - "Create a new role called Administrator"
3. Click "Execute Command" to process

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The application is optimized for Vercel deployment with Next.js.

## 📝 RBAC Explanation for Kids

**What is RBAC?**

Imagine you have a big toy box with lots of toys. RBAC is like having different rules for who can play with which toys. Some kids (roles) can play with all toys, some can only play with certain toys (permissions), and some can't play with any toys at all. This way, everyone knows what they're allowed to do, and the toys stay organized and safe!

## 🔐 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Authentication is required to access the application
- All database operations go through Supabase with proper authentication
- Environment variables should never be committed to version control

## 📧 Test Credentials

After creating a user in Supabase, use those credentials to log in:
- Email: (your test user email)
- Password: (your test user password)

## 🐛 Troubleshooting

- **Can't log in?** Make sure you've created a user in Supabase Authentication
- **Database errors?** Verify that you've run the schema.sql file in Supabase SQL Editor
- **Natural Language not working?** Check that your Gemini API key is correctly set in `.env.local`

## 📄 License

This project is created as a technical assignment.

## 👨‍💻 Developer

Built with ❤️ for the full-stack intern assignment.
