# Deployment Guide for MongoDB Excel Data API

This guide will walk you through deploying both the backend and frontend components of the MongoDB Excel Data API project.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB account (for production database)
- Git
- Account on a hosting platform (Heroku, Vercel, DigitalOcean, AWS, etc.)

## Step 1: Prepare Your MongoDB Database

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access (create a user with password)
4. Set up network access (IP whitelist)
5. Get your connection string from Atlas dashboard
6. Replace the connection string in your `.env` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/excel_data?retryWrites=true&w=majority
```

### Option 2: Use a Self-Hosted MongoDB Instance

If you're deploying to a VPS or dedicated server, you can install MongoDB directly on the server.

## Step 2: Prepare the Backend for Deployment

1. Update your `.env` file with production settings:

```
MONGODB_URI=<your-production-mongodb-uri>
PORT=3000
NODE_ENV=production
```

2. Make sure all dependencies are correctly listed in `package.json`

## Step 3: Prepare the Frontend for Deployment

1. Update the API base URL in your frontend code to point to your production backend URL
2. Build the frontend for production:

```bash
cd client
npm run build
```

This will create a `dist` folder with optimized production files.

## Step 4: Deployment Options

### Option 1: Deploy to Heroku

#### Backend Deployment

1. Create a `Procfile` in the root directory with the following content:

```
web: node index.js
```

2. Initialize a Git repository (if not already done):

```bash
git init
git add .
git commit -m "Initial commit"
```

3. Create a Heroku app and deploy:

```bash
heroku create mongodb-excel-api
git push heroku main
```

4. Set environment variables on Heroku:

```bash
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set NODE_ENV=production
```

#### Frontend Deployment

For the frontend, you have two options:

1. **Deploy separately on Vercel or Netlify**:
   - Connect your GitHub repository
   - Set the build command to `cd client && npm install && npm run build`
   - Set the publish directory to `client/dist`

2. **Serve frontend from the backend**:
   - Add this code to your `index.js` file:

```javascript
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
```

### Option 2: Deploy to DigitalOcean App Platform

1. Create a new app on DigitalOcean App Platform
2. Connect your GitHub repository
3. Configure the app:
   - Set the run command to `npm start`
   - Add environment variables (MONGODB_URI, NODE_ENV, etc.)
4. Deploy the app

### Option 3: Deploy to AWS Elastic Beanstalk

1. Install the EB CLI
2. Initialize your EB environment:

```bash
eb init
```

3. Create an environment and deploy:

```bash
eb create mongodb-excel-api-env
```

4. Set environment variables:

```bash
eb setenv MONGODB_URI=<your-mongodb-uri> NODE_ENV=production
```

## Step 5: Verify Your Deployment

1. Test your API endpoints using tools like Postman or cURL
2. Check that the frontend is correctly communicating with the backend
3. Monitor your application logs for any errors

## Additional Production Considerations

1. **Security**:
   - Implement proper authentication and authorization
   - Use HTTPS
   - Secure your MongoDB connection

2. **Performance**:
   - Consider adding caching mechanisms
   - Optimize database queries
   - Implement rate limiting

3. **Monitoring**:
   - Set up logging and monitoring tools
   - Configure alerts for critical errors

4. **Scaling**:
   - Consider using a load balancer if needed
   - Implement database indexing for better performance

5. **Backup**:
   - Set up regular database backups

By following this guide, you should be able to successfully deploy your MongoDB Excel Data API project to production.