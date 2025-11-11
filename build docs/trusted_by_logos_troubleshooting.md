# Trusted By Logos Clipping Issue - Troubleshooting Documentation

## Problem Description
Logos in the "Trusted By" section were getting cut/clipped when scrolling down from the middle of the section. The marquee animation was working, but logos positioned outside the viewport were being clipped by parent containers.

## Root Cause Analysis
The issue was caused by `overflow-x: clip` on the `main` element. When scrolling to the middle of the section, the marquee animation positions logos outside the visible area (negative left positions), and the `main` element's `overflow-x: clip` was cutting them off.

**Key Findings:**
- The `logosTrack` (marquee container) has negative left positions during animation (e.g., -1452px)
- The `main` element had `overflow-x: clip` which was clipping content that extended beyond its bounds
- The `logoTrack` container had `overflow-x: hidden` which was correct for containing the marquee
- Parent sections also had `overflow-x-clip` classes that were contributing to the clipping

## Attempted Solutions

### Attempt 1: Wrapper with overflow-x-hidden
**Approach:** Wrapped the `logo-track` in a container with `overflow-x-hidden` and padding.

**Changes:**
- Added wrapper `div` with `className="w-full overflow-x-hidden px-4"`
- Removed padding from `logo-track` itself
- Added `mx-auto` to center the track

**Result:** ❌ Failed - Still clipping because parent `main` had `overflow-x-clip`

**Files Modified:**
- `components/client-logos.tsx`
- `app/globals.css`

---

### Attempt 2: Viewport Width with Sticky Positioning
**Approach:** Made the logo-track use `100vw` width with `position: sticky` to stay fixed to viewport.

**Changes:**
```css
.logo-track {
  width: 100vw;
  position: sticky;
  left: 0;
  right: 0;
  z-index: 1;
}
```

**Result:** ❌ Failed - Sticky positioning caused layout issues and didn't solve clipping

**Files Modified:**
- `app/globals.css`

---

### Attempt 3: Viewport Width with Negative Margins
**Approach:** Used `100vw` width with negative margins to break out of parent constraints.

**Changes:**
```css
.logo-track {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  contain: layout style;
}
```

**Result:** ❌ Failed - Still clipped because `main` element's `overflow-x: clip` was the root cause

**Files Modified:**
- `app/globals.css`

---

### Attempt 4: Increased Padding Only
**Approach:** Increased padding on `logo-track` to prevent clipping during animation.

**Changes:**
- Increased padding from `1rem/2rem/3rem` to `2rem/3rem/4rem` (base/md/lg breakpoints)

**Result:** ❌ Failed - Padding alone couldn't solve clipping from parent `overflow-x: clip`

**Files Modified:**
- `app/globals.css`

---

### Attempt 5: Removed overflow-x-clip from Parent Section
**Approach:** Removed `overflow-x-clip` from the `#social-proof` section wrapper.

**Changes:**
- Changed `className="bg-background overflow-x-clip"` to `className="bg-background"` in `app/page.tsx`

**Result:** ❌ Failed - Still clipping because `main` element still had `overflow-x-clip`

**Files Modified:**
- `app/page.tsx`

---

### Attempt 6: Removed overflow-x-clip from Main Element (FINAL SOLUTION)
**Approach:** Removed `overflow-x-clip` from the `main` element, allowing the marquee to extend beyond viewport bounds.

**Changes:**
```tsx
// Before
<main className="min-h-screen bg-background overflow-x-clip">

// After
<main className="min-h-screen bg-background">
```

**Result:** ✅ **SUCCESS** - Logos are no longer clipped when scrolling

**Files Modified:**
- `app/page.tsx`
- `components/client-logos.tsx` (removed `overflow-x-visible` from section)

**Why This Works:**
- The `logo-track` container has `overflow-x: hidden` which properly contains the marquee animation
- Removing `overflow-x-clip` from `main` allows the marquee to animate freely without being clipped
- The `logo-track`'s own `overflow-x: hidden` prevents horizontal scrolling while allowing the animation to work correctly

---

## Final Working Solution

### Current Implementation

**File: `app/page.tsx`**
```tsx
<main className="min-h-screen bg-background">
  {/* No overflow-x-clip here */}
</main>
```

**File: `components/client-logos.tsx`**
```tsx
<section aria-labelledby="trusted-by-heading" className="py-14 md:py-18 lg:py-22">
  <div className="w-full">
    <div className="select-none logo-track">
      {/* Marquee content */}
    </div>
  </div>
</section>
```

**File: `app/globals.css`**
```css
.logo-track {
  overflow-x: hidden;
  overflow-y: visible;
  width: 100%;
  padding-left: 2rem;
  padding-right: 2rem;
}
@media (min-width: 768px) {
  .logo-track {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}
@media (min-width: 1024px) {
  .logo-track {
    padding-left: 4rem;
    padding-right: 4rem;
  }
}
```

### Key Principles Learned

1. **Containment Hierarchy:** Overflow clipping should be applied at the lowest level possible, not at the root `main` element
2. **Marquee Animations:** For marquee animations that use negative positions, parent containers must not clip horizontally
3. **Proper Overflow Handling:** The element that contains the animation (`logo-track`) should handle overflow, not parent elements
4. **Padding Matters:** Generous padding (2-4rem) prevents logos from being cut at the edges during animation

### Testing Checklist

When testing marquee/clipping issues:
- [ ] Scroll to the middle of the section
- [ ] Check if logos are visible on both left and right edges
- [ ] Verify marquee animation continues smoothly
- [ ] Test on different viewport sizes (mobile, tablet, desktop)
- [ ] Check browser console for overflow-related warnings
- [ ] Verify no horizontal scrollbar appears

### Debugging Commands

Use these browser console commands to debug clipping issues:

```javascript
// Check overflow properties
const main = document.querySelector('main');
const logoTrack = document.querySelector('.logo-track');
console.log('Main overflow-x:', getComputedStyle(main).overflowX);
console.log('LogoTrack overflow-x:', getComputedStyle(logoTrack).overflowX);

// Check logo positions
const logos = document.querySelectorAll('.logo-card');
logos.forEach((logo, i) => {
  const rect = logo.getBoundingClientRect();
  console.log(`Logo ${i}:`, {
    left: rect.left,
    right: rect.right,
    visible: rect.left >= 0 && rect.right <= window.innerWidth
  });
});
```

## Related Issues

- Similar clipping issues may occur in other sections with horizontal animations
- Always check parent container overflow properties when debugging clipping
- Consider using `overflow-x: hidden` only on the animation container, not parent elements

## Date Documented
November 11, 2025

