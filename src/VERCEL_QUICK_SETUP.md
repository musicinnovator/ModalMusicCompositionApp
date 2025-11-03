# ⚡ Vercel Quick Setup Reference

## 🎯 What to Fill in the Vercel Deployment Form

When you import your project to Vercel, you'll see a configuration screen. Here's exactly what to enter:

---

## ✅ Build Settings (Already Pre-filled)

These should be **automatically detected**. Just verify they're correct:

| Field | Value | Status |
|-------|-------|--------|
| **Framework Preset** | Vite | ✅ Auto-detected |
| **Root Directory** | `./` | ✅ Auto-detected |
| **Build Command** | `npm run build` | ✅ Auto-detected |
| **Output Directory** | `dist` | ✅ Auto-detected |
| **Install Command** | `npm install` | ✅ Auto-detected |

⚠️ **Don't change these unless you know what you're doing!**

---

## 🔐 Environment Variables (Click "Add More" for each)

### Required Variables (Minimum to run app):

```plaintext
VITE_SUPABASE_URL
Value: https://YOUR_PROJECT_ID.supabase.co
Where: Supabase Dashboard → Settings → API → Project URL
```

```plaintext
VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (long string)
Where: Supabase Dashboard → Settings → API → Project API keys → anon public
```

### Optional Variables (For payment features):

```plaintext
VITE_STRIPE_PUBLIC_KEY
Value: pk_test_51... (for testing) or pk_live_51... (for production)
Where: Stripe Dashboard → Developers → API keys → Publishable key
Note: Use TEST keys first!
```

```plaintext
VITE_PAYPAL_CLIENT_ID
Value: AY... (long string)
Where: PayPal Developer → My Apps & Credentials → Your App → Client ID
Note: Use SANDBOX for testing!
```

---

## 🚀 Step-by-Step Process

### 1. Import Repository
- Click **"New Project"** in Vercel
- Select your GitHub repository
- Click **"Import"**

### 2. Verify Build Settings
- Check that all settings match the table above
- **Don't change anything** - they're already correct!

### 3. Add Environment Variables
- Click **"Environment Variables"** section
- Add each variable one by one:
  1. Type variable name (e.g., `VITE_SUPABASE_URL`)
  2. Paste value
  3. Click **"Add"**
  4. Repeat for each variable

### 4. Deploy
- Click **"Deploy"** button
- Wait 2-5 minutes
- ✅ **Done!** Your app is live!

---

## 📋 Quick Copy-Paste Template

To make it easier, prepare this information in a text file:

```plaintext
=== MY VERCEL ENVIRONMENT VARIABLES ===

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...YOUR_KEY_HERE...
VITE_STRIPE_PUBLIC_KEY=pk_test_...YOUR_KEY_HERE...
VITE_PAYPAL_CLIENT_ID=AY...YOUR_KEY_HERE...

===================================
```

Then copy-paste each value when adding to Vercel.

---

## 🔍 Where to Find Each Key

### Supabase Keys:
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon)
4. Click **API** in sidebar
5. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Stripe Keys:
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **Developers** in top menu
3. Click **API keys**
4. Copy **Publishable key** → `VITE_STRIPE_PUBLIC_KEY`
5. ⚠️ Make sure **Test mode** toggle is ON (for testing)

### PayPal Keys:
1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Click **My Apps & Credentials**
3. Under **Sandbox**, click your app (or create one)
4. Copy **Client ID** → `VITE_PAYPAL_CLIENT_ID`

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't** use `process.env` in code - we fixed this already!  
✅ **Do** use `import.meta.env.VITE_*` in frontend code

❌ **Don't** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend  
✅ **Do** only use it in backend (Supabase Edge Functions)

❌ **Don't** forget the `VITE_` prefix for frontend variables  
✅ **Do** prefix all frontend env vars with `VITE_`

❌ **Don't** use production keys for testing  
✅ **Do** use Stripe test keys (`pk_test_`) and PayPal sandbox

---

## 🎯 After Deployment

Once deployed, remember to:

1. ✅ Copy your Vercel URL (e.g., `https://modal-music-app.vercel.app`)
2. ✅ Add it to Supabase → Authentication → URL Configuration
3. ✅ Test your app at the live URL
4. ✅ Check browser console for any errors

---

## 🆘 If Something Goes Wrong

### Build Failed with Duplicate Members Error?
✅ **FIXED!** This has been resolved. If you still see it:
- Pull latest changes from repository
- The duplicate methods in `advanced-counterpoint-engine.ts` have been removed

### Build Failed with "No Output Directory" Error?
✅ **FIXED!** The build script has been simplified:
- Changed from `tsc && vite build` to `vite build`
- Vercel will now find the `dist/` folder correctly

### Build Failed with Other Errors?
- Check the **build logs** in Vercel
- Look for "Module not found" errors
- Verify all imports are correct
- Try building locally: `npm run build`

### App Loads But Features Don't Work?
- Check **browser console** (F12)
- Verify environment variables are set
- Make sure Supabase URL is added to allowed domains

### Can't See Environment Variables?
- Go to **Vercel Project → Settings → Environment Variables**
- Make sure they're added for **Production** environment
- Redeploy if you added them after first deployment

---

## 🎉 That's It!

Your app should now be live at:
```
https://your-app-name.vercel.app
```

**Total setup time:** ~5-10 minutes  
**Cost:** FREE (on Vercel free tier)

🚀 **You're ready to compose!** 🎵
