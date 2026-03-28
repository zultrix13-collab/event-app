# UX/UI Improvement Plan — Event Digital Platform
> Audit date: 2026-03-28 | Auditor: UX/UI Agent
> Version: 1.0

---

## Table of Contents
1. [Current State Assessment](#1-current-state-assessment)
2. [Priority Fixes](#2-priority-fixes)
3. [Design System Recommendations](#3-design-system-recommendations)
4. [Page-by-Page Improvements](#4-page-by-page-improvements)
5. [Component Library](#5-component-library)

---

## 1. Current State Assessment

### ✅ What's Working Well

**Design system foundation is solid.**
`globals.css` has a well-structured token system — color, spacing, radius, typography, and shadow variables are all defined with clean naming conventions (`--color-bg-app`, `--space-4`, etc.). This is genuinely good groundwork; a lot of projects skip this entirely.

**Auth flow UX is thoughtful.**
The login/verify flow has good ideas: email OTP, tab switching between participant and staff, countdown timer with resend, auto-focus on input. These are user-centric decisions.

**Programme page has real depth.**
Session cards show type badges, zone labels, speaker avatars, capacity progress bars, and registration status inline. That's a rich feature set well-targeted at event attendees.

**App home has good information architecture.**
Quick links with emoji icons + contextual descriptions (e.g. "Өнөөдөр 3 арга хэмжаа") give users immediate orientation. Upcoming sessions panel is a smart progressive disclosure.

---

### ❌ What's Broken / Inconsistent

#### 1. **Two Design Systems Fighting Each Other**
This is the most critical issue. The project has:
- `globals.css` → CSS custom property-based system (`ui-button`, `ui-card`, `.ui-form-stack`)
- Tailwind CSS → Used extensively in `app/home`, `programme`, and `page.tsx`

These are used **on different pages with no reconciliation**. The login page uses inline styles. The dashboard uses CSS classes. The home page uses Tailwind. The result is visual fragmentation:
- Button radii differ across pages (`border-radius: 8px` inline vs `rounded-xl` vs `.ui-button` at 6px)
- Inconsistent padding (`p-4` vs `var(--space-4)` vs `padding: '2rem'` inline)
- Colors defined three ways: CSS vars, Tailwind classes (`bg-blue-600`), and hardcoded hex (`#4f46e5`)

#### 2. **Login Page: 100% Inline Styles**
The login page ignores the design system entirely. Every style is an inline JS object. This makes it impossible to maintain, overrides the design tokens, and creates subtle visual differences (input border uses `#e2e8f0` directly instead of `var(--color-border-subtle)`).

#### 3. **Landing Page (root `page.tsx`): Wrong Visual Identity**
The dark `slate-900 + green-500` theme doesn't match the rest of the application at all. The app interior is light gray/white (`#f8fafc`), indigo-accented. The landing page is dark green. Users experience a jarring visual shift when they log in.

There's no marketing `(public)/page.tsx` — the public landing page CSS classes in `globals.css` (`.marketing-hero`, `.marketing-topbar`, etc.) are defined but **orphaned** — the file doesn't exist at `src/app/(public)/page.tsx`. A detailed marketing page CSS system has been built with no corresponding component.

#### 4. **Dashboard Page: Placeholder Content**
The org dashboard renders literal placeholder text: `"Domain-specific dashboard content энд орно."` — this is shipping incomplete UI to users. There are no stats, no quick actions, no meaningful content.

#### 5. **No Active State on Navigation**
The `app-shell__nav` has no visual indication of the currently active route. Users cannot tell where they are within the app shell.

#### 6. **No Loading States on Server Components**
`app/home/page.tsx` and `programme/page.tsx` are server components with no `loading.tsx` files. On slow connections users see a blank white screen with no feedback.

#### 7. **Empty State Quality is Inconsistent**
- Programme page empty state: `📋 + text` — bare minimum, acceptable
- App home has no empty state if there are no sessions today (silently renders nothing)
- Dashboard: placeholder text instead of a real empty state

#### 8. **Accessibility Gaps**
- Login form inputs have no `id` / `htmlFor` association on labels
- OTP input has no `aria-label`
- Tab buttons in login use `<button>` without `role="tab"` / `aria-selected`
- Many interactive elements lack visible focus states

#### 9. **Staff Login Tab Mismatch**
The staff tab shows a password field in the UI, but the `handleStaffSubmit` function ignores the password and just calls `signInWithOTP(email)` anyway — identical to the participant flow. This is a UX lie. Users expect password auth on that tab.

#### 10. **Mobile Navigation: No Bottom Bar**
On mobile, the `app-shell__header` collapses poorly. There's no bottom navigation bar — a standard pattern for mobile-first apps. Users must scroll up to the header to switch sections.

---

## 2. Priority Fixes

### P0 — Critical (breaks trust or function)

| # | Issue | Impact |
|---|-------|--------|
| P0-1 | Staff login tab shows password field but ignores it — OTP is sent regardless | Deceptive UX |
| P0-2 | Dashboard page shows placeholder text in production | Looks broken to org admins |
| P0-3 | Login/verify pages use 100% inline styles, ignoring design tokens | Visual inconsistency |
| P0-4 | No `loading.tsx` for app home and programme — blank screen on load | Feels broken |
| P0-5 | Form inputs in login have no `id`/`htmlFor` label association | Accessibility failure |

### P1 — Important (degrades experience)

| # | Issue | Impact |
|---|-------|--------|
| P1-1 | Landing page dark theme clashes with light app interior | Brand discontinuity |
| P1-2 | Two design systems (CSS vars vs Tailwind) used inconsistently | Maintenance nightmare |
| P1-3 | No active nav state indicator in app shell | Disorientation |
| P1-4 | No mobile bottom navigation bar | Poor mobile UX |
| P1-5 | App home shows no empty state when `todaySessions === 0` | Silent failure |
| P1-6 | OTP input should auto-submit when 6 digits entered | Extra friction |
| P1-7 | Programme cards: action buttons link to detail page instead of performing actions inline | Defeats the card's purpose |
| P1-8 | Missing `aria-label`, `role="tab"`, `aria-selected` throughout auth flow | Accessibility |

### P2 — Nice-to-Have (polish)

| # | Issue | Impact |
|---|-------|--------|
| P2-1 | `--radius-lg` token missing (only `sm` and `md` defined) | Inconsistent rounding |
| P2-2 | No dark mode support despite `color-scheme: light` explicitly set | Future-proofing |
| P2-3 | No skeleton/shimmer loading pattern defined | Loading feels abrupt |
| P2-4 | Marketing CSS in globals.css is orphaned — no corresponding page | Dead code |
| P2-5 | Speaker avatar stack has no max-width, can overflow on narrow cards | Layout bug on small screens |
| P2-6 | `--space-7` token is missing (jumps from 6 to 8) | Irregular scale |
| P2-7 | Typography scale stops at `text-2xl` — no `text-3xl` or `text-4xl` tokens | Hero text uses Tailwind instead |
| P2-8 | Verify page emoji `📩` is large and decorative with no alt text structure | Accessibility |

---

## 3. Design System Recommendations

### 3.1 Resolve the Two-System Problem

**Decision: Keep CSS custom properties as the source of truth. Use Tailwind only via CSS var bridging or eliminate it from app/* pages.**

Option A (Recommended): Add a Tailwind `tailwind.config.ts` that maps Tailwind tokens to your CSS vars:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'bg-app': 'var(--color-bg-app)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-muted': 'var(--color-bg-muted)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-strong': 'var(--color-border-strong)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)', // add this token
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
      },
    },
  },
};
export default config;
```

This makes `bg-accent`, `text-muted`, `rounded-md` etc. in Tailwind resolve to your CSS vars — one system, two syntaxes.

### 3.2 Extended Color Palette

Add missing tokens to `:root`:

```css
/* Missing tokens — add to globals.css */
--radius-lg: 12px;
--radius-xl: 16px;
--space-7: 1.75rem;

/* Extended text scale */
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;

/* Shadows */
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
--shadow-lg: 0 8px 24px rgba(15, 23, 42, 0.12);

/* Interactive states */
--color-accent-subtle: #eef2ff;
--color-accent-subtle-hover: #e0e7ff;
```

### 3.3 Typography Scale

```css
/* Recommended additions */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

--line-height-tight: 1.2;
--line-height-snug: 1.35;
--line-height-normal: 1.5;
--line-height-relaxed: 1.65;
```

### 3.4 Landing Page Color Direction

Align the landing page with the app's identity. Use a **light-mode hero with indigo accent** instead of the dark green theme:

```
Background:    #f8fafc (--color-bg-app)
Hero gradient: subtle indigo-to-white, not black-to-green
Primary CTA:   #4f46e5 (--color-accent)
Brand icon:    linear-gradient(135deg, #4f46e5, #7c3aed) ← already defined in .marketing-brand__mark
```

This creates visual continuity: user lands → sees indigo/light → logs in → sees same indigo/light inside. No jarring switch.

### 3.5 Spacing & Layout Consistency

Standardize page container classes:

| Context | Class | Behavior |
|---------|-------|----------|
| App pages | `.app-shell__main` | `padding: var(--space-8)`, flex: 1 |
| Auth pages | `.ui-auth-main` | max-width 28rem, centered |
| Content pages | `.ui-page-main` | max-width 72rem, centered |
| Admin pages | `.ui-admin-content` | max-width 1280px, centered |

The app pages (`/app/*`) currently use Tailwind `max-w-2xl mx-auto p-4` — replace with `ui-page-main` or a dedicated `.app-content` class that uses CSS vars.

---

## 4. Page-by-Page Improvements

### 4.1 Landing Page (`/` → `src/app/page.tsx`)

**Current problems:** Dark slate/green theme inconsistent with app. No sticky nav. Feature grid is basic. No social proof.

**Recommended changes:**

1. **Switch to light theme** — use `--color-bg-app` background, indigo accent:

```tsx
// Replace the dark gradient with:
<main className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
```

2. **Use the orphaned marketing CSS** — the `.marketing-*` CSS classes in globals.css are complete and production-ready. The `(public)/page.tsx` page was supposed to use them. Either:
   - Create `src/app/(public)/page.tsx` and use the marketing classes (recommended)
   - Delete the marketing CSS and keep the current simpler approach

3. **Add sticky header** with blur effect (`.marketing-topbar` class already handles this).

4. **Add a proper hero visual** — the current hero has text-only; add the mock dashboard panel (`.marketing-preview` classes handle this).

5. **CTA hierarchy:** One primary CTA (`Нэвтрэх`), one secondary (`VIP бүртгэл`). Currently both have similar visual weight.

```tsx
// Better CTA block:
<div className="flex gap-3 flex-wrap justify-center">
  <Link href="/login" className="ui-button ui-button--primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
    Нэвтрэх
  </Link>
  <Link href="/apply-vip" className="ui-button ui-button--secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
    VIP бүртгэл
  </Link>
</div>
```

---

### 4.2 Login Page (`/login` → `src/app/(auth)/login/page.tsx`)

**Current problems:** 100% inline styles, staff tab misleads users (shows password but does OTP), no link back to landing, input labels not associated with inputs.

**Fix 1: Migrate to design system classes**

```tsx
// Before (inline):
<div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

// After (design system):
<div className="ui-card ui-card--padded" style={{ padding: 'var(--space-8)' }}>
```

**Fix 2: Fix the staff tab — either implement real password auth or remove the password field**

```tsx
// Option A: Show that staff also uses OTP (honest)
{tab === 'staff' && (
  <p className="ui-text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
    Ажилтан болон Админ нар мөн нэг удаагийн кодоор нэвтэрнэ.
  </p>
)}

// Option B: Actually implement password auth for staff
// handleStaffSubmit should call signInWithPassword(email, password)
// not signInWithOTP(email)
```

**Fix 3: Proper label/input association**

```tsx
// Before:
<label style={{ ... }}>И-мэйл хаяг</label>
<input type="email" ... />

// After:
<label htmlFor="email" className="ui-label">И-мэйл хаяг</label>
<input id="email" type="email" className="ui-input" ... />
```

**Fix 4: Add proper tab ARIA roles**

```tsx
<div role="tablist" style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: 'var(--space-6)' }}>
  {(['participant', 'staff'] as const).map((t) => (
    <button
      key={t}
      role="tab"
      aria-selected={tab === t}
      onClick={() => { setTab(t); setError(''); }}
      className={`ui-button ui-button--ghost ${tab === t ? 'active' : ''}`}
      ...
    >
```

**Fix 5: Add back-to-home link**

```tsx
// Below the card
<div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
  <Link href="/" className="ui-text-muted" style={{ fontSize: 'var(--text-sm)' }}>
    ← Нүүр хуудас руу буцах
  </Link>
</div>
```

---

### 4.3 OTP Verify Page (`/verify` → `src/app/(auth)/verify/page.tsx`)

**Current problems:** Inline styles, OTP input doesn't auto-submit, no character count indication, Suspense fallback is bare text.

**Fix 1: Auto-submit when code reaches expected length**

```tsx
// In handleChange:
function handleChange(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 6); // assuming 6-digit OTP
  setCode(cleaned);
  setError('');
  if (cleaned.length === 6) {
    // Auto-verify
    handleVerify(cleaned);
  }
}
```

**Fix 2: Use 6 individual digit boxes instead of one input (modern OTP UX)**

This is a P1 improvement. Individual boxes provide better affordance:

```tsx
// Create <OTPInput digits={6} onComplete={handleVerify} /> component
// Each box: w-12 h-14 centered, large font, auto-advance on input
// Existing single-input approach works but feels dated
```

**Fix 3: Better Suspense fallback**

```tsx
// Before:
<Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', ... }}>Уншиж байна...</div>}>

// After:
<Suspense fallback={
  <div className="ui-auth-main" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <div className="ui-card ui-card--padded" style={{ width: '100%', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>📩</div>
      <p className="ui-text-muted">Уншиж байна...</p>
    </div>
  </div>
}>
```

**Fix 4: Migrate all inline styles to CSS classes** (same pattern as login fix above)

---

### 4.4 App Home (`/app/home` → `src/app/app/home/page.tsx`)

**Current problems:** Uses Tailwind instead of design system, no empty state when no sessions today, quick link colors use Tailwind semantic classes not design tokens.

**Fix 1: Add empty state for zero today sessions**

```tsx
// After the greeting, before quick links:
{(todaySessions ?? 0) === 0 && (
  <div className="ui-card ui-card--padded" style={{ textAlign: 'center', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📅</div>
    <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Өнөөдөр арга хэмжаа алга</p>
    <p className="ui-text-muted" style={{ marginTop: 'var(--space-1)' }}>Бүх хөтөлбөрийг доор харна уу</p>
  </div>
)}
```

**Fix 2: Replace Tailwind color classes with design tokens**

The quick link cards use `bg-blue-50 border-blue-200 text-blue-800` etc. This creates maintenance fragility. Instead, define semantic card variants:

```css
/* Add to globals.css */
.app-quick-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-elevated);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: box-shadow 0.12s ease, border-color 0.12s ease;
}
.app-quick-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}
.app-quick-card__icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
}
```

**Fix 3: Add `loading.tsx` for the route**

```tsx
// src/app/app/home/loading.tsx
export default function Loading() {
  return (
    <div className="ui-page-main" style={{ maxWidth: '42rem' }}>
      {/* Skeleton greeting */}
      <div style={{ height: '2rem', width: '60%', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }} />
      <div style={{ height: '1rem', width: '80%', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-8)' }} />
      {/* Skeleton cards */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: '4.5rem', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-3)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );
}
```

---

### 4.5 Programme Page (`/app/programme`)

**Current problems:** Good feature set but session cards have a UX bug — action buttons navigate to the detail page instead of performing actions inline. Date tabs use Tailwind `bg-blue-600` not design tokens.

**Fix 1: Make registration and agenda actions inline (server actions)**

```tsx
// Instead of:
<Link href={`/app/programme/${session.id}`} className="...">
  + Бүртгүүлэх
</Link>

// Use a server action form:
<form action={registerAction}>
  <input type="hidden" name="sessionId" value={session.id} />
  <button type="submit" className="ui-button ui-button--primary ui-button--sm">
    + Бүртгүүлэх
  </button>
</form>
```

This is a significant improvement — currently the user must navigate away just to register for a session.

**Fix 2: Date tabs with design tokens**

```tsx
// Before (Tailwind):
className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
  d === activeDate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
}`}

// After (CSS vars inline or custom class):
style={{
  padding: '0.5rem 1rem',
  borderRadius: '999px',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  background: d === activeDate ? 'var(--color-accent)' : 'var(--color-bg-muted)',
  color: d === activeDate ? '#fff' : 'var(--color-text-secondary)',
  textDecoration: 'none',
  transition: 'background 0.12s ease',
}}
```

**Fix 3: Better session card visual hierarchy**

Current card uses 3+ badge types in one row (session type + zone + status chips). On narrow screens this wraps poorly. Recommended:

```
┌──────────────────────────────────────────┐
│ [TYPE BADGE]           [ZONE BADGE]      │
│ Session Title (bold, 2 lines max)        │
│ 🕐 09:00–10:30 · 📍 Main Hall           │
│ [Speaker avatars]                        │
│ [▓▓▓▓▓▓░░░░] 45/80 суудал              │
│                                          │
│ [+ Бүртгүүлэх]    [☆ Нэмэх]            │
└──────────────────────────────────────────┘
```

Move action buttons to a consistent footer zone in the card, always visible.

**Fix 4: Add `loading.tsx`**

```tsx
// src/app/app/programme/loading.tsx
// 3-4 skeleton session cards with pulsing animation
```

**Fix 5: Sticky date tabs on scroll**

```css
/* Make date tabs stick when scrolling through sessions */
.programme-date-tabs {
  position: sticky;
  top: 0; /* or top: header height */
  z-index: 10;
  background: var(--color-bg-app);
  padding: var(--space-3) 0;
  margin: 0 calc(-1 * var(--space-4)); /* bleed to edges */
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}
```

---

### 4.6 Org Dashboard (`/dashboard`)

**Current problems:** Shows placeholder text. No stats. No quick actions.

This page should show the organization's key metrics. At minimum:

```tsx
// Replace the placeholder Card with real content:
<section className="ui-customer-stack">
  <PageHeader
    title={organization.name}
    description="Байгууллагын удирдлагын самбар"
  />

  {/* Stats row */}
  <div className="ui-stat-grid">
    <div className="ui-stat-card">
      <span className="ui-stat-card__label">Оролцогчид</span>
      <strong className="ui-stat-card__value">{participantCount}</strong>
    </div>
    <div className="ui-stat-card">
      <span className="ui-stat-card__label">Арга хэмжаанууд</span>
      <strong className="ui-stat-card__value">{sessionCount}</strong>
    </div>
    <div className="ui-stat-card">
      <span className="ui-stat-card__label">Subscription</span>
      <strong className="ui-stat-card__value">{subscription?.plan.name ?? '—'}</strong>
      <span className="ui-stat-card__hint">{subscription?.status}</span>
    </div>
  </div>

  {/* Quick actions */}
  <Card padded>
    <h2 className="ui-section-title" style={{ marginBottom: 'var(--space-3)' }}>Хурдан үйлдлүүд</h2>
    <div className="ui-quick-links">
      <Link href="/dashboard/events" className="ui-quick-link">📅 Арга хэмжаа</Link>
      <Link href="/dashboard/participants" className="ui-quick-link">👥 Оролцогчид</Link>
      <Link href="/dashboard/settings" className="ui-quick-link">⚙️ Тохиргоо</Link>
    </div>
  </Card>

  <OperationalHealthBanner failedSync={null} failedAnalysis={null} />
</section>
```

---

## 5. Component Library

### 5.1 Missing Components — Create These

#### `<OTPInput />` — Accessible OTP entry

```tsx
// src/components/ui/otp-input.tsx
// 6 individual digit boxes, auto-advance, paste support
// Props: digits, onComplete(code: string), disabled, error
```

**Why:** The current single-text-input approach works but is visually outdated. OTP boxes set clear expectations for code length and are standard in modern auth.

---

#### `<BottomNav />` — Mobile navigation bar

```tsx
// src/components/app/bottom-nav.tsx
// Fixed bottom, 4-5 icon+label tabs
// Highlights active route via usePathname()
// Tabs: Home, Programme, Map, Services, Profile
```

```css
/* globals.css addition */
.app-bottom-nav {
  display: none; /* hidden on desktop */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border-subtle);
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom); /* iPhone home bar */
}

@media (max-width: 640px) {
  .app-bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: var(--space-2) 0;
  }
  .app-shell__main {
    padding-bottom: calc(var(--space-8) + 4rem); /* space for bottom nav */
  }
}
```

---

#### `<SessionCard />` — Reusable session card

```tsx
// src/components/programme/session-card.tsx
// Props: session, registration status, inAgenda, onRegister, onAddToAgenda
// Used in: programme list, agenda, home upcoming
// Avoids duplication across 3 different files
```

---

#### `<EmptyState />` — Standardized empty states

```tsx
// src/components/ui/empty-state.tsx
type EmptyStateProps = {
  icon: string;    // emoji
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
};

// Usage:
<EmptyState
  icon="📋"
  title="Энэ өдрийн хөтөлбөр хоосон байна"
  description="Өөр огноо сонгоно уу"
/>
```

---

#### `<SkeletonCard />` — Loading placeholder

```tsx
// src/components/ui/skeleton.tsx
// Props: lines, height, width
// Used in loading.tsx files across the app

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="ui-card ui-card--padded" aria-busy="true" aria-label="Уншиж байна">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: i === 0 ? '40%' : i === 1 ? '80%' : '60%' }} />
      ))}
    </div>
  );
}
```

---

#### `<PageContainer />` — Standardized page wrapper

```tsx
// src/components/layout/page-container.tsx
// Eliminates inconsistent Tailwind `max-w-2xl mx-auto p-4` vs `max-w-4xl mx-auto p-4` patterns
// Props: size ('sm' | 'md' | 'lg' | 'xl'), children

export function PageContainer({ size = 'md', children }: { size?: 'sm' | 'md' | 'lg' | 'xl', children: React.ReactNode }) {
  const maxWidth = { sm: '28rem', md: '42rem', lg: '64rem', xl: '80rem' }[size];
  return (
    <div className="app-shell__main" style={{ maxWidth, margin: '0 auto', width: '100%' }}>
      {children}
    </div>
  );
}
```

---

### 5.2 Enhance Existing Components

#### `<Button />` — Add loading state

```tsx
// Add to ButtonProps:
loading?: boolean;

// In render:
<button ... disabled={rest.disabled || loading}>
  {loading && <Spinner size={14} />}
  {children}
</button>
```

#### `<Input />` — Add error state

```tsx
// Add to InputProps:
error?: boolean;

// Class logic:
className={['ui-input', error && 'ui-input--error', className].filter(Boolean).join(' ')}
```

```css
/* globals.css */
.ui-input--error {
  border-color: var(--color-status-danger);
  background: var(--color-status-danger-bg);
}
.ui-input--error:focus {
  border-color: var(--color-status-danger);
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12);
}
```

#### `<Card />` — Add interactive variant

```tsx
// Add to CardProps:
interactive?: boolean;

// For clickable stat cards / quick links
className={['ui-card', interactive && 'ui-card--interactive', ...].filter(Boolean).join(' ')}
```

```css
.ui-card--interactive {
  cursor: pointer;
  transition: box-shadow 0.12s ease, border-color 0.12s ease;
}
.ui-card--interactive:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}
```

---

## Implementation Roadmap

### Week 1 (P0 fixes)
1. Fix staff login tab — either remove password field or implement real password auth
2. Migrate login/verify pages from inline styles to `.ui-*` classes
3. Add `loading.tsx` for `/app/home` and `/app/programme`
4. Fix all `label`/`input` associations (accessibility)
5. Replace dashboard placeholder with real stat cards

### Week 2 (P1 polish)
1. Align landing page color scheme with app interior
2. Create `<BottomNav />` component and add to app shell
3. Make programme registration/agenda actions inline (server actions)
4. Add active state indicator to app shell navigation
5. Add empty states to app home (no sessions today)
6. OTP auto-submit on 6 digits

### Week 3 (Systematic)
1. Set up Tailwind ↔ CSS vars bridge in `tailwind.config.ts`
2. Audit all app pages and replace hardcoded Tailwind color classes with design tokens
3. Create `<SessionCard />`, `<EmptyState />`, `<PageContainer />` shared components
4. Replace all per-page session card duplications with the shared component

### Week 4 (P2 polish)
1. Add skeleton loading states
2. Add `--radius-lg`, `--shadow-md`, `--text-3xl` missing tokens
3. Sticky date tabs on programme page
4. Resolve orphaned marketing CSS (create the page or delete the CSS)

---

*End of UX/UI Audit & Improvement Plan*
