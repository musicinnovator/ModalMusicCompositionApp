# MIDI Deployment Guide

## Overview
The application includes comprehensive MIDI keyboard integration that routes input to Bach Variables. This guide ensures MIDI works properly in deployment environments.

## ✅ Deployment Requirements for MIDI

### 1. HTTPS Required
- **Critical**: MIDI API requires HTTPS in production
- Local development (localhost) works with HTTP
- Deploy to: Netlify, Vercel, or any HTTPS hosting

### 2. Browser Compatibility
- **Chrome/Chromium**: Full support ✅
- **Edge**: Full support ✅  
- **Firefox**: Full support ✅
- **Safari**: Limited support ⚠️ (iOS Safari has restrictions)

### 3. Permissions
- MIDI access requires user gesture (clicking on page first)
- Some browsers may prompt for MIDI permissions
- Corporate firewalls may block MIDI access

## 🚀 Deployment Steps

### Option 1: Netlify (Recommended)
```bash
# Build and deploy
npm run build
# Drag dist folder to Netlify or connect GitHub

# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Pages (with Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🔧 Testing MIDI in Deployment

### 1. Pre-Deployment Testing
- Use the built-in test system in development
- "Test All Routes" button validates Bach Variables routing
- Console logs show detailed MIDI flow

### 2. Post-Deployment Testing
1. **Connect MIDI keyboard** to computer via USB
2. **Open deployed application** in Chrome/Edge
3. **Click anywhere** on the page (activates audio context)
4. **Check MIDI status**:
   - Green "MIDI Connected" badge should appear
   - Console should show device detection
5. **Test routing**:
   - Switch to "Bach Variables" tab in Theme Composer
   - Select a Bach variable (CF, FCP1, etc.)
   - Play MIDI keyboard
   - Verify notes appear in selected variable

### 3. Troubleshooting

#### MIDI Not Detected
- **Check HTTPS**: Ensure URL starts with `https://`
- **Refresh page** after connecting MIDI keyboard
- **Try different USB port**
- **Check browser console** for error messages

#### MIDI Detected But Not Working
- **Click on page first** (browser security requirement)
- **Check Bach Variables tab** for notes
- **Verify target selection** (green badge should show target)
- **Test with virtual piano** (should still work)

#### Browser Issues
- **Chrome**: Usually works best
- **Firefox**: May need to enable `dom.webmidi.enabled` in about:config
- **Safari**: Limited support, use Chrome instead
- **Edge**: Usually works well

## 📊 Debugging Tools

### Console Commands (Browser DevTools)
```javascript
// Check MIDI support
navigator.requestMIDIAccess().then(access => {
  console.log('MIDI inputs:', Array.from(access.inputs.values()));
  console.log('MIDI outputs:', Array.from(access.outputs.values()));
});

// Test note routing manually
handleMidiNotesRecorded([60, 64, 67]); // C major chord
```

### Application Debug Features
- **MIDI Routing Test Center**: Use in development to verify logic
- **Console Logging**: Detailed MIDI flow information
- **Toast Notifications**: Real-time feedback on MIDI routing
- **Visual Indicators**: Green badges show active targets

## 🎹 Recommended MIDI Keyboards

### Budget Options
- **Akai MPK Mini**: Compact, reliable USB
- **M-Audio Keystation Mini**: Simple and effective
- **Novation Launchkey Mini**: Good build quality

### Professional Options
- **Akai MPK249/261**: Full-size with controls
- **Novation Launchkey 37/49/61**: Excellent integration
- **M-Audio Code Series**: Professional features

## 🔗 Quick Deployment Links

### Development Testing
```bash
# Local development with MIDI
npm install
npm run dev
# Open http://localhost:5173
```

### Production Deployment
```bash
# Build for production
npm run build

# Deploy to Netlify (example)
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## ✅ Deployment Checklist

- [ ] Application builds without errors
- [ ] Deployed to HTTPS URL
- [ ] MIDI keyboard connected via USB
- [ ] Browser permissions granted
- [ ] Virtual piano keyboard works
- [ ] MIDI routing test passes
- [ ] Bach Variables receive MIDI input
- [ ] Console shows no MIDI errors

## 📞 Support

If MIDI doesn't work after following this guide:
1. Check browser console for errors
2. Verify HTTPS deployment
3. Test with different MIDI keyboard
4. Try different browser (Chrome recommended)
5. Check corporate firewall/security software

The application includes comprehensive fallbacks, so composition features work without MIDI using the virtual piano keyboard and preset controls.