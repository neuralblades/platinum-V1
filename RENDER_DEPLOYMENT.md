# Platinum Square - Render Deployment Guide

This guide will help you deploy the Platinum Square real estate website to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your code pushed to a GitHub repository
3. MySQL database access (you can use PlanetScale, Railway, or any MySQL hosting service)

## Deployment Steps

### Step 1: Push Code to GitHub

Make sure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy Using render.yaml (Recommended)

1. Go to https://render.com/dashboard
2. Click "New" → "grayprint"
3. Connect your GitHub repository
4. Select the repository containing your code
5. Render will automatically detect the `render.yaml` file and create all services

### Step 3: Manual Deployment (Alternative)

If you prefer manual setup:

#### Setup MySQL Database
Since Render doesn't offer MySQL, you'll need to use an external MySQL service:

**Option 1: PlanetScale (Recommended)**
1. Go to https://planetscale.com
2. Create a free account
3. Create a new database
4. Get connection details

**Option 2: Railway**
1. Go to https://railway.app
2. Create MySQL database
3. Get connection details

**Option 3: Use your existing MySQL hosting**

#### Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `platinum-square-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

#### Deploy Frontend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `platinum-square-frontend`
   - Environment: Node
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`
   - Plan: Free

### Step 4: Configure Environment Variables

#### Backend Environment Variables
Set these in your backend service settings:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Auto-filled from database]
JWT_SECRET=[Generate a secure random string]
CORS_ORIGIN=https://platinum-square-frontend.onrender.com
```

#### Frontend Environment Variables
Set these in your frontend service settings:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://platinum-square-backend.onrender.com/api
NEXT_PUBLIC_IMAGE_URL=https://platinum-square-backend.onrender.com/uploads
```

### Step 5: Database Setup

After the backend is deployed, you'll need to run database migrations:

1. Go to your backend service in Render
2. Open the "Shell" tab
3. Run the following commands:

```bash
cd backend
npm run migrate
npm run setup-db
```

### Step 6: Custom Domain (Optional)

1. Go to your frontend service settings
2. Click "Custom Domains"
3. Add your domain (e.g., platinumsquare.com)
4. Update your DNS settings as instructed

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30+ seconds
- 750 hours/month limit per service

### Database Considerations
- Free PostgreSQL has 1GB storage limit
- Database doesn't spin down like web services
- Automatic backups included

### Performance Tips
1. Enable persistent disk for uploads (paid feature)
2. Use CDN for static assets
3. Consider upgrading to paid plans for production

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify DATABASE_URL is correctly set
   - Check if database service is running
   - Ensure SSL is properly configured

3. **CORS Errors**
   - Update CORS_ORIGIN environment variable
   - Check frontend URL in backend CORS configuration

4. **Image Upload Issues**
   - Verify upload directory permissions
   - Check file size limits
   - Consider using cloud storage (Cloudinary)

### Logs and Monitoring

- View logs in Render dashboard under each service
- Set up log alerts for critical errors
- Monitor service health via health check endpoint

## Post-Deployment Checklist

- [ ] All services are running
- [ ] Database is connected and migrated
- [ ] Frontend can communicate with backend
- [ ] Image uploads work correctly
- [ ] Authentication system works
- [ ] Contact forms send emails
- [ ] Search functionality works
- [ ] Admin panel is accessible

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Review service logs in Render dashboard
3. Check GitHub repository for any missing files
4. Verify environment variables are correctly set

## Security Considerations

- Use strong JWT secrets
- Enable HTTPS (automatic on Render)
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use environment variables for sensitive data
