# Coffee Roast Timer - Design Specification
## New Features: Cupping Notes, Environmental Data & Profile Comparison

**Version:** 1.0  
**Date:** February 15, 2026  
**Project:** Coffee Roast Timer  
**Focus:** Mobile-First Design with Desktop Support

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Feature 1: Cupping & Tasting Notes](#feature-1-cupping--tasting-notes)
4. [Feature 2: Environmental Data Tracking](#feature-2-environmental-data-tracking)
5. [Feature 3: Enhanced Profile Comparison](#feature-3-enhanced-profile-comparison)
6. [Mobile Design Specifications](#mobile-design-specifications)
7. [Component Library & Patterns](#component-library--patterns)
8. [Color Palette & Typography](#color-palette--typography)
9. [Accessibility Requirements](#accessibility-requirements)
10. [Interaction & Animation Guidelines](#interaction--animation-guidelines)

---

## Overview

### Project Context
Coffee Roast Timer is a web application that helps coffee roasting enthusiasts track, analyze, and share their roast profiles. The app currently supports real-time roast monitoring, profile saving/sharing, and a community discovery feed.

### Goals for New Features
- **Consistency & Replication:** Help users repeat successful roasts
- **Learning & Improvement:** Provide feedback loops from roast to cup
- **Data-Driven Decisions:** Enable environment-aware roasting
- **Community Insights:** Allow users to compare and learn from others

### Target Users
- **Beginners:** Need simple, clear interfaces with guidance
- **Intermediate:** Want detailed data and comparison tools
- **Advanced:** Require professional-grade analytics and insights

**Critical Constraint:** Mobile experience is VERY IMPORTANT. All designs must prioritize mobile usability.

---

## Design Principles

### 1. **Mobile-First Always**
- Design for small screens (320px-428px) first
- Touch-friendly tap targets (minimum 44x44px)
- Thumb-zone optimization for primary actions
- Progressive enhancement for tablets and desktop

### 2. **Minimalism & Clarity**
- Remove redundant UI elements
- Single input method per data point (no triple-encoding)
- Progressive disclosure for optional features only
- Default to simple, upgrade to complex when needed

### 3. **Gesture-Native Mobile**
- Hybrid approach: gestures for fluidity, buttons for discoverability
- Swipe gestures for common actions (delete, navigate)
- Long-press for contextual menus
- Bottom sheets preferred over modals on mobile

### 4. **Coffee-Themed Aesthetic**
- Warm, earthy color palette (coffee browns, beans, roast levels)
- Visual metaphors from coffee culture
- Professional yet approachable tone

### 5. **Data Visualization Clarity**
- Clean, readable charts and graphs
- Color-coded status indicators (green/yellow/red traffic light pattern)
- Consistent iconography

### 6. **Feedback & Confirmation**
- Immediate visual feedback for all actions
- Success/error states clearly communicated
- Loading states to manage expectations

---

## Feature 1: Cupping & Tasting Notes

### Purpose
Allow users to record how their roasted coffee tasted, creating a feedback loop between roasting decisions and flavor outcomes.

---

### Component 1.1: Cupping Notes Section (Profile Detail Page)

#### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────┐
│  Tasting Notes                                [Edit]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  85/100                                                 │
│  Cupped on Jan 15, 2026 • 7 days rest                  │
│                                                          │
│  [Photo of roasted beans - if uploaded]                 │
│                                                          │
│  Flavor Profile:                                        │
│  [Berry] [Chocolate] [Citrus] [Bright] [Balanced]      │
│                                                          │
│  Brew Method: Espresso                                  │
│                                                          │
│  Notes:                                                 │
│  Sweet and complex with notes of dark chocolate and     │
│  blueberry. Clean finish with medium acidity. Best      │
│  pulled as a ristretto.                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Layout (375px)
```
┌───────────────────────────┐
│  Tasting Notes       [Edit]│
├───────────────────────────┤
│                            │
│  85/100                    │
│  Jan 15, 2026 • 7d rest   │
│                            │
│  [Photo - Full Width]      │
│  Long-press for options    │
│                            │
│  Flavor Profile:           │
│  [Berry] [Chocolate]       │
│  [Citrus] [Bright]         │
│  [Balanced]                │
│                            │
│  Brew: Espresso            │
│                            │
│  Notes:                    │
│  Sweet and complex         │
│  with notes of dark        │
│  chocolate and             │
│  blueberry. Clean          │
│  finish with medium        │
│  acidity...                │
│                            │
└───────────────────────────┘
```

#### Visual Specifications

**Cupping Score Display:**
- **Numerical Score Only:** `85/100`
  - Font size: 24px desktop, 20px mobile
  - Font weight: 600 (semibold)
  - Color: `#374151` (gray-700)
  - Badge style with rounded background
  - Desktop: Can optionally show equivalent stars as decoration (not interactive)
  - Mobile: Numerical only for clarity

**Date & Rest Days:**
- Format: "Cupped on [MMM DD, YYYY] • [X] days rest"
- Font size: 14px
- Color: `#6B7280` (gray-500)
- Mobile: Shorten to "Jan 15 • 7d rest"

**Photo:**
- Desktop: Max width 400px, max height 300px, rounded corners (8px)
- Mobile: Full width, aspect ratio 4:3, rounded corners (8px)
- Upload state: Dashed border placeholder with camera icon
- Hover state (desktop): Slight scale (1.02) with shadow increase

**Flavor Tags:**
- Badge style with rounded corners (full pill shape)
- Background: `#FEF3C7` (amber-100)
- Text color: `#92400E` (amber-800)
- Font size: 12px desktop, 11px mobile
- Padding: 4px 12px
- Spacing: 6px gap between tags
- Max tags displayed: Show all on desktop, collapse after 6 on mobile with "+X more" button

**Brew Method:**
- Label: "Brew Method:" in gray-500
- Value: Bold text in gray-700
- Icon: Coffee cup icon (16px) next to method name

**Notes:**
- Textarea with white background
- Border: `#E5E7EB` (gray-200)
- Font size: 14px
- Line height: 1.6
- Mobile: Show first 3 lines with "Read more" expansion

---

### Component 1.2: Photo Upload Interface

#### Upload Trigger Button
```
┌─────────────────────────────────┐
│  [📷 Camera Icon]                │
│  Upload Roasted Bean Photo       │
│  (Max 5MB - JPG, PNG, WebP)     │
└─────────────────────────────────┘
```

#### Mobile Camera Trigger
- Large touch target: Full width button, 56px height
- Icon: 28px camera icon
- Text: "Add Photo" 
- Style: Dashed border, light background
- Tap action: Open native camera/file picker

#### Desktop Drop Zone
- Drag-and-drop area with "Click or drag photo here"
- Hover state: Background color change
- Active state (dragging): Border color change to blue

#### Upload Progress
- Linear progress bar below button
- Percentage indicator
- Cancel button option
- Color: Coffee brown (`#8B4513`)

#### Photo Preview (After Upload)
- Thumbnail with remove (X) button in top-right corner
- **Desktop:** Click X button to remove
  - Size: 32px circle
  - Background: Semi-transparent black (#00000080)
  - Icon: White X, 16px
  - Position: Absolute, top-right corner with 8px offset
- **Mobile:** Long-press photo to show action sheet
  - Options: "View Full Size", "Replace Photo", "Remove Photo"
  - Entire photo is touch target (easier than hitting small X)
  - X button still visible as backup affordance

---

### Component 1.3: Flavor Tag Input (Edit Mode)

#### Simplified Searchable Dropdown
```
┌────────────────────────────────────────┐
│  [🔍] Search flavors...         [▼]    │
└────────────────────────────────────────┘

Selected Tags:
[Berry ✕] [Chocolate ✕] [Bright ✕]

Dropdown List (Alphabetical):
□ Berry
□ Bright
□ Caramel
☑ Chocolate
□ Cherry
☑ Citrus
□ Earthy
□ Floral
...
```

#### Mobile Simplified Selector
```
┌──────────────────────────┐
│  Add Flavor Tags    [+]  │
└──────────────────────────┘

Selected:
[Berry ✕] [Chocolate ✕] 
[Bright ✕]

[Bottom Sheet Opens]
┌──────────────────────────┐
│  ═══                     │
│  Flavor Tags        [✓]  │
├──────────────────────────┤
│  [Search...]             │
│                          │
│  □ Berry                 │
│  □ Bright                │
│  ☑ Chocolate             │
│  ☑ Citrus                │
│  □ Earthy                │
│  ...                     │
│                          │
│  [Done]                  │
└──────────────────────────┘
```

#### Specifications
- **No categories:** Single alphabetical list (simplified from categorized system)
- **Search:** Type to filter instantly (fuzzy matching)
- **Selection:** Tap to toggle checkbox
- **Touch targets:** 48px height on mobile for easy tapping
- **Selection limit:** Soft limit at 8 tags (show warning, don't block)
- **Mobile:** Bottom sheet with drag handle, swipe down to dismiss
- **Desktop:** Standard dropdown menu

---

### Component 1.4: Cupping Score Input (Simplified)

#### Desktop & Mobile Slider
```
┌─────────────────────────────────────┐
│  Cupping Score                      │
│  85/100                             │
│  ├─────────●───────┤               │
│  0                100                │
└─────────────────────────────────────┘
```

#### Specifications
- **Single input method:** Slider only (no star rating input)
- Range: 0-100
- Default: 70
- **Mobile:**
  - Full width slider
  - Large thumb (32px) for easy dragging
  - Haptic feedback on drag (if supported)
  - Snap to 1-point increments
- **Desktop:**
  - 300px width slider
  - Standard thumb (20px)
  - Optional: Display equivalent stars as decoration (★★★★☆) but not interactive
- **Visual feedback:**
  - Live numerical display updates as you drag
  - Optional: Subtle color gradient on track (Red → Yellow → Green)
  - Focus state: Blue outline on thumb

---

## Feature 2: Environmental Data Tracking (Simplified)

### Purpose
Record ambient conditions that affect roast consistency in a simple, low-friction way.

---

### Component 2.1: Environmental Data Input (Save Dialog)

#### Simplified Single Field Approach

**Desktop & Mobile:**
```
┌─────────────────────────────────────────────┐
│  ▾ Roasting Conditions (Optional)           │
├─────────────────────────────────────────────┤
│                                              │
│  [________________________________]         │
│  e.g., "22°C, 65% humidity, cloudy day"     │
│                                              │
└─────────────────────────────────────────────┘
```

#### Specifications

**Single Text Input:**
- Multi-line textarea (2-3 rows)
- Free-form text entry
- Placeholder: "e.g., 22°C, 65% humidity, high altitude"
- Character limit: 200 characters
- Optional field (collapsible section)
- **Rationale:** Most users won't track this consistently. For those who do, free-form is faster than multiple structured inputs.

**Collapsed State:**
- Show first ~30 characters if data entered: "22°C, 65% humidity..."
- Desktop: Right-aligned in header
- Mobile: Below header text

**Expanded State:**
- Single textarea with soft background
- Auto-resize as user types
- Save button stores text as-is

---

### Component 2.2: Environmental Display (Profile Detail)

#### Simplified Display (Desktop & Mobile)
```
┌───────────────────────────┐
│  Roasting Conditions       │
├───────────────────────────┤
│  22°C, 65% humidity,       │
│  high altitude             │
└───────────────────────────┘
```

#### Specifications
- Simple text display (no icons, no structure)
- Font size: 14px
- Color: Gray-700
- Layout: Left-aligned paragraph
- If no data: Don't show card at all
- **Rationale:** Environmental data is context, not primary content. Display it simply.

---

## Feature 3: Enhanced Profile Comparison (Simplified)

### Purpose
Allow users to compare two roast profiles side-by-side for learning and replication.

**Key Change:** Limited to 2 profiles maximum for cleaner comparison and better mobile experience.

---

### Component 3.1: Comparison Page Layout

#### Desktop View (1440px)
```
┌────────────────────────────────────────────────────────────┐
│  Compare Roast Profiles                     [Add Profile]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐     │
│  │ Profile 1             │  │ Profile 2             │     │
│  │ [✕]                   │  │ [✕]                   │     │
│  │ Ethiopian Natural     │  │ Colombian Washed      │     │
│  │ Jan 15 • 12:30        │  │ Jan 12 • 11:45        │     │
│  └───────────────────────┘  └───────────────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Temperature Comparison Chart                        │  │
│  │  [Dual-line graph]                                   │  │
│  │  ─── Profile 1 (Blue)                                │  │
│  │  ─── Profile 2 (Orange)                              │  │
│  │  [Crack markers for each]                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Statistics Comparison                               │  │
│  ├──────────────────────┬────────────┬────────────────┤  │
│  │ Metric               │ Profile 1  │ Profile 2      │  │
│  ├──────────────────────┼────────────┼────────────────┤  │
│  │ Duration             │ 12:30      │ 11:45 ↓        │  │
│  │ First Crack          │ 9:15       │ 8:30 ↓         │  │
│  │ First Crack Temp     │ 196°C      │ 194°C ↓        │  │
│  │ Development Time %   │ 22.5%      │ 25.3% ↑        │  │
│  │ Final Temperature    │ 212°C      │ 215°C ↑        │  │
│  └──────────────────────┴────────────┴────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Mobile View (375px)
```
┌───────────────────────────┐
│  Compare      [Add +]     │
├───────────────────────────┤
│                            │
│  [Profile 1 ✕]            │
│  Ethiopian Natural         │
│  Jan 15 • 12:30            │
│                            │
│  [Profile 2 ✕]            │
│  Colombian Washed          │
│  Jan 12 • 11:45            │
│  < Swipe to remove         │
│                            │
│  [Temperature Chart]       │
│  Tap for details           │
│                            │
│  ──── Stats ────           │
│                            │
│  Duration                  │
│  12:30 vs 11:45 ↓         │
│                            │
│  First Crack               │
│  9:15 vs 8:30 ↓           │
│                            │
│  Development %             │
│  22.5% vs 25.3% ↑         │
│                            │
│  ...                       │
│                            │
└───────────────────────────┘
```

---

### Component 3.2: Profile Selector (Simplified)

#### Desktop Modal
```
┌──────────────────────────────────────────┐
│  Select Profiles to Compare     [✕]      │
├──────────────────────────────────────────┤
│  [🔍 Search profiles...]                 │
│                                           │
│  Your Profiles:                           │
│  ┌────────────────────────────────────┐  │
│  │ ☐ Ethiopian Natural                 │  │
│  │   Jan 15, 2026 • 12:30 • FC: 9:15  │  │
│  ├────────────────────────────────────┤  │
│  │ ☐ Colombian Washed                  │  │
│  │   Jan 12, 2026 • 11:45 • FC: 8:30  │  │
│  └────────────────────────────────────┘  │
│                                           │
│  [Cancel]            [Compare (2)]       │
└──────────────────────────────────────────┘
```

#### Mobile Bottom Sheet
```
┌───────────────────────────┐
│  ═══                      │
│  Select Profiles          │
├───────────────────────────┤
│  [Search...]              │
│                            │
│  ☑ Ethiopian Natural      │
│     Jan 15 • 12:30        │
│                            │
│  ☐ Colombian Washed       │
│     Jan 12 • 11:45        │
│                            │
│  ☐ Brazilian Natural      │
│     Jan 10 • 13:00        │
│                            │
│  ...                       │
│                            │
│  [Compare (1 of 2)]       │
└───────────────────────────┘
```

#### Specifications
- **Selection limit:** 2 profiles maximum (simplified from 3)
- **Selection indicator:** Checkboxes with count "(1 of 2)"
- **Disabled state:** After 2 selected, other checkboxes become disabled
- **Search:** Real-time filter by bean name, origin
- **Sort:** Most recent first
- **Mobile:** Bottom sheet with drag handle, swipe down to dismiss
- **Desktop:** Modal with backdrop blur

---

### Component 3.3: Comparison Chart

#### Visual Specifications

**Line Colors (2 profiles only):**
- Profile 1: `#3B82F6` (blue-500)
- Profile 2: `#F59E0B` (amber-500)

**Line Styles:**
- Weight: 2px
- Smooth curves (monotone interpolation)
- Opacity: 0.9

**Crack Event Markers:**
- First Crack: Vertical dashed line matching profile color
- Second Crack: Dotted line matching profile color
- Label: "FC" or "SC" at top of line
- Mobile: Tap marker to see details tooltip

**Legend:**
- Desktop: Horizontal below chart
- Mobile: Collapsible dropdown (tap "Legend" button)
- Format: "■ Profile Name (Bean Name)"

**Interactive Features (Simplified):**
- Tooltip: Tap/hover to see exact time and temperature for both profiles
- Crosshair: Shows values for both lines at same time point
- **Removed:** Zoom/pan controls (rarely used, adds complexity)
- If needed: Users can expand chart to full-screen modal for detailed view

**Mobile Optimizations:**
- Chart height: 320px (adequate touch room)
- Touch targets for legend: 48px
- Simplified axis labels (fewer ticks)
- Tap chart for tooltip, no zoom gestures

---

### Component 3.4: Statistics Comparison Table (Simplified)

#### Desktop Table (2 Columns)
```
┌──────────────────────┬─────────────┬─────────────┐
│ Metric               │ Profile 1   │ Profile 2   │
├──────────────────────┼─────────────┼─────────────┤
│ Duration             │ 12:30       │ 11:45 ↓     │
│ First Crack          │ 9:15        │ 8:30 ↓      │
│ First Crack Temp     │ 196°C       │ 194°C ↓     │
│ Second Crack         │ 11:00       │ 10:30 ↓     │
│ Development Time %   │ 22.5%       │ 25.3% ↑     │
│ Final Temperature    │ 212°C       │ 215°C ↑     │
│ Weight Loss          │ 16.2%       │ 14.8% ↓     │
└──────────────────────┴─────────────┴─────────────┘
```

#### Mobile Vertical Cards (No Horizontal Scroll)
```
┌───────────────────────────┐
│  Duration                  │
│  12:30 vs 11:45 ↓         │
├───────────────────────────┤
│  First Crack               │
│  9:15 vs 8:30 ↓           │
├───────────────────────────┤
│  First Crack Temp          │
│  196°C vs 194°C ↓         │
├───────────────────────────┤
│  Development %             │
│  22.5% vs 25.3% ↑         │
├───────────────────────────┤
│  Final Temperature         │
│  212°C vs 215°C ↑         │
└───────────────────────────┘
```

#### Specifications

**Difference Indicators:**
- Lower/faster value: Green ↓ arrow
- Higher/slower value: Red ↑ arrow  
- Equal values: No indicator
- Color coding:
  - Green: `#10B981` (faster/lower)
  - Red: `#EF4444` (slower/higher)
  - Context-dependent (e.g., higher development % might be good)

**Value Formatting:**
- Time: MM:SS format
- Temperature: Whole numbers with ° symbol
- Percentage: One decimal place
- Missing data: "—" dash

**Mobile Optimizations (Simplified):**
- **No horizontal scroll:** Vertical card layout instead
- Each metric is a card with "Value 1 vs Value 2"
- Full metric names (no abbreviations needed)
- Easier to read, no precision tapping required
- Natural vertical scrolling (thumb-friendly)

**Desktop:**
- Clean two-column table
- Wider metric name column (no cramping)
- Hover: Light gray background on row

---

## Mobile Design Specifications

### Screen Size Breakpoints
```
Mobile Small:   320px - 374px
Mobile Medium:  375px - 428px
Tablet:         768px - 1023px
Desktop:        1024px+
```

### Touch Target Sizes
- **Minimum:** 44x44px (Apple HIG, WCAG AAA)
- **Preferred:** 48x48px or larger
- **Spacing:** 8px minimum between tap targets

### Typography Scale (Mobile)
```
H1 (Page Title):     24px / 32px line-height / Bold
H2 (Section Title):  20px / 28px / Semibold
H3 (Card Title):     18px / 24px / Semibold
Body:                14px / 20px / Regular
Small:               12px / 16px / Regular
Tiny:                10px / 14px / Regular
```

### Spacing Scale
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Mobile Navigation Patterns

**Bottom Navigation Bar (If Applicable):**
- Fixed at bottom, 64px height
- Large icons (24px)
- Active state: Color + icon fill
- Ripple animation on tap

**Back Button:**
- Top-left, 44x44px tap target
- Arrow icon + optional "Back" text
- Slide transition on navigate back

**Floating Action Button (FAB):**
- Right-bottom corner, 56px circle
- Elevation: 8dp shadow
- Use for primary actions (e.g., "Add Profile" on comparison)

### Mobile-Specific Components

**Bottom Sheet (Preferred over modals):**
- Drag handle: 32px width, 4px height, centered, gray-300
- Backdrop: Semi-transparent black (rgba(0,0,0,0.5))
- Swipe down to dismiss (gesture-native)
- Maximum height: 90vh
- Rounded top corners: 16px
- Spring animation on open/close

**Collapsible Sections:**
- Accordion-style expansion
- Chevron icon (rotates 180° on open)
- Smooth animation (300ms ease-in-out)
- Tap anywhere in header to toggle
- Use for optional features only

**Mobile Slider:**
- Track height: 8px
- Thumb size: 32px (larger for easier dragging)
- Active thumb: Scale to 36px with shadow
- Haptic feedback on value change (if supported)
- Progress color: Coffee brown (#8B4513)
- Track color: Light gray (#E5E7EB)

**Mobile Input Fields:**
- Height: 48px minimum
- Font size: 16px (prevents iOS auto-zoom)
- Border radius: 8px
- Focus state: Blue outline, 2px
- Touch-friendly padding

**Long-Press Menus:**
- Use for contextual actions (photo options, profile actions)
- Haptic feedback on long-press trigger
- Bottom sheet appears with action list
- Backup: Always provide button alternative for discoverability

---

## Component Library & Patterns

### Existing Components to Reuse
The app uses **shadcn/ui** components. Maintain consistency by using:

- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Button` (variants: default, outline, ghost, link)
- `Input`, `Textarea`, `Label`
- `Dialog`, `Sheet`, `AlertDialog`
- `Badge` for tags
- `Slider` for range inputs
- `Switch` for toggles (C/F temperature)
- `Tabs` for switching views
- `Tooltip` for help text

### New Component Patterns

**Photo Upload Card:**
- Use `Card` with dashed border when empty
- Center-aligned camera icon and text
- File input hidden, triggered by card click
- Progress bar as linear indicator

**Tag Cloud:**
- Flexbox wrap layout
- `Badge` components with close button
- Hover state: Slight scale and shadow
- Remove animation: Fade out

**Comparison Profile Card:**
- Compact `Card` with profile info
- Remove button in top-right
- Color-coded border matching chart line color
- Click to view full profile (opens in new tab/modal)

---

## Color Palette & Typography

### Color System

**Primary (Coffee Brown):**
```
50:  #FEFCE8  (Lightest)
100: #FEF3C7
200: #FDE68A
300: #FCD34D
400: #FBBF24
500: #F59E0B  (Primary)
600: #D97706
700: #B45309
800: #92400E
900: #78350F  (Darkest)
```

**Secondary (Bean Dark):**
```
50:  #FAF5F0
100: #F5EBE0
200: #E8D5C4
300: #DABFA8
400: #C9A586
500: #A67C52  (Secondary)
600: #8B4513  (Coffee Bean)
700: #6F3710
800: #532A0C
900: #3A1D08
```

**Roast Levels (For Visualizations):**
```
Light:        #D2B48C  (Tan)
Medium Light: #C19A6B  (Light Brown)
Medium:       #8B4513  (Saddle Brown)
Medium Dark:  #654321  (Dark Brown)
Dark:         #3E2723  (Espresso)
```

**Status Colors:**
```
Success:  #10B981  (Green)
Warning:  #F59E0B  (Amber)
Error:    #EF4444  (Red)
Info:     #3B82F6  (Blue)
```

**Neutral Grays:**
```
50:  #F9FAFB
100: #F3F4F6
200: #E5E7EB
300: #D1D5DB
400: #9CA3AF
500: #6B7280
600: #4B5563
700: #374151
800: #1F2937
900: #111827
```

### Typography

**Font Family:**
- Primary: `Inter, system-ui, sans-serif`
- Monospace (for data): `'Roboto Mono', monospace`

**Font Weights:**
```
Regular:  400
Medium:   500
Semibold: 600
Bold:     700
```

**Desktop Scale:**
```
Display:  48px / 56px / Bold
H1:       32px / 40px / Bold
H2:       24px / 32px / Semibold
H3:       20px / 28px / Semibold
Body:     16px / 24px / Regular
Small:    14px / 20px / Regular
Tiny:     12px / 16px / Regular
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio
- Validate with tools: Stark, ColorBox

**Keyboard Navigation:**
- All interactive elements must be reachable via Tab
- Focus indicators: 2px blue outline with 2px offset
- Logical tab order (top to bottom, left to right)
- Escape key closes modals/dialogs

**Screen Readers:**
- ARIA labels on icon-only buttons
- Alt text for all images
- Semantic HTML (`<nav>`, `<main>`, `<section>`)
- Form labels properly associated with inputs
- Live regions for dynamic content (`aria-live`)

**Touch/Mobile:**
- 44x44px minimum touch targets
- No hover-only interactions
- Support for pinch-zoom
- Orientation support (portrait and landscape)

**Focus Management:**
- Auto-focus first input in dialogs
- Return focus to trigger element after modal closes
- Skip links for long forms

**Error Handling:**
- Clear error messages
- Error icons with color + text (not color alone)
- Inline validation with helpful suggestions
- Announce errors to screen readers

---

## Interaction & Animation Guidelines

### Animation Principles

**Duration:**
```
Fast:      150ms  (Hovers, focus states)
Standard:  300ms  (Modals, sheets, transitions)
Slow:      500ms  (Page transitions, complex animations)
```

**Easing:**
```
Ease In:      cubic-bezier(0.4, 0, 1, 1)       (Elements disappearing)
Ease Out:     cubic-bezier(0, 0, 0.2, 1)       (Elements appearing)
Ease In-Out:  cubic-bezier(0.4, 0, 0.2, 1)     (General transitions)
```

**Reduced Motion:**
- Respect `prefers-reduced-motion` media query
- Replace animations with instant state changes
- Keep essential feedback (e.g., loading spinners)

### Interaction States

**Buttons:**
```
Default:    Base color, no shadow
Hover:      Slightly darker, subtle shadow
Active:     Even darker, shadow removed
Disabled:   Gray, 50% opacity, cursor not-allowed
Loading:    Spinner inside button, text hidden
```

**Links:**
```
Default:    Underline on hover only
Hover:      Color change + underline
Active:     Slightly darker
Visited:    (Optional) Purple tint
```

**Form Inputs:**
```
Default:    Gray border
Focus:      Blue border (2px), no outline
Error:      Red border, red text, error icon
Disabled:   Gray background, lighter text
```

**Cards:**
```
Default:    White background, subtle shadow
Hover:      Slight elevation increase (shadow)
Active:     Border highlight
Selected:   Blue border, blue shadow
```

### Loading States

**Skeleton Screens:**
- Use for initial page load
- Animated shimmer effect (left to right)
- Maintain layout structure
- Color: Light gray gradient

**Spinners:**
- For button actions (small, 16px)
- For page sections (medium, 24px)
- Color: Match primary color or white on dark backgrounds

**Progress Bars:**
- For file uploads
- Linear, under triggering element
- Show percentage if known
- Color: Coffee brown

### Feedback & Toasts

**Toast Notifications:**
- Position: Top-center on desktop, top on mobile
- Duration: 3 seconds (success), 5 seconds (error), until dismissed (important)
- Icon + message + close button
- Swipe to dismiss on mobile
- Multiple toasts: Stack vertically

**Success Feedback:**
- Green check icon
- Message: "Profile saved successfully!"
- Auto-dismiss after 3 seconds

**Error Feedback:**
- Red X icon
- Message: "Failed to upload photo. Try again."
- Manual dismiss (don't auto-hide errors)

---

## Implementation Notes for Developers

### Responsive Breakpoints (Tailwind)
```javascript
sm:  640px   // Mobile landscape, small tablets
md:  768px   // Tablets
lg:  1024px  // Desktop
xl:  1280px  // Large desktop
2xl: 1536px  // Extra large desktop
```

### Mobile-First CSS Strategy
```css
/* Base styles (mobile) */
.card {
  padding: 16px;
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: 24px;
    font-size: 16px;
  }
}
```

### Touch-Friendly Targets
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}
```

### Photo Upload Best Practices
- Accept: `image/jpeg, image/png, image/webp, image/heic`
- Max size: 5MB
- Compress on client before upload (use browser-image-compression library)
- Generate thumbnail for display
- Store full resolution in Supabase Storage

### Performance Considerations
- Lazy load images (use `loading="lazy"`)
- Optimize chart rendering (debounce resize events)
- Virtualize long lists (flavor tag selector)
- Code splitting for comparison page

---

## Figma / Design Handoff Checklist

When creating designs, please provide:

- [ ] Desktop layouts (1440px, 1920px)
- [ ] Tablet layouts (768px, 1024px)
- [ ] Mobile layouts (375px, 428px)
- [ ] Mobile small layouts (320px)
- [ ] All interaction states (hover, active, focus, disabled)
- [ ] Empty states for all components
- [ ] Error states for forms
- [ ] Loading states
- [ ] Dark mode variants (if applicable)
- [ ] Spacing and sizing annotations
- [ ] Color hex codes for all elements
- [ ] Font sizes and line heights
- [ ] Component variants (for reusable elements)
- [ ] User flow diagrams
- [ ] Accessibility notes (contrast ratios, ARIA labels)

---

## Design System Resources

### Inspiration & References
- **Coffee Taster's Flavor Wheel:** SCA official wheel
- **Mobile patterns:** iOS Human Interface Guidelines, Material Design
- **Data visualization:** Recharts examples, D3.js gallery

### Tools & Plugins
- **Figma plugins:**
  - Stark (accessibility checker)
  - Iconify (icon library)
  - Unsplash (placeholder images)
- **Color tools:**
  - Coolors.co (palette generator)
  - Contrast Checker (WebAIM)

---

## Changelog

### Version 1.0 (Feb 15, 2026)
- Initial design specification
- Three main features: Cupping Notes, Environmental Data, Profile Comparison
- Mobile-first approach with responsive designs
- Accessibility requirements documented
- Component library integration specified

---

## Questions & Feedback

For design questions or clarifications:
- Technical questions: Reference component specifications
- UX questions: Refer to user stories and interaction guidelines
- Accessibility: Follow WCAG 2.1 AA standards
- Mobile-specific: Prioritize thumb-zone and touch targets

---

**End of Design Specification**

This document should be used as the primary reference for all design and development work on the three new features. All designs should prioritize mobile usability while maintaining a seamless desktop experience.
