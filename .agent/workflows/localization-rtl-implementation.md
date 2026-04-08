---
description: Complete Localization and RTL Support Implementation Guide
---

# OMNIA Website - Complete Localization & RTL Support Implementation

## Overview
This document provides a complete guide for implementing localization (i18n) and RTL (Right-to-Left) support across the OMNIA project.

## Current Setup Analysis

### ✅ Already Configured
1. **i18n Configuration** (`src/i18n.js`)
   - Using `i18next` and `react-i18next`
   - Language detection from localStorage
   - Automatic RTL/LTR direction switching
   - English (en) and Arabic (ar) support
   - Translation files: `public/locales/{en|ar}/translation.json`

2. **Translation Hook Usage**
   ```javascript
   import { useTranslation } from 'react-i18next';
   
   function Component() {
     const { t, i18n } = useTranslation();
     return <div>{t('translation_key')}</div>;
   }
   ```

3. **Language Switching**
   ```javascript
   import { changeLanguage } from '@/i18n';
   await changeLanguage('ar'); // or 'en'
   ```

## How to Add Translations

### Step 1: Add Translation Keys to JSON Files

**English** (`public/locales/en/translation.json`):
```json
{
  "key_name": "English Text",
  "nested": {
    "key": "Nested English Text"
  }
}
```

**Arabic** (`public/locales/ar/translation.json`):
```json
{
  "key_name": "النص العربي",
  "nested": {
    "key": "النص العربي المتداخل"
  }
}
```

### Step 2: Use in Components

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('key_name')}</h1>
      <p>{t('nested.key')}</p>
    </div>
  );
}
```

## RTL Support Requirements

### CSS Classes Needed

1. **Direction-aware spacing**:
   ```css
   /* Instead of margin-left, use logical properties */
   .element {
     margin-inline-start: 1rem; /* left in LTR, right in RTL */
     margin-inline-end: 1rem;   /* right in LTR, left in RTL */
     padding-inline-start: 2rem;
     padding-inline-end: 2rem;
   }
   ```

2. **Flexbox/Grid adjustments**:
   ```css
   /* Automatic reversal for RTL */
   [dir="rtl"] .flex-row {
     flex-direction: row-reverse;
   }
   ```

3. **Text alignment**:
   ```css
   /* Use start/end instead of left/right */
   .text {
     text-align: start; /* left in LTR, right in RTL */
   }
   ```

## Implementation Plan by Module

### Phase 1: Home Module
- [ ] HeroSection.jsx
- [ ] ExploreSection.jsx
- [ ] FlippableVenueCard.jsx
- [ ] DynamicPerkCountdown.jsx ✅ (Already done)
- [ ] PerkActionModal.jsx ✅ (Already done)
- [ ] TrendingSection.jsx

### Phase 2: Venue Profile Module
- [ ] VenueHero.jsx
- [ ] VenueQuickInfo.jsx
- [ ] VenueDescription.jsx
- [ ] VenueAmenities.jsx
- [ ] VenuePerks.jsx
- [ ] VenueMenu.jsx
- [ ] VenueGallery.jsx
- [ ] VenueContact.jsx
- [ ] VenueResources.jsx
- [ ] VenueStickyActions.jsx

### Phase 3: Booking Module
- [ ] BookingFlow components
- [ ] BookingSuccess.jsx

### Phase 4: Profile & MyBookings Module
- [ ] ProfileStats.jsx
- [ ] Profile settings
- [ ] MyBooking components

### Phase 5: Auth Module
- [ ] Login
- [ ] Register
- [ ] Forgot Password

### Phase 6: Category Listing Module
- [ ] EmptyState.jsx
- [ ] Filters
- [ ] Listing components

## Translation Key Naming Convention

### Format
```
module.component.element.property
```

### Examples
```json
{
  "home": {
    "hero": {
      "title": "Discover Excellence",
      "subtitle": "Your journey begins here"
    },
    "venue_card": {
      "book_now": "Book Now",
      "reviews": "reviews"
    }
  },
  "booking": {
    "step_1": "Step 1 of 3",
    "select_date": "Select Date"
  }
}
```

## RTL-Specific CSS Updates Needed

### 1. Add to `index.css`:

```css
/* RTL Support Utilities */
[dir="rtl"] {
  direction: rtl;
}

[dir="ltr"] {
  direction: ltr;
}

/* Flip animations for RTL */
[dir="rtl"] .animate-slide-in-left {
  animation: slide-in-right 0.3s ease-out;
}

[dir="rtl"] .animate-slide-in-right {
  animation: slide-in-left 0.3s ease-out;
}

/* Icon positioning */
[dir="rtl"] .icon-start {
  transform: scaleX(-1);
}

/* Card flip for RTL */
[dir="rtl"] .card-flip {
  transform: scaleX(-1);
}

[dir="rtl"] .card-flip > * {
  transform: scaleX(-1);
}
```

### 2. Update Tailwind Config for Logical Properties:

Use Tailwind's logical property utilities:
- `ms-4` instead of `ml-4` (margin-inline-start)
- `me-4` instead of `mr-4` (margin-inline-end)
- `ps-4` instead of `pl-4` (padding-inline-start)
- `pe-4` instead of `pr-4` (padding-inline-end)

## Common Translation Keys to Add

### Navigation
```json
{
  "nav": {
    "home": "Home",
    "search": "Search",
    "bookings": "My Bookings",
    "profile": "Profile"
  }
}
```

### Common Actions
```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "close": "Close"
  }
}
```

### Common Messages
```json
{
  "messages": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!",
    "no_data": "No data available",
    "coming_soon": "Coming Soon"
  }
}
```

### Time & Dates
```json
{
  "time": {
    "hours": "hours",
    "minutes": "minutes",
    "seconds": "seconds",
    "days": "days",
    "today": "Today",
    "tomorrow": "Tomorrow",
    "yesterday": "Yesterday"
  }
}
```

## Testing Checklist

- [ ] All text displays correctly in English
- [ ] All text displays correctly in Arabic
- [ ] RTL layout is correct (elements flow right-to-left)
- [ ] Icons and images maintain correct positioning
- [ ] Animations work in both directions
- [ ] Forms and inputs align correctly
- [ ] Navigation menus reverse properly
- [ ] Cards and modals are properly aligned
- [ ] Date pickers work with RTL
- [ ] Numbers display correctly (consider Arabic numerals vs Eastern Arabic numerals)

## Best Practices

1. **Never hardcode text** - Always use `t('key')`
2. **Keep keys organized** - Use nested objects for better structure
3. **Be consistent** - Use same naming pattern across modules
4. **Test both languages** - Every component should be tested in en AND ar
5. **Use logical CSS properties** - inline-start/end instead of left/right
6. **Avoid directional icons** - Or flip them based on direction
7. **Watch for asymmetric layouts** - May need direction-specific styling

## Quick Reference Commands

```javascript
// Get current language
const currentLang = i18n.language;

// Change language
await changeLanguage('ar');

// Check if RTL
const isRTL = i18n.language === 'ar';
const dir = i18n.dir(); // 'rtl' or 'ltr'

// Translation with variables
t('greeting', { name: 'Ahmed' }); 
// en: "Hello, {{name}}"
// ar: "مرحبا، {{name}}"

// Pluralization
t('items_count', { count: 5 });
// en: "{{count}} items"
// ar: "{{count}} عناصر"
```

## Implementation Order (Recommended)

1. ✅ Review i18n.js configuration
2. ✅ Understand current translation setup
3. Add RTL CSS utilities to index.css
4. Create comprehensive translation keys module by module
5. Update components to use t() for all text
6. Replace directional CSS with logical properties
7. Test each module in both languages
8. Fix RTL-specific layout issues
9. Add language toggle in UI if not present
10. Final QA pass

---

**Note**: This is a living document. Update as new patterns or requirements emerge.
