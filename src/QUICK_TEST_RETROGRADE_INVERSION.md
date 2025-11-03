# Quick Test: Retrograde & Inversion Fix
**2-Minute Verification Test**

---

## 🔄 Test 1: Retrograde (30 seconds)

1. **Create theme:** Click on piano keys to add: **C4 D4 E4 F4 G4**
2. **Go to Counterpoint Engine** → Basic → Techniques
3. **Select:** Retrograde
4. **Click:** Generate Counterpoint
5. **Open console** (F12)

### ✅ Success Indicators:
- Console shows: `🔄 RETROGRADE: Input theme: [60, 62, 64, 65, 67]`
- Console shows: `🔄 RETROGRADE: Output (reversed): [67, 65, 64, 62, 60]`
- Melody visualizer shows: **G4 F4 E4 D4 C4** (reversed)
- Play button works and sounds like theme backwards

---

## 🔃 Test 2: Inversion with Axis Control (60 seconds)

### Step 1: Default (First Note Axis)
1. **Same theme:** C4 D4 E4 F4 G4
2. **Select:** Inversion
3. **You should see:** New "Inversion Axis Control" section (blue background)
4. **Default setting:** "First Note"
5. **Generate**

**Expected:** First note (C4) stays same, others invert

### Step 2: Try Custom Axis
1. **In Inversion Axis Control:** Select "Custom" from dropdown
2. **Slider appears** - drag to 64 (shows "MIDI 64 = E4")
3. **Generate again**

**Expected:** Different result than before, axis now at E4

### ✅ Success Indicators:
- Blue "Inversion Axis Control" panel visible
- Dropdown has 4 options (First/Last/Middle/Custom)
- Custom slider works and shows note name
- Console shows: `🔃 INVERSION: Using CUSTOM axis: 64`
- Generated counterpoint different from before

---

## 🎯 Quick Verification

Open console (F12) and look for:
```
🔄 RETROGRADE: Input theme: [...]
🔄 RETROGRADE: Output (reversed): [...]
🔄 RETROGRADE: Verification - first becomes last: ...
```
or
```
🔃 INVERSION: Using CUSTOM axis: ...
🔃 INVERSION: Input theme: [...]
🔃 INVERSION: Output (inverted): [...]
```

**If you see these logs → ✅ FIX IS WORKING**

---

## 🐛 If Something's Wrong

### Retrograde sounds wrong:
1. Check console - are arrays reversed correctly?
2. If arrays correct but sound wrong → clear counterpoints and try again
3. Check rhythm settings aren't interfering

### Inversion axis not showing:
1. Make sure "Inversion" technique is selected
2. Refresh page
3. Check browser console for errors

---

## 📊 Expected Console Output

### Retrograde Example:
```javascript
🔄 RETROGRADE: Input theme: [60, 62, 64, 65, 67]
🔄 RETROGRADE: Output (reversed): [67, 65, 64, 62, 60]
🔄 RETROGRADE: Verification - first becomes last: 60 → 60 match: true
```

### Inversion Example (Custom Axis 64):
```javascript
🔃 INVERSION: Using CUSTOM axis: 64
🔃 INVERSION: Input theme: [60, 64, 67]
🔃 INVERSION: Axis note (MIDI): 64
🔃 INVERSION: Note 0: 60 → distance -4 → inverted 68 → constrained 68
🔃 INVERSION: Note 1: 64 → distance 0 → inverted 64 → constrained 64
🔃 INVERSION: Note 2: 67 → distance 3 → inverted 61 → constrained 61
🔃 INVERSION: Output (inverted): [68, 64, 61]
```

---

**Total Test Time:** 90 seconds  
**Success Criteria:** Console logs match, UI controls visible and functional
