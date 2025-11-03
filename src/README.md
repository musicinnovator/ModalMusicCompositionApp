# 🎵 Modal Music Composition Engine

A comprehensive web application for musical composition implementing advanced modal systems, counterpoint algorithms, fugue construction, and professional audio playback.

## ✨ Features

### Core Composition Tools
- **80+ Musical Modes** across 6 modal systems (Gregorian, Modern, Byzantine, Persian, Indian, Jazz)
- **Advanced Counterpoint Engine** with species counterpoint and melodic imitation at any interval
- **AI-Driven Fugue Generator** with modal-compliant subject generation
- **Complete Canon Engine Suite** with 14+ canon types (Crab, Mirror, Augmentation, etc.)
- **Professional Timeline** with DAW-style clip management
- **Comprehensive Rhythm Controls** with dotted notes, triplets, and custom patterns

### Audio & Export
- **Soundfont-based Audio** with 100+ professional instruments
- **Audio Effects Engine** (reverb, delay, chorus, distortion, etc.)
- **MIDI Export/Import** with full rhythm preservation
- **MusicXML Export** for notation software
- **Multi-file Upload** support

### UI & Themes
- **16+ Professional UI Themes** (Bach, Mozart, Debussy, Minimalist, etc.)
- **Famous Composer Accompaniment Library** with JSON upload
- **MIDI to Accompaniment Converter**
- **Comprehensive Arpeggio Pattern System**
- **Undo/Redo System** with draggable history

### Subscription System
- **Three Tiers:** Free, Premium ($9.99/mo), Pro ($19.99/mo)
- **Feature Gating** for premium features
- **Stripe + PayPal Integration**
- **User Authentication** via Supabase Auth

## 🚀 Quick Start

### For Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/modal-music-app.git
   cd modal-music-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and payment credentials
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

### For Production Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete instructions.

**Quick Reference:** [VERCEL_QUICK_SETUP.md](./VERCEL_QUICK_SETUP.md)

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment to Vercel
- **[Vercel Quick Setup](./VERCEL_QUICK_SETUP.md)** - Quick reference for Vercel configuration
- **[Canon Engine User Guide](./CANON_ENGINE_USER_GUIDE.md)** - How to use all 14 canon types
- **[Fugue Generator README](./FUGUE_GENERATOR_README.md)** - AI fugue generation guide
- **[Harmony Engine Guide](./HARMONY_ENGINE_QUICK_START.md)** - Chord progression system
- **[Complete Song Creation Suite Guide](./COMPLETE_SONG_CREATION_SUITE_GUIDE.md)** - Timeline and DAW features
- **[Composer Accompaniment Quick Start](./COMPOSER_ACCOMPANIMENT_QUICK_START.md)** - Famous composer styles

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS 4.0** for styling
- **Vite** for fast builds
- **Motion (Framer Motion)** for animations
- **shadcn/ui** component library
- **Lucide React** icons

### Backend
- **Supabase** (PostgreSQL database, Auth, Edge Functions)
- **Hono** web framework for edge functions
- **Stripe API** for payments
- **PayPal API** for payments

### Audio
- **Web Audio API** for synthesis and effects
- **Soundfont Player** for instrument sounds
- **MIDI parsing** for import/export

## 🔐 Environment Variables

Required variables for deployment:

```bash
# Frontend (Vite - must prefix with VITE_)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLIC_KEY=pk_test_or_pk_live_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Backend (Supabase Edge Functions - no VITE_ prefix)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=postgresql://...
```

See [.env.example](./.env.example) for details.

## 📦 Project Structure

```
modal-music-app/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── billing/         # Payment & subscription
│   ├── professional/    # Professional UI wrappers
│   └── ui/              # shadcn/ui components
├── lib/                 # Core libraries
│   ├── musical-engine.ts
│   ├── canon-engine.ts
│   ├── fugue-builder-engine.ts
│   ├── harmony-engine.ts
│   ├── soundfont-audio-engine.ts
│   └── ...
├── hooks/               # React hooks
├── types/               # TypeScript definitions
├── styles/              # Global CSS
├── supabase/
│   └── functions/
│       └── server/      # Edge functions
└── utils/               # Utility functions
```

## 🎯 Key Features by Subscription Tier

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| **Basic Modes** | 20 modes | ✅ All | ✅ All |
| **Counterpoint** | ✅ | ✅ | ✅ |
| **Theme Composer** | ✅ | ✅ | ✅ |
| **Canon Engine** | ❌ | ✅ | ✅ |
| **AI Fugue Generator** | ❌ | ✅ | ✅ |
| **Harmony Engine** | Basic | ✅ Full | ✅ Full |
| **Professional Timeline** | ❌ | ✅ | ✅ |
| **Audio Effects** | Basic | ✅ Full | ✅ Full |
| **MIDI/MusicXML Export** | 3/day | ✅ Unlimited | ✅ Unlimited |
| **Cloud Save** | ❌ | ✅ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ |

## 🧪 Development

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Type checking:
```bash
npx tsc --noEmit
```

## 🤝 Contributing

This is a private project. Contributions are currently not accepted.

## 📄 License

Copyright © 2025. All rights reserved.

## 🆘 Support

For deployment issues, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [VERCEL_QUICK_SETUP.md](./VERCEL_QUICK_SETUP.md)

For feature documentation, see the individual guides listed above.

## 🎉 Credits

Built with:
- React & TypeScript
- Vite & Tailwind CSS
- Supabase & Stripe
- Web Audio API
- shadcn/ui components

---

**🎵 Start composing with modal music theory!** 🎵
