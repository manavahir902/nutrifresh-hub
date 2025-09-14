# Ngrok Setup for Consistent Domain

## 🚀 **Quick Setup Steps:**

### 1. **Get Your Ngrok Auth Token**
- Go to [ngrok.com](https://ngrok.com)
- Sign up for a free account
- Get your auth token from the dashboard

### 2. **Update the Config File**
- Open `ngrok.yml`
- Replace `YOUR_NGROK_AUTH_TOKEN` with your actual token

### 3. **Start the Application with Ngrok**

**Option A: Using the Batch File (Windows)**
```bash
start-with-ngrok.bat
```

**Option B: Using PowerShell**
```powershell
.\start-with-ngrok.ps1
```

**Option C: Manual Commands**
```bash
# Terminal 1: Start the dev server
npm run dev

# Terminal 2: Start ngrok
ngrok start nutrifresh --config=ngrok.yml
```

## 🌐 **Your Consistent Domain**
Once set up, your app will be available at:
**`https://nutrifresh-hub.ngrok-free.app`**

## 📝 **Important Notes:**
- The free plan allows one reserved subdomain
- Make sure to use the same subdomain name each time
- The domain will remain consistent as long as you use the same config

## 🔧 **Troubleshooting:**
- If you get "subdomain already in use", try a different subdomain name
- Make sure your auth token is correct
- Ensure the dev server is running on port 5174
