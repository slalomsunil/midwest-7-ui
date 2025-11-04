# Environment Configuration Guide

## Azure Static Web Apps Environment Variables

### The Problem
In Azure Static Web Apps, environment variables must be available at **build time**, not runtime, because the app is served as static files after building.

### Solution

1. **Set Environment Variable in Azure Portal**:
   - Go to your Azure Static Web App in the Azure Portal
   - Navigate to **Settings** → **Configuration** 
   - Add a new Application Setting:
     - **Name**: `REACT_APP_API_BASE_URL`
     - **Value**: `https://api-web-app-cjgyegghcqadgve7.eastus2-01.azurewebsites.net`

2. **Trigger a New Deployment**:
   - Push a new commit to your repository to trigger a rebuild
   - The environment variable will be embedded into the build during the CI/CD process

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. The `.env.local` file will use localhost for local development.

### Verification

After deployment, check the browser console for these debug messages:
- `🌐 Using API_BASE_URL: https://api-web-app-cjgyegghcqadgve7.eastus2-01.azurewebsites.net`
- If you see a warning about localhost in production, the environment variable wasn't set correctly

### Troubleshooting

**Still seeing localhost in production?**
1. Verify the environment variable is set in Azure Portal Application Settings
2. Make sure you've pushed a new commit after setting the variable
3. Check that the build completed successfully in Azure DevOps/GitHub Actions
4. The variable name must be exactly: `REACT_APP_API_BASE_URL`

**Important Notes:**
- Environment variables in React must start with `REACT_APP_`
- Changes to environment variables require a new build/deployment
- Environment variables are embedded at build time, not runtime