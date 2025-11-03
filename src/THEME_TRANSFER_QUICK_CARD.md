# Theme Transfer Quick Reference Card 🎵

---

## 📋 Two New Features

### 1️⃣ Traditional → Bach Variable
**Add current theme to any Bach Variable**

```
Location: Traditional Tab → Current Theme header
Controls: [Dropdown ▼] [Add to BV Button]
Action:   Select variable → Click button → Done!
```

### 2️⃣ Bach Variable ← Theme  
**Add Traditional theme to active Bach Variable**

```
Location: Bach Variables Tab → Button Group
Controls: [Add Theme Button with Badge]
Action:   Click button → Theme added → Done!
```

---

## 🎯 How to Use

### From Traditional Tab
```
1. Create theme (C, D, E, F, G)
2. Select "CF" from dropdown
3. Click "Add to BV"
4. ✅ Theme now in Cantus Firmus!
```

### From Bach Variables Tab
```
1. Have theme in Traditional
2. Switch to Bach Variables tab
3. Select variable tab (FCP1)
4. Click "Add Theme [5]"
5. ✅ Theme added to FCP1!
```

---

## 🎨 Visual Guide

### Traditional Tab
```
┌─ Current Theme (5 elements) ───────────┐
│  [Select variable... ▼] [➕ Add to BV] │
│  [C4] [D4] [E4] [F4] [G4]              │
└──────────────────────────────────────────┘
```

### Bach Variables Tab
```
┌─ Florid Counterpoint 1 ────────────────┐
│  [🔀] [➕ Add Theme 5] [📋] [🎵] [🗑️]  │
│        └─ Blue button!                  │
└──────────────────────────────────────────┘
```

---

## 💡 Pro Tips

### Distribute Theme Across Variables
```
Traditional theme: [C, E, G, C]
→ Add to CF
→ Add to FCP1  
→ Add to CFF1
Result: Same theme in 3 variables!
```

### Build Longer Melodies
```
CF has: [G, A]
Click "Add Theme" (theme is [C, D, E])
CF now: [G, A, C, D, E]
```

### Quick Composition
```
1. Test idea in Traditional
2. Like it? → Add to Bach Variable
3. Don't like it? → Clear and try again
4. No lost work!
```

---

## 🔍 Visual Checklist

### Traditional Tab
- [ ] Dropdown next to "Current Theme"
- [ ] Shows "Select variable..." placeholder
- [ ] Lists all Bach Variables (CF, FCP1, etc.)
- [ ] "Add to BV" button appears
- [ ] Button disabled until variable selected

### Bach Variables Tab
- [ ] "Add Theme" button after Random button
- [ ] Blue background color
- [ ] Badge shows note count
- [ ] Only visible when theme has notes
- [ ] Works on all variable tabs

---

## 🎵 Common Workflows

### Fugue Composition
```
1. Create subject → Traditional
2. Add to Cantus Firmus
3. Create answer → Traditional
4. Add to FCP1
5. Generate fugue!
```

### Thematic Variation
```
1. Base theme → CF
2. Variation 1 → FCP1
3. Variation 2 → FCP2
4. Use all in imitations
```

### Quick Prototyping
```
1. Try melody → Traditional
2. Like part? → Add to BV
3. Clear Traditional
4. Try next idea
```

---

## ⚠️ Things to Know

### Append Behavior
- Transfers **ADD** to existing notes
- Don't **REPLACE** existing notes
- Multiple clicks = multiple copies

### Data Preservation
- Original theme stays in Traditional
- Safe to transfer multiple times
- No data loss on transfer

### Toast Notifications
- "Added X notes to [Variable]"
- Confirms successful transfer
- Shows exact note count

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Dropdown empty | Check bachVariables prop passed |
| Button disabled | Select variable first |
| "Add Theme" missing | Create notes in Traditional |
| Notes not showing | Check correct Bach Variable tab |

---

## ⌨️ Keyboard Shortcuts

*Currently none - feature uses mouse/click only*

Future: Could add Ctrl+Shift+B for "Add to BV"

---

## 📊 Feature Comparison

| Feature | Location | Color | Purpose |
|---------|----------|-------|---------|
| **Add to BV** | Traditional | Default | Theme → Bach Var |
| **Add Theme** | Bach Variables | Blue | Theme → Active BV |
| **Use as Theme** | Bach Variables | Green | Bach Var → Theme |

---

## 🎉 Quick Facts

- ✅ **2 new buttons**
- ✅ **1 new dropdown**
- ✅ **Both directions work**
- ✅ **Instant transfer**
- ✅ **Visual feedback**
- ✅ **Error-free**

---

## 📖 More Info

- Full Guide: `THEME_BACH_VARIABLE_TRANSFER_COMPLETE.md`
- Quick Test: `THEME_TRANSFER_QUICK_TEST.md`
- Summary: `IMPLEMENTATION_SUMMARY_THEME_TRANSFER.md`

---

**Keep this card handy for quick reference!** 📌

*Harris Software Solutions LLC*
