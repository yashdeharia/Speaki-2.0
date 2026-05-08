# Speaki Design System

## 🎨 Color Palette

### Primary Colors
```
Background    #0f0f11  - rgb(15, 15, 17)   Primary UI background
Card          #18181b  - rgb(24, 24, 27)   Container/surface color  
Border        #27272a  - rgb(39, 39, 42)   Subtle dividers
```

### Text Colors
```
Primary       #f4f4f5  - rgb(244, 244, 245) Main text
Secondary     #a1a1aa  - rgb(161, 161, 170) Muted/helper text
```

### Accent Color
```
Accent        #6366f1  - rgb(99, 102, 241)  Actions, highlights, brand
Accent Light  #6366f1/10-50                 Backgrounds with opacity
```

### Status Colors (as needed)
```
Green         #22c55e  - Online indicator
Red           #ef4444  - Error/delete actions
Yellow        #eab308  - Warnings
Blue          #3b82f6  - Info/secondary actions
```

## 📐 Spacing & Sizing

### Spacing Scale
```
0.5rem (8px)   - Small inputs, tight spacing
1rem (16px)    - Standard padding
1.5rem (24px)  - Medium spacing
2rem (32px)    - Large spacing
3rem (48px)    - Extra large spacing
```

### Border Radius
```
12px           - Input fields, buttons, small components
20px           - Card containers, large interactive elements
9999px         - Pill-shaped elements (avatars, badges)
```

### Shadows
```
shadow-sm      - Subtle lift effect for interactive items
shadow-md      - Medium depth for cards
shadow-lg      - High elevation when needed (modals)
```

## 🔤 Typography

### Font Family
```
Primary        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
Mono           monospace (for code snippets if needed)
```

### Font Sizes
```
xs   12px  - Labels, captions, small text
sm   14px  - Secondary text, helper text
base 16px  - Body text (default)
lg   18px  - Section headers
xl   20px  - Small page headers
2xl  24px  - Medium page headers
3xl  30px  - Large page headers
4xl  36px  - Extra large headers
5xl  48px  - Hero text
```

### Font Weights
```
Regular    400  - Body text, default
Medium     500  - Emphasis, secondary headings
Semibold   600  - Primary headings, important text
Bold       700  - Main headings, highlights
```

### Line Heights
```
1.5   - Standard body text
1.6   - Longer-form content
1.25  - Tight headings
2     - Loose/spacious content
```

## 🎯 Component Spacing

### Navbar
- Height: 60px
- Padding: 1rem (16px)
- Mobile menu gap: 1rem

### Cards
- Padding: 1.5rem (24px)
- Border radius: 20px
- Horizontal gap: 1.5rem
- Vertical gap: 1.5rem

### Inputs/Buttons
- Height: 44px (minimum touch target)
- Padding: 12px 16px
- Border radius: 12px

### Chat Messages
- Padding: 12px 16px
- Max width: 75% of container
- Border radius: 20px top, 12px bottom (varies)

## 🎬 Animation Settings

### Durations
```
Fast       150ms  - Micro-interactions
Standard   300ms  - UI transitions
Slow       500ms  - Page transitions
Loading    2000ms - Continuous loops
```

### Easing Functions
```
easeOut    - Default for enter animations
easeIn     - Default for exit animations
easeInOut  - Continuous/symmetrical animations
linear     - Constant speed animations
```

### Common Patterns
```
Fade In        opacity: 0 → 1 (300ms, easeOut)
Scale In       scale: 0.95 → 1 (300ms, easeOut)
Slide Up       y: 20 → 0 (300ms, easeOut)
Stagger        delay: i * 0.1s per item
Hover          scale: 1 → 1.02-1.05 (150ms)
Press          scale: 1 → 0.98 (150ms)
```

## 🔘 Interactive Elements

### Buttons
```
Primary          bg-accent, text-white
Secondary        bg-accent/20, text-accent
Outline          border-accent, text-accent
Danger           bg-red-500, text-white
Disabled         opacity-50, cursor-not-allowed

Height           44px minimum
Padding          12px 24px
Radius           12px
Transition       200ms smooth
```

### Input Fields
```
Background       bg-bg (#0f0f11)
Border          border-border (#27272a)
Border Focus    border-accent
Text            text-primary
Placeholder     text-secondary/50
Height          44px
Padding         12px 16px
Radius          12px
Transition      200ms smooth
```

### Cards
```
Background      bg-card (#18181b)
Border          border-border
Border Hover    border-accent/50
Radius          20px
Padding         24px
Shadow          shadow-sm
Transition      300ms smooth
```

## 📱 Responsive Breakpoints

```
Mobile         < 640px   (default, single column)
Tablet         640px+    (md:, two columns)
Desktop        1024px+   (lg:, three columns)
Wide           1280px+   (xl:, full layout)
```

## ♿ Accessibility

- **Minimum Touch Targets** 44x44px
- **Color Contrast** 4.5:1 for WCAG AA
- **Focus States** Visible outline on all interactive elements
- **Keyboard Navigation** All features accessible via keyboard
- **Motion** Respects `prefers-reduced-motion` (can be added)

## 🎨 Tailwind CSS Classes Reference

### Color Variables (Custom)
```
bg-bg            → Background color
bg-card          → Card background
border-border    → Border color
text-primary     → Primary text
text-secondary   → Secondary text
bg-accent        → Accent background
text-accent      → Accent text
```

### Common Utilities
```
rounded-2xl      → 16px radius
rounded-3xl      → 24px radius (cards)
shadow-sm        → Subtle shadow
shadow-md        → Medium shadow
transition-all   → All property changes
duration-200     → 200ms transition
duration-300     → 300ms transition
duration-500     → 500ms transition
```

## 🌙 Dark Mode Notes

- Always dark mode (no light mode toggle)
- Background = darkest value (#0f0f11)
- Card = slightly lighter (#18181b)
- Border = visible but subtle (#27272a)
- Text = light/bright colors
- Accent = vibrant to stand out

## 📐 Grid Systems

### 3-Column Grid (Desktop)
```
Grid gap: 24px
Card width: flex (auto-sizing)
Max width: 7xl container
```

### 2-Column Grid (Tablet)
```
Grid gap: 24px
Card width: flex (auto-sizing)
Max width: 5xl container
```

### 1-Column Grid (Mobile)
```
Grid gap: 16px
Card width: full
Padding: 24px sides
```

## 🎯 Usage Examples

### Card Component
```
- Background: bg-card
- Border: border border-border
- Radius: rounded-3xl (20px)
- Padding: p-6 (24px)
- Shadow: shadow-sm
- Hover: hover:border-accent/50
- Transition: transition-all duration-300
```

### Button Component
```
- Padding: px-6 py-3
- Radius: rounded-lg (12px)
- Font: font-medium
- Transition: transition-colors duration-200
- Hover: hover:bg-accent/90
- Active: scale: 0.98
```

### Input Component
```
- Background: bg-bg
- Border: border border-border
- Radius: rounded-xl
- Padding: px-4 py-3
- Focus: focus:border-accent focus:outline-none
- Placeholder: placeholder-secondary
```

## 🎬 Animation Examples

### Fade In
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

### Scale In
```tsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3 }}
```

### Slide Up
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

### Stagger Container
```tsx
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}}
```

### Hover Scale
```tsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.2 }}
```

## 🔍 Quick Reference

| Property | Value | Usage |
|----------|-------|-------|
| Primary BG | #0f0f11 | Page backgrounds |
| Card BG | #18181b | Container surfaces |
| Border | #27272a | Dividers, outlines |
| Primary Text | #f4f4f5 | Main text |
| Secondary Text | #a1a1aa | Helper/muted text |
| Accent | #6366f1 | Actions, highlights |
| Radius | 20px | Cards |
| Radius | 12px | Inputs/buttons |
| Padding | 24px | Cards |
| Padding | 12px 16px | Inputs |
| Height | 44px | Buttons/inputs |
| Shadow | sm | Cards |
| Duration | 300ms | Standard transitions |
| Ease | easeOut | Entry animations |

---

*Design system for Speaki - A modern Gen-Z real-time chat app*
