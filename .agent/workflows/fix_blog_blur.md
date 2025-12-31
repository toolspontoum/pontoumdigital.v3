---
title: Fix Blog Card Blur Issue
description: Resolve the issue where blog cards appear blurry due to missing GSAP animation properties.
---

### Problem Analysis
The user reported that the blog cards are blurry.
- **Cause:** The `.reveal-card` CSS class has a default state of `filter: blur(10px)`. The JavaScript function `initHomeBlog` injects these cards dynamically and sets up a GSAP animation. However, this specific animation only transitions `opacity` and `y`, forgetting to transition the `filter` property back to `blur(0px)`.
- **Location:** `src/scripts/main.js` inside the `initHomeBlog` function.

### Plan
1.  **View File:** Confirm the code in `src/scripts/main.js`.
2.  **Update Code:** Modify the `gsap.to` object in `initHomeBlog` to include `filter: 'blur(0px)'` and ensuring `scale: 1` if strictly needed (though scale might be handled by hover, the initial state usually has a slight scale diff).
3.  **Verify:** Open the browser to confirm the text is sharp.

### Execution
1.  Read `src/scripts/main.js`.
2.  Edit `src/scripts/main.js` to add `filter: 'blur(0px)'` and `scale: 1` to the admission animation.
3.  Browser check.
