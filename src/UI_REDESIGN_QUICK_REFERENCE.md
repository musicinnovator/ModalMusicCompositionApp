# UI Redesign - Quick Reference Card
**Instant lookup for common styling patterns**

---

## 🎨 Feature Colors - Copy & Paste

```tsx
/* Theme/Main Melody */
<Card className="feature-theme feature-panel">

/* Counterpoint Engine */
<Card className="feature-counterpoint feature-panel">

/* Imitations */
<Card className="feature-imitation feature-panel">

/* Fugues */
<Card className="feature-fugue feature-panel">

/* Canons */
<Card className="feature-canon feature-panel">

/* Bach Variables */
<Card className="feature-bach feature-panel">

/* Modal Theory */
<Card className="feature-mode feature-panel">

/* Playback Controls */
<Card className="feature-playback feature-panel">
```

---

## 📏 Spacing - Quick Classes

```tsx
/* Tight spacing (4px gap) */
<div className="space-rhythm-tight">

/* Compact spacing (8px gap) */
<div className="space-rhythm-compact">

/* Standard spacing (16px gap) */
<div className="space-rhythm-standard">

/* Generous spacing (24px gap) */
<div className="space-rhythm-generous">

/* Section spacing (32px gap) */
<div className="space-rhythm-section">
```

---

## 🏗️ Elevation - Depth Levels

```tsx
/* Subtle depth - flat cards */
<Card className="elevation-low">

/* Standard depth - panels */
<Card className="elevation-medium">

/* Prominent depth - modal backgrounds */
<Card className="elevation-high">

/* Maximum depth - tooltips */
<div className="elevation-extreme">
```

**Pro Tip:** All elevation classes auto-increase depth on hover!

---

## 📝 Typography - Text Classes

```tsx
/* Display text (30px, bold) */
<h1 className="text-display">

/* Heading (24px, semibold) */
<h2 className="text-heading">

/* Title (20px, semibold) */
<h3 className="text-title">

/* Body text (16px, normal) */
<p className="text-body">

/* Caption (14px, muted) */
<span className="text-caption">

/* Label (14px, medium) */
<Label className="text-label">

/* Micro text (12px, muted) */
<span className="text-micro">
```

---

## ✨ Transitions - Smooth Motion

```tsx
/* General UI transitions (250ms) */
<Button className="transition-smooth">

/* Quick feedback (150ms) */
<Button className="transition-fast">

/* Playful bounce (400ms) */
<Badge className="transition-bounce">

/* Elastic spring (500ms) */
<Card className="transition-spring">
```

---

## 🎬 Entrance Animations

```tsx
/* Slide from right */
<Card className="animate-slide-in-right">

/* Slide from left */
<Card className="animate-slide-in-left">

/* Slide from bottom */
<Card className="animate-slide-in-up">

/* Simple fade in */
<div className="animate-fade-in">

/* Scale in from center */
<div className="animate-scale-in">
```

---

## 🖱️ Hover Effects

```tsx
/* Lift on hover (-2px translateY) */
<Button className="hover-lift">

/* Glow on hover (primary color) */
<Button className="hover-glow">

/* Brightness increase */
<Card className="hover-brighten">
```

---

## 🎯 Active/Playing States

```tsx
/* Pulsing glow (for playing audio) */
<Button className={isPlaying ? "active-glow" : ""}>

/* Subtle pulse animation */
<div className={isActive ? "active-pulse" : ""}>
```

---

## 🎹 Specialized Components

### Piano Keys

```tsx
/* White key */
<button className="piano-key-white">C4</button>

/* Black key */
<button className="piano-key-black">C#4</button>
```

### Transport Bar (Playback Controls)

```tsx
<div className="transport-bar">
  <Button className="transport-button">
    <SkipBack />
  </Button>
  <Button className="transport-button playing">
    <Play />
  </Button>
</div>
```

### Track Lane (DAW-style)

```tsx
<div className="track-lane">
  <div className="voice-indicator" style={{ background: '#6366f1' }} />
  <span>Voice 1</span>
</div>
```

### Level Meter (Audio)

```tsx
<div className="level-meter">
  <div className="level-meter-bar" style={{ width: '65%' }} />
</div>
```

### Note Display (Monospace)

```tsx
<div className="note-display">C4 D4 E4 F4 G4</div>
```

### Mode Badge

```tsx
<span className="mode-badge">
  <Music className="w-3 h-3" />
  Dorian on D
</span>
```

### Scale Degree Indicator

```tsx
<span className="scale-degree">1</span>
```

---

## 🎨 Glass Morphism

```tsx
/* Standard glass effect */
<div className="glass-panel">

/* Subtle glass effect */
<div className="glass-subtle">
```

---

## 📐 Layout Grids

### Musical Grid (auto-fit, min 320px)

```tsx
<div className="musical-grid">
  <Card>Panel 1</Card>
  <Card>Panel 2</Card>
  <Card>Panel 3</Card>
</div>
```

### Control Grid (auto-fit, min 240px)

```tsx
<div className="control-grid">
  <div className="control-group">
    <Label>Control 1</Label>
    <Slider />
  </div>
</div>
```

---

## 🎨 Complete Panel Example

```tsx
<Card className="feature-fugue feature-panel elevation-medium">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-title flex items-center gap-2">
      <Layers className="w-5 h-5 feature-accent" />
      Fugue Generator
    </h3>
    <Badge className="feature-badge feature-fugue">
      AI-Powered
    </Badge>
  </div>
  
  {/* Content */}
  <div className="space-rhythm-standard">
    <div className="control-group">
      <Label className="text-label">Voices: 4</Label>
      <Slider />
    </div>
    
    <Button className="w-full transition-smooth hover-lift focus-glow">
      <Play className="w-4 h-4 mr-2" />
      Generate Fugue
    </Button>
  </div>
</Card>
```

---

## 🔍 Focus & Accessibility

```tsx
/* Standard focus ring */
<Button className="focus-ring">

/* Glowing focus indicator */
<Button className="focus-glow">
```

---

## 🎨 Dividers

```tsx
/* Gradient section divider */
<div className="section-divider" />
```

---

## 📊 Common Patterns

### Card with Hover Lift
```tsx
<Card className="elevation-low transition-smooth hover-lift">
```

### Button with All Effects
```tsx
<Button className="transition-smooth hover-lift focus-glow">
```

### Animated Panel Entry
```tsx
<Card className="animate-slide-in-up elevation-medium">
```

### Feature Panel with Badge
```tsx
<Card className="feature-theme feature-panel elevation-medium">
  <Badge className="feature-badge feature-theme">Theme</Badge>
</Card>
```

---

## 🎯 CSS Variables - Direct Access

```tsx
/* Use any color variable directly */
style={{ color: 'var(--color-theme)' }}
style={{ background: 'var(--feature-bg)' }}
style={{ borderColor: 'var(--feature-border)' }}

/* Use spacing variables */
style={{ gap: 'var(--space-md)' }}
style={{ padding: 'var(--space-lg)' }}

/* Use elevation */
style={{ boxShadow: 'var(--elevation-3)' }}
```

---

## ⚡ Performance Tips

1. **Avoid nesting transitions**: Apply to specific elements only
2. **Use `will-change` sparingly**: Only for critical animations
3. **Prefer CSS transforms**: Better performance than position/margin
4. **Batch DOM updates**: Group styling changes when possible

---

## 🐛 Common Issues

**Issue:** Elevation not visible  
**Fix:** Ensure card has light background in light mode

**Issue:** Feature color not applying  
**Fix:** Add both `.feature-X` and `.feature-panel` classes

**Issue:** Transition feels slow  
**Fix:** Use `.transition-fast` instead of `.transition-smooth`

**Issue:** Text hard to read  
**Fix:** Use `.text-caption` or `.text-micro` for smaller text

---

## 📱 Responsive Considerations

- Musical grid: min 320px columns
- Control grid: min 240px columns  
- Touch targets: minimum 44x44px
- Font sizes scale with viewport on mobile

---

**Quick Tip:** Copy entire examples and adjust content—all styling is pre-optimized!
