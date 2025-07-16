# 🚀 Deployment Guide: Take Your Networking App Live

This guide will help you deploy your networking app so beta testers can access it online.

## Quick Overview
- **Backend**: Deploy to Railway (handles database automatically)
- **Frontend**: Deploy to Vercel (connects to GitHub, auto-deploys)
- **Total time**: ~15-20 minutes

---

## Step 1: Deploy Backend to Railway 🚂

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Click "Start a New Project"

### 1.2 Deploy Backend
1. Click "Deploy from GitHub repo"
2. Connect your GitHub account if needed
3. Select your repository: `my-first-project`
4. Select the `networking-app-backend` folder
5. Railway will auto-detect it's a Python app

### 1.3 Configure Environment Variables
In Railway dashboard:
1. Go to your project → Variables tab
2. Add these environment variables:
```
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secure-secret-key-change-this
FRONTEND_URL=https://your-app-name.vercel.app
```

### 1.4 Get Your Backend URL
- After deployment, Railway gives you a URL like: `https://networking-app-production.up.railway.app`
- **Save this URL** - you'll need it for the frontend

---

## Step 2: Deploy Frontend to Vercel ⚡

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"

### 2.2 Deploy Frontend
1. Import your GitHub repository
2. Select the `connect-me-nextjs` folder
3. Vercel auto-detects it's a Next.js app

### 2.3 Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```
(Use the Railway URL from Step 1.4)

### 2.4 Deploy
- Click "Deploy"
- Vercel gives you a URL like: `https://your-app-name.vercel.app`

---

## Step 3: Update CORS Settings 🔒

### 3.1 Update Backend CORS
1. Go back to Railway dashboard
2. Add/update environment variable:
```
FRONTEND_URL=https://your-vercel-url.vercel.app
```
3. Redeploy if needed

---

## Step 4: Test Your Live App ✅

### 4.1 Test Backend
1. Visit: `https://your-railway-url.up.railway.app/docs`
2. You should see the FastAPI documentation
3. Try the `/health` endpoint

### 4.2 Test Frontend
1. Visit: `https://your-vercel-url.vercel.app`
2. Try registering a new account
3. Test the admin dashboard with demo credentials

### 4.3 Create Admin User
Visit your backend docs and use the `/auth/register` endpoint to create an admin user, or:

1. Go to Railway → your project → Database
2. Open database console
3. Run: `UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';`

---

## Step 5: Share with Beta Testers 🎯

### 5.1 Demo Credentials
Create demo credentials for testers:
- **Regular User**: demo@example.com / password123
- **Admin Access**: admin@example.com / admin123

### 5.2 Beta Tester Instructions
Send this to your testers:

```
🎉 Welcome to [Your App Name] Beta!

Access the app: https://your-vercel-url.vercel.app

Quick Start:
1. Register with your email
2. Upload your LinkedIn connections CSV
3. Explore the dashboard and analytics

Demo credentials (if needed):
- Email: demo@example.com
- Password: password123

Please report any issues or feedback!
```

---

## Troubleshooting 🔧

### Common Issues:

**Backend not responding**
- Check Railway logs: Dashboard → Deployments → View Logs
- Verify environment variables are set

**CORS errors**
- Ensure FRONTEND_URL matches your Vercel domain exactly
- Check Railway environment variables

**Database issues**
- Railway automatically creates SQLite database
- Check if database tables were created properly

**Frontend can't connect to backend**
- Verify NEXT_PUBLIC_API_URL is set correctly in Vercel
- Check if Railway backend is running

---

## Next Steps 📈

Once live and tested:
1. **Custom Domain**: Add your own domain in Vercel settings
2. **Database Upgrade**: Switch to PostgreSQL for production scale
3. **Monitoring**: Add error tracking (Sentry) and analytics
4. **Email Setup**: Configure SMTP for user notifications
5. **Payments**: Add Stripe for subscription billing

---

## Cost Estimate 💰

**Free Tier (Perfect for Beta)**:
- Railway: Free tier includes 500 hours/month
- Vercel: Free tier includes unlimited deployments
- **Total**: $0/month for testing phase

**Production Scale**:
- Railway: ~$5-20/month (depending on usage)
- Vercel: Free for most use cases
- Custom domain: ~$10-15/year

---

## Support 🆘

If you run into issues:
1. Check the deployment logs first
2. Verify all environment variables
3. Test endpoints individually
4. Consider using Railway's database console for debugging

Your networking app should now be live and ready for beta testing! 🎉