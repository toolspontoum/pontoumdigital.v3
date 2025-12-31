---
title: Blog Page Redesign
description: Completely redesign the blog listing page to include a sidebar, search, filters, and a premium footer banner.
---

### 1. Goal
Redesign `blog/index.html` to align with the premium "Ponto Um Digital" aesthetic.
Features:
- **Hero:** "Insights de Engenharia & Tecnologia".
- **Layout:** 2/3 Main Content (Grid), 1/3 Sidebar.
- **Sidebar Elements:** Search, Category List, Recent Posts, CTA Card.
- **Footer Banner:** High-end call to action before the main footer.

### 2. File Structure Changes
- **Target File:** `blog/index.html`
- **Dependencies:** `src/js/blog/blog-store.js` (update `renderPostCard` to match new design if needed, or use the one I just built in `main.js` as reference... actually `blog-store.js` has a `renderPostCard` but it looks like the old design? No, line 46 in `blog-store.js` looks reasonably modern, but I should probably align it with the `.blog-card-new` style I just made in `home`).

### 3. Implementation Steps

#### A. Update `BlogStore.renderPostCard`
The current `renderPostCard` in `src/js/blog/blog-store.js` uses `.group .bg-white ...`. The one I implemented in `src/scripts/main.js` (initHomeBlog) used `.blog-card-new`.
**Action:** Update `src/js/blog/blog-store.js` to use the EXACT HTML structure of `.blog-card-new` so styles are consistent across Home and Blog page.
*Note:* `.blog-card-new` relies on `main.css`. Ensure `main.css` is loaded (it is).

#### B. Redesign `blog/index.html`
**Structure:**
```html
<main class="pt-32 pb-20 bg-slate-50/50">
    <!-- HERO -->
    <HeaderSection />

    <div class="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- LEFT COLUMN (Posts) - Span 8 -->
        <div class="lg:col-span-8">
            <div id="posts-grid" class="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
            <!-- Pagination (Mockup) -->
        </div>

        <!-- RIGHT SIDEBAR - Span 4 -->
        <aside class="lg:col-span-4 space-y-12 position-sticky top-24 h-fit">
            <!-- Search -->
            <!-- Categories -->
            <!-- CTA Card -->
        </aside>
    </div>

    <!-- PREMIUM BANNER -->
    <BannerSection />
</main>
```

#### C. Styles & Copy
- **CTA Card Copy:** "Transforme sua Visão em Código de Elite. Agende uma consultoria estratégica..."
- **Banner Copy:** "Construa o Futuro Agora."

### 4. Detailed Code Changes

**Step 1: Update `src/js/blog/blog-store.js`**
Replace `renderPostCard` with the new `.blog-card-new` template to match Home.

**Step 2: Rewrite `blog/index.html`**
Implement the new 2-column layout.
- Inject Sidebar HTML directly or via JS? Direct HTML is easier for layout structure, but categories might need JS. I'll put the *structure* in HTML and inject *content* via JS where dynamic.
- **Search:** Simple form `input`.
- **Categories:** Hardcoded for now or fetched? `fetchCategories` exists in `BlogStore`. I'll use it.
- **CTA:** HTML hardcoded.

**Step 3:** Add the Footer Banner.
