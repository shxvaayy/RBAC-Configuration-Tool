# Complete Setup Guide for RBAC Configurator

## Step-by-Step Setup Instructions

### 1. Prerequisites
- Node.js 18 or higher installed
- A Supabase account (free tier works)
- A Google account (for Gemini API key - optional)

### 2. Install Dependencies

```bash
cd rbac-configurator
npm install
```

### 3. Set Up Supabase

#### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `rbac-configurator` (or any name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to be created (takes ~2 minutes)

#### 3.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

#### 3.3 Get API Credentials
1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" > "anon public")

### 4. Get Gemini API Key (Optional - for Natural Language feature)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the API key

### 5. Configure Environment Variables

1. Create a file named `.env.local` in the `rbac-configurator` folder
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Replace the placeholder values with your actual credentials

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

### 6. Create a Test User

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Fill in:
   - **Email**: `admin@example.com` (or any email)
   - **Password**: (choose a strong password)
4. Click **Create user**
5. **Save these credentials** - you'll use them to log in

### 7. Run the Application

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 8. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to `/login`
3. Log in with the credentials you created in step 6
4. You should see the dashboard with 4 cards

### 9. Test Features

#### Test Permissions
1. Click "Manage Permissions"
2. Click "Add Permission"
3. Create a permission: Name: `can_edit_articles`, Description: `Can edit articles`
4. Try editing and deleting

#### Test Roles
1. Click "Manage Roles"
2. Click "Add Role"
3. Create a role: Name: `Content Editor`
4. Try editing and deleting

#### Test Assignment
1. Click "Assign Permissions"
2. Select a role
3. Check some permissions
4. Click "Save Permissions"

#### Test Natural Language (if Gemini API key is set)
1. Click "Try It Out"
2. Type: "Create a new permission called publish content"
3. Click "Execute Command"
4. Check if the permission was created

## Troubleshooting

### "Failed to load permissions/roles"
- Check that you ran the SQL schema in Supabase
- Verify your environment variables are correct
- Check browser console for errors

### "Authentication error"
- Make sure you created a user in Supabase Authentication
- Verify your Supabase URL and anon key are correct

### "Gemini API key not configured"
- This is normal if you didn't add the Gemini API key
- The Natural Language feature won't work without it
- All other features will work fine

### Can't log in
- Make sure you created a user in Supabase Dashboard
- Check that the email and password are correct
- Try resetting the password in Supabase Dashboard

## Next Steps

Once everything is working:
1. Test all CRUD operations
2. Try the Natural Language feature
3. Deploy to Vercel (see README.md for instructions)

## Deployment Checklist

Before deploying to Vercel:
- [ ] All features tested locally
- [ ] Environment variables ready
- [ ] Supabase project is active
- [ ] Test user created
- [ ] README.md updated with your repository and deployment URLs

---

**Need Help?** Contact: +91-7291967432 (Akshat)

