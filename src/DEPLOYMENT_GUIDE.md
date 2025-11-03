# 🚀 Deployment Guide - Modal Music Composition Engine

This guide will walk you through deploying your Modal Music Composition application to Vercel with Supabase backend.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub account** (free)
2. ✅ **Vercel account** (free) - Sign up at [vercel.com](https://vercel.com)
3. ✅ **Supabase project** (already configured)
4. ✅ **Stripe account** (optional, for payments) - [stripe.com](https://stripe.com)
5. ✅ **PayPal Developer account** (optional, for payments) - [developer.paypal.com](https://developer.paypal.com)

---

## 🔧 Step 1: Prepare Your Code

### 1.1 Export from Figma Make

1. Download all files from Figma Make
2. Create a new folder on your computer (e.g., `modal-music-app`)
3. Copy all files into this folder, maintaining the same structure

### 1.2 Initialize Git Repository

Open a terminal in your project folder and run:

```bash
# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Modal Music Composition Engine"
```

### 1.3 Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository
2. Name it `modal-music-app` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the commands shown and run them in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/modal-music-app.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..." → "Project"**
3. Click **"Import Git Repository"**
4. Select your `modal-music-app` repository
5. Click **"Import"**

### 2.2 Configure Build Settings

Vercel should auto-detect these settings. **Verify they match:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables:

| Variable Name | Value | Where to Find |
|---------------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (long string) | Supabase Dashboard → Settings → API → anon key |

#### Optional (for Payments):

| Variable Name | Value | Where to Find |
|---------------|-------|---------------|
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` or `pk_live_...` | Stripe Dashboard → Developers → API Keys |
| `VITE_PAYPAL_CLIENT_ID` | `AY...` | PayPal Developer → My Apps → Client ID |

⚠️ **Important:**
- For testing, use Stripe **test keys** (`pk_test_...`)
- For production, use Stripe **live keys** (`pk_live_...`)
- Click **"Add"** after entering each variable

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes for the build to complete
3. You'll see a success message with your live URL!

Your app will be live at: `https://your-app-name.vercel.app`

---

## 🔐 Step 3: Configure Supabase

### 3.1 Add Vercel Domain to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication → URL Configuration**
3. Add these URLs:

   **Site URL:**
   ```
   https://your-app-name.vercel.app
   ```

   **Redirect URLs (add both):**
   ```
   https://your-app-name.vercel.app/auth/callback
   https://*.vercel.app/auth/callback
   ```

4. Click **"Save"**

### 3.2 Deploy Supabase Edge Functions

If you haven't already deployed your edge functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ID from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the server function
supabase functions deploy make-server-c0ac5ce8
```

---

## 💳 Step 4: Configure Payment Providers (Optional)

### 4.1 Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → Webhooks**
3. Click **"Add endpoint"**
4. Add webhook URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/make-server-c0ac5ce8/webhook/stripe
   ```
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Webhook Signing Secret** (`whsec_...`)
7. Add it to Supabase environment variables (see Step 4.3)

### 4.2 PayPal Configuration

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Create a new app or use existing
3. Configure webhook URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/make-server-c0ac5ce8/webhook/paypal
   ```
4. Enable webhook events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

### 4.3 Add Webhook Secrets to Supabase

1. Go to Supabase Dashboard → **Settings → Edge Functions**
2. Add these secrets:
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Stripe)
   - `PAYPAL_WEBHOOK_ID` = (from PayPal)

---

## ✅ Step 5: Test Your Deployment

### 5.1 Basic Functionality Test

Visit your deployed app and test:

- [ ] App loads without errors
- [ ] Modal selector works
- [ ] Audio playback works
- [ ] Theme composer creates melodies
- [ ] File export (MIDI/MusicXML) works

### 5.2 Authentication Test (if implemented)

- [ ] Sign up creates new account
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on refresh

### 5.3 Subscription Test (if implemented)

- [ ] Free tier features work
- [ ] Premium features show paywall
- [ ] Stripe checkout opens (test mode)
- [ ] PayPal subscription opens (sandbox)

---

## 🔄 Continuous Deployment

**Good news!** Vercel automatically deploys your app whenever you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Vercel automatically builds and deploys! 🎉
```

You can view deployment status in the Vercel dashboard.

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Install missing dependencies
npm install
npm run build
```

**Error: "Type errors"**
```bash
# Solution: Fix TypeScript errors or disable strict mode temporarily
npm run build -- --mode development
```

### Environment Variables Not Working

1. Check variable names have `VITE_` prefix for frontend
2. Restart deployment after adding variables
3. Variables should be added in Vercel **Project Settings → Environment Variables**

### CORS Errors

1. Verify your domain is added to Supabase allowed origins
2. Check URL format matches exactly: `https://your-app.vercel.app`

### Audio Not Playing

1. Check Soundfont files are included in build
2. Verify AudioContext is created after user interaction
3. Check browser console for specific errors

### Payments Not Working

1. Verify you're using **test mode** keys for Stripe
2. Check webhook URLs are correctly configured
3. Test with Stripe test card: `4242 4242 4242 4242`

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)

1. Go to your Vercel project
2. Click **"Analytics"** tab
3. View real-time traffic and performance

### Error Tracking (Optional)

Consider adding error tracking:

- **Sentry** - [sentry.io](https://sentry.io) (free tier)
- **LogRocket** - [logrocket.com](https://logrocket.com) (free tier)

---

## 🌍 Custom Domain (Optional)

### Add Your Own Domain

1. Purchase domain from **Namecheap**, **Google Domains**, or **GoDaddy**
2. In Vercel, go to **Project Settings → Domains**
3. Click **"Add"** and enter your domain (e.g., `modalmusic.com`)
4. Follow DNS configuration instructions
5. Add CNAME record to your DNS provider:
   ```
   CNAME → cname.vercel-dns.com
   ```
6. Wait 24-48 hours for DNS propagation
7. SSL certificate is automatic! 🔒

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Vercel Hosting** | Unlimited personal projects | $20/mo Pro |
| **Supabase Database** | 500MB DB, 2GB storage, 2GB bandwidth | $25/mo Pro |
| **Stripe Payments** | Free (2.9% + $0.30 per transaction) | - |
| **PayPal Payments** | Free (2.9% + $0.30 per transaction) | - |
| **Custom Domain** | - | ~$12/year |

**Total Cost:** **FREE** for most apps! 🎉

---

## 🎯 Production Checklist

Before going live with real payments:

- [ ] Switch Stripe from test keys to live keys
- [ ] Switch PayPal from sandbox to production
- [ ] Configure production webhook URLs
- [ ] Test full payment flow with real card (then refund)
- [ ] Set up error monitoring
- [ ] Add analytics
- [ ] Create privacy policy and terms of service
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Add custom domain (optional)

---

## 📞 Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)

---

## 🎉 You're Live!

Congratulations! Your Modal Music Composition Engine is now live and accessible worldwide.

Share your app at: `https://your-app-name.vercel.app`

🎵 **Happy Composing!** 🎵
