# NutriAI Frontend Revamp — Full Creative Plan
> Status: Planning | Last Updated: 2026-03-04

---

## Design Direction

**Theme: "Dark Wellness Premium"**

Think Linear.app meets a high-end nutrition brand. Dark hero with deep forest green, glass cards, emerald neon accents, organic motion. Content sections flip to warm off-white. The overall vibe should feel like a product that *costs something* — not a free AI wrapper.

**Palette:**
| Role | Color | Use |
|---|---|---|
| Background (dark) | `#04090A` near-black | Hero, header |
| Surface dark | `#0D1F14` deep forest | Cards on dark bg |
| Brand | `#22C55E` emerald-500 | Accents, CTAs, icons |
| Brand glow | `#16A34A` | Button fills |
| Background (light) | `#F7F8F3` warm off-white | Content sections |
| Surface light | `#FFFFFF` | Cards on light bg |
| Text primary | `#F0FDF4` | On dark |
| Text muted | `#6B7280` | On light |
| Amber accent | `#F59E0B` | Tags, badges, highlights |

**Typography:**
- Headings: `Bricolage Grotesque` (variable, weight 400–800) — geometric, premium
- Body: `Inter` — stays readable
- Mono: `JetBrains Mono` — for numbers/macros

Load both from Google Fonts via `index.html`.

---

## New npm Packages

```bash
npm install framer-motion lucide-react zustand react-dropzone recharts react-hot-toast clsx tailwind-merge react-intersection-observer
```

| Package | Purpose |
|---|---|
| `framer-motion` | Page transitions, scroll animations, spring physics on cards, stagger reveals |
| `lucide-react` | 1000+ premium SVG icons — replace all custom SVG in constants.tsx |
| `zustand` | Global state store — replaces prop drilling & scattered localStorage hooks |
| `react-dropzone` | Professional drag-and-drop image upload with preview |
| `recharts` | Macro pie chart + calorie bar rendered inline in chat AI responses |
| `react-hot-toast` | Toast notifications (rate limit hit, image too large, etc.) |
| `clsx` + `tailwind-merge` | Clean conditional className handling (cn() utility) |
| `react-intersection-observer` | Trigger scroll-based animations for landing page sections |

---

## App State Machine

```
'landing' ──[Get Started]──► 'onboarding' ──[Complete]──► 'chat'
                                                              ▲
localStorage profile found ─────────────────────────────────┘
```

**Zustand store** (`frontend/store/useAppStore.ts`):
```typescript
{
  appState: 'landing' | 'onboarding' | 'chat'
  profile: UserProfile | null
  messages: Message[]
  setAppState, setProfile, addMessage, clearSession
}
```

All localStorage reads/writes live inside the store. Components just call `useAppStore()`.

---

## Phase 1 — Landing Page

### File: `frontend/components/LandingPage.tsx`

Full-scroll marketing page. Each section is a separate sub-component.

---

### 1A. Navbar

Sticky. On scroll > 50px → `backdrop-blur-lg bg-black/60` glass morphism effect (Framer Motion `useScroll` + `useTransform`).

```
[🌿 NutriAI]                    [Features] [How it works]  [Get Started →]
```

- "Get Started" = amber pill button with subtle shimmer animation (CSS keyframe)
- Mobile: hamburger → `<motion.div>` slide-down drawer

---

### 1B. Hero Section

Full-viewport height. Dark background `#04090A`.

**Background FX:** Three large blurred radial gradient orbs (pure CSS, no library):
```css
/* orb 1: emerald, top-left */
/* orb 2: teal, bottom-right */
/* orb 3: amber, center-top subtle */
```

**Layout:**
```
LEFT (60%)                      RIGHT (40%)
─────────────────               ──────────────────────
Eyebrow badge:                  [Floating Chat Mockup Card]
● POWERED BY NVIDIA NIM         ┌────────────────────────┐
                                │ 🌿 NutriAI             │
Headline (Bricolage Grotesk):   ├────────────────────────┤
"Your AI nutritionist           │ [Food photo thumbnail] │
 that sees what                 │ 🍜 Pad Thai detected   │
 you eat."                      │                        │
                                │ ▸ 520 kcal             │
Animated typewriter cycling:    │ ▸ 28g protein          │
"What's in this bowl?"          │ ▸ 62g carbs            │
"Plan my keto week."            │ ▸ 18g fat              │
"Is this snack healthy?"        │                        │
                                │ Relative to your goal: │
Sub-copy (1 line):              │ ████████░░ 82%         │
"Upload a photo of your meal    └────────────────────────┘
 or just ask — powered by             ↑ Framer Motion float
 Llama 4 Maverick vision AI."         + entrance animation

[Start Free →]  [See it in action ↓]
(amber)         (ghost)
```

**Animations (Framer Motion):**
- Headline: word-by-word stagger reveal (`variants` with `staggerChildren: 0.06`)
- Typewriter effect: custom hook cycles through strings with a blinking cursor
- Chat mockup: `y: [0, -12, 0]` infinite float with `ease: "easeInOut"`
- Orbs: slow `scale` pulse on infinite loop
- CTAs: entrance from below with spring physics

---

### 1C. Trusted By / Stats Bar

Dark background, full-width.

```
┌─────────────────────────────────────────────────────────────────┐
│  10,000+          99ms            Llama 4           Vercel Edge │
│  Meals Analyzed   Response Time   Maverick Vision   Powered     │
└─────────────────────────────────────────────────────────────────┘
```

Animated number counters (Framer Motion `useMotionValue` + `animate`) triggered by `useInView`.

---

### 1D. Features — Bento Grid

Light section (`#F7F8F3`). Asymmetric bento grid layout:

```
┌──────────────────────┬────────────┬────────────┐
│                      │            │            │
│  📷 Snap & Analyze   │ 🎯 Goals   │ 🌱 Diet    │
│  (LARGE — 2 cols)    │ (small)    │ (small)    │
│                      │            │            │
│  Upload any food     ├────────────┴────────────┤
│  photo → instant     │                         │
│  macro breakdown     │  📊 Visual Nutrition    │
│                      │  Charts (WIDE)          │
├──────────────────────┤                         │
│  🧬 Personalized     │  Recharts preview with  │
│  (small)             │  mock macro pie chart   │
└──────────────────────┴─────────────────────────┘
```

Cards have:
- Hover: `scale(1.02)` + border glow with `box-shadow: 0 0 0 1px emerald`
- Scroll entrance: `useInView` → Framer Motion `whileInView` fade+slide
- Large feature card has an animated CSS gradient border

---

### 1E. How It Works — Horizontal Timeline

```
        ①                    ②                    ③
   Build Profile          Chat & Snap           Get Your Plan
   ────────────      ────────────────────     ──────────────
   2-min wizard.     Text or photo — AI       Personalized meal
   Your goals,       understands both.        plans, macros,
   diet, allergies.  Just ask naturally.      and advice.
         │                   │                      │
    [illustration]      [illustration]         [illustration]
```

Connecting line animates (SVG `stroke-dashoffset` on scroll).

---

### 1F. Testimonial / Quote Block

Dark section with a large pull-quote. Keep it honest — mark it as a demo quote.

---

### 1G. Final CTA

Dark, centered. Big headline. Amber button. Subtle noise texture overlay.

```
        "Start eating smarter today."

        [Build My Profile — It's Free →]

        No sign-up required · Runs in your browser · Powered by NVIDIA
```

---

## Phase 2 — Onboarding Redesign

### File: `frontend/components/Onboarding.tsx` (full rewrite)

**Design pattern: Fullscreen immersive steps.** Each step takes the full viewport. Background shifts subtly between steps using Framer Motion `AnimatePresence` + layout transitions.

---

### Step Structure

A `<StepWrapper>` component handles:
- Framer Motion page transition (slide left/right)
- Centered content max-width 480px
- Step counter (1 of 4) as a morphing progress bar at top

---

### Step 1 — Hello
```
        [🌿 large icon]

        "What should we call you?"

        [                    ] ← large, borderless input
           Your name

        [Male] [Female] [Other]  ← icon card tiles

        [How old are you?]
        ──●─────── 25  ← custom slider

                        [Continue →]
```

Gender tiles use Framer Motion `whileTap: { scale: 0.95 }` and a green border pop on select.

---

### Step 2 — Body
```
        "Tell us about your body."

        Height    ──────────●── 175 cm
                  [cm / ft toggle]

        Weight    ──●────────── 68 kg
                  [kg / lb toggle]

        Activity Level:
        ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐
        │ 🪑       │ │ 🚶        │ │ 🏃           │ │ ⚡        │
        │Sedentary │ │  Lightly  │ │  Moderately  │ │Very Active│
        │ Desk job │ │  Active   │ │   Active     │ │ Daily gym │
        └──────────┘ └────────────┘ └──────────────┘ └───────────┘
```

Selected card: scale 1.03 + emerald ring + checkmark badge (Framer Motion `layoutId` shared element transition on the checkmark).

---

### Step 3 — Goals
```
        "What are you working towards?"

        ┌────────────────┐  ┌────────────────┐
        │   📉           │  │   💪           │
        │ Weight Loss    │  │ Muscle Gain    │
        │                │  │                │
        └────────────────┘  └────────────────┘
        ┌────────────────┐  ┌────────────────┐
        │   ⚖️           │  │   🏅           │
        │ Maintenance    │  │ Athletic Perf. │
        │                │  │                │
        └────────────────┘  └────────────────┘

        Diet Preference:
        [Anything ✓] [Vegetarian] [Vegan] [Keto] [Paleo] ...
        ← horizontal scroll chips →
```

---

### Step 4 — Health Details
```
        "Almost done! Any health notes?"

        Allergies
        [peanuts ✕] [shellfish ✕]  ← pill tags
        [Type allergy + Enter ___________]

        Medical Conditions (optional)
        [Type condition + Enter ___________]

        [Skip this step]    [Finish Setup →]
```

---

### Completion Celebration
On submit → `react-confetti` full-screen burst for 3 seconds, then fade into chat.

---

## Phase 3 — Chat Interface

### File: `frontend/components/ChatWindow.tsx`

---

### Layout
```
┌──────────────────────────────────────────────────┐
│ Header: [🌿 NutriAI]  [New Chat] [Reset Profile] │  ← Layout.tsx
├──────────────────────────────────────────────────┤
│                                                  │
│  Message bubbles area (flex-1, scrollable)       │
│                                                  │
│  [image preview strip — if image attached]       │
├──────────────────────────────────────────────────┤
│  [📎] [🎤] [input placeholder         ] [📷] [→] │
└──────────────────────────────────────────────────┘
```

---

### Message Bubbles

**User:**
- Right-aligned
- Gradient background: `from-emerald-600 to-emerald-700`
- White text
- If image attached: image renders as rounded card above text

**AI:**
- Left-aligned
- White card, `border-l-4 border-emerald-500`
- **Macro Card auto-detection:** If the AI response contains calorie/macro data, a `<MacroCard>` component auto-renders below the text with a `recharts` PieChart (Protein/Carbs/Fat donut) + key numbers

**Macro Card component:**
```
┌────────────────────────────────────┐
│  Nutritional Breakdown             │
│  ┌──────────┐  Calories: 520 kcal │
│  │ [Donut   │  Protein:  28g  ●   │
│  │  Chart]  │  Carbs:    62g  ●   │
│  │          │  Fat:      18g  ●   │
│  └──────────┘                      │
│  [Copy] [Save to Journal]          │
└────────────────────────────────────┘
```

---

### Image Upload — Full UX Flow

#### Method 1: Click camera icon → file picker
#### Method 2: Drag image onto chat window anywhere

**Drag state:** entire chat gets overlay:
```
┌────────────────────────────────────────────┐
│                                            │
│      📸                                    │
│   Drop your food photo here               │
│   We'll analyze it instantly              │
│                                            │
└────────────────────────────────────────────┘
```
Powered by `react-dropzone` with animated dashed border (`border-dash` CSS animation).

**Image attached state (input area):**
```
┌────────────────────────────────────────────┐
│ [🖼️ 128px thumbnail]  ✕ Remove            │
├────────────────────────────────────────────┤
│ [📎] [What did I eat here?        ] [📷][→]│
└────────────────────────────────────────────┘
```

**Sending with image:**
- Image is read as base64 via `FileReader`
- Stored on `Message.imageBase64` (new field)
- Displayed as a chat bubble with rounded image
- Service sends multimodal payload to NIM

**AI Analyzing state:**
```
[🍜 Image] ← your message bubble
           ┌────────────────┐
           │ 🔍 Analyzing   │  ← scanning shimmer animation
           │ ████████░░░░░  │     (CSS gradient + keyframe)
           │ Identifying... │
           └────────────────┘
```

---

### Voice Input

Web Speech API (no package). Microphone button:
- Click → start recording → speech-to-text fills the input
- Visual: pulsing red dot while recording
- "Listening..." placeholder text

---

### Suggestion Chips Upgrade

Current suggestion chips get a glow on hover:
```
[Create a meal plan ✨]  [Calculate my macros]  [Healthy snacks →]
```
Pills animate in with `staggerChildren` — each chip slides up with a spring.

---

### Quick Command Palette (Cmd+K)

Global keyboard shortcut. `cmdk`-style overlay:
```
┌──────────────────────────────────────┐
│ 🔍 Search commands...                │
├──────────────────────────────────────┤
│ 📷  Analyze a food photo             │
│ 🍽️  Create a meal plan               │
│ 💪  Calculate my macros              │
│ 📊  Show my health stats             │
│ 🔄  Start a new chat                 │
│ 👤  Edit my profile                  │
└──────────────────────────────────────┘
```
Pure React + Framer Motion — no `cmdk` package needed if we want to keep it simple.

---

## Phase 4 — Multimodal Service

### File: `frontend/services/geminiService.ts`

**New method:** `sendMessageWithImageStream(text, imageBase64, mimeType, onChunk)`

Payload format (OpenAI vision spec — supported by NIM):
```json
{
  "role": "user",
  "content": [
    {
      "type": "image_url",
      "image_url": {
        "url": "data:image/jpeg;base64,{BASE64_DATA}"
      }
    },
    {
      "type": "text",
      "text": "What is the nutritional content of this meal?"
    }
  ]
}
```

**System prompt addition for vision:**
```
When the user sends an image of food:
1. Identify all visible food items and estimate dish name
2. Estimate portion size (small/medium/large/grams if possible)
3. Return a nutritional breakdown in this EXACT format so the UI can parse it:
   [MACROS: calories={N} | protein={N}g | carbs={N}g | fat={N}g | fiber={N}g]
4. Rate the meal vs the user's goal (0-10 score with brief reasoning)
5. Flag any ingredients that conflict with their allergies: {profile.allergies}
6. Suggest one simple swap to make it healthier
```

The `[MACROS: ...]` tag is parsed client-side to auto-render the `<MacroCard>` component — same pattern as the existing `[SUGGESTIONS: ...]` parser.

---

### File: `frontend/api/nim.js` (minor extension)

No change needed — already proxies any messages array to NIM. The multimodal content array format is passed through transparently.

---

## Phase 5 — Health Sidebar Upgrade

### File: `frontend/components/HealthSidebar.tsx`

Clean, minimal panel — only meaningful data:

```
┌─────────────────────────────┐
│ 👤 Alex, 28                 │
│ Goal: Weight Loss           │
├─────────────────────────────┤
│ BMI          22.4 (Normal)  │
│ ██████████░░ ─────────────  │
├─────────────────────────────┤
│ BMR      Body Fat           │
│ 1847 kcal  22.1%            │
├─────────────────────────────┤
│ Macro Targets (Recharts)    │
│ [Protein] [Carbs] [Fat]     │
│ bar chart with daily goals  │
├─────────────────────────────┤
│ Today's Analyses            │
│ · Egg Fried Rice — 450 kcal │  ← from chat macros
│ · Chicken Biryani — 630 kcal│
├─────────────────────────────┤
│ Recommendations             │
│ · Target ~2580 kcal/day     │
│ · Aim for 60g protein       │
│ · 30 min cardio daily       │
└─────────────────────────────┘
```

> **Removed:** water tracker, metabolic age, ideal weight (noise > signal).
> Today's Analyses auto-populated from messages with `[MACROS:]` tags.
> Dish name shown when available (from `dish=` field in MACROS tag).

---

## Phase 6 — Layout & Global Polish

### `frontend/components/Layout.tsx`
- Full-width in `landing` state
- Constrained `max-w-5xl` in `chat` state
- Header fades from transparent to glass on scroll (landing)
- In chat: solid dark header with gradient border bottom

### `frontend/index.html`
Add Google Fonts link:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### `frontend/styles/globals.css` (new file)
```css
/* Noise texture overlay */
/* Custom scrollbar */
/* Shimmer animation keyframe */
/* Scanning animation keyframe */
/* Typewriter cursor blink */
/* Organic blob shapes */
/* Animated gradient border */
```

### `tailwind.config.js` (extend)
```js
theme: {
  extend: {
    fontFamily: {
      display: ['Bricolage Grotesque', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    animation: {
      'shimmer': 'shimmer 2s infinite',
      'float': 'float 4s ease-in-out infinite',
      'scan': 'scan 1.5s ease-in-out infinite',
      'gradient': 'gradient 4s ease infinite',
    },
    backgroundImage: {
      'noise': "url('/noise.svg')",
      'dot-grid': "radial-gradient(circle, #22c55e20 1px, transparent 1px)",
    }
  }
}
```

---

## Full File Change List

| File | Action | Key Change |
|---|---|---|
| `package.json` | **MODIFY** | Add 8 packages |
| `tailwind.config.js` | **MODIFY** | Custom fonts, animations |
| `frontend/index.html` | **MODIFY** | Google Fonts |
| `frontend/styles/globals.css` | **CREATE** | Keyframes, textures |
| `frontend/store/useAppStore.ts` | **CREATE** | Zustand global state |
| `frontend/lib/utils.ts` | **CREATE** | `cn()` utility |
| `frontend/types.ts` | **EXTEND** | `imageBase64`, `macros` on Message |
| `frontend/constants.tsx` | **REPLACE** | Lucide React icons |
| `frontend/App.tsx` | **REWRITE** | State machine, zustand |
| `frontend/components/LandingPage.tsx` | **CREATE** | Full marketing page |
| `frontend/components/LandingPage/Hero.tsx` | **CREATE** | Hero section |
| `frontend/components/LandingPage/Features.tsx` | **CREATE** | Bento grid |
| `frontend/components/LandingPage/HowItWorks.tsx` | **CREATE** | Timeline |
| `frontend/components/LandingPage/Navbar.tsx` | **CREATE** | Glass nav |
| `frontend/components/Onboarding.tsx` | **REWRITE** | Visual card wizard |
| `frontend/components/ChatWindow.tsx` | **REWRITE** | Image upload, voice, macros |
| `frontend/components/MacroCard.tsx` | **CREATE** | Recharts macro display |
| `frontend/components/Layout.tsx` | **REWRITE** | State-aware, glass |
| `frontend/components/HealthSidebar.tsx` | **REWRITE** | Recharts, water tracker |
| `frontend/services/geminiService.ts` | **EXTEND** | Multimodal + macro parsing |

---

## Implementation Order

```
Week 1 — Foundation
  1. Install packages, tailwind config, fonts, globals.css
  2. lib/utils.ts (cn utility)
  3. store/useAppStore.ts (zustand)
  4. types.ts extensions
  5. constants.tsx (switch to Lucide)
  6. App.tsx rewrite

Week 2 — Landing Page
  7. Navbar.tsx
  8. Hero.tsx (hardest — typewriter, float, orbs)
  9. Features.tsx (bento grid)
  10. HowItWorks.tsx (SVG timeline)
  11. LandingPage.tsx (compose sections)

Week 3 — Onboarding & Chat
  12. Onboarding.tsx rewrite (card tiles, sliders)
  13. ChatWindow.tsx (image upload, drag-drop, voice)
  14. MacroCard.tsx (recharts)
  15. geminiService.ts (multimodal)
  16. HealthSidebar.tsx (recharts upgrade)
  17. Layout.tsx
```

---

## Bug Fixes Applied (2026-03-04)

> Pre-revamp cleanup pass. All fixes already shipped to codebase.

### Deleted
| Path | Reason |
|---|---|
| `backend/` | Legacy Python Flask — not used in production (Vercel Edge only) |
| `.env.local` | Only referenced by the deleted Flask backend |

### `frontend/api/nim.js`
- **Origin check** — replaced weak `.includes('vercel.app')` substring match with exact `origin === allowedOrigin` comparison. Localhost always allowed for dev.
- **CORS** — added `Access-Control-Allow-Origin` header to all responses (was missing on success path). OPTIONS preflight now returns `204` with correct headers instead of `405 Method Not Allowed`.
- **Rate limit EXPIRE** — `fetch(EXPIRE)` was fire-and-forget; now awaited inside its own `try/catch`. A failure no longer permanently locks the daily counter.
- **Rate limit** — limit stays at 30 req/day (code is authoritative); docs updated to match.

### `frontend/services/geminiService.ts`
- **Dead code removed** — entire `provider === 'gemini'` branch (Flask proxy path) deleted. Also removed unused `backendUrl` and `provider` class fields.
- **SSE buffer flush** — added post-loop flush of remaining `buffer` content so the final SSE chunk is never silently dropped.
- **Error surfacing** — catch block now forwards the actual error message (`API Error 429: ...`) to `onChunk` instead of always showing the generic `"⚠️ Error reading stream."`.

### `frontend/vite.config.ts`
- **Removed `GEMINI_API_KEY` injection** — was being embedded into the production JS bundle despite not being used anywhere.
- **`secure: false` → `secure: true`** — TLS verification re-enabled on the NIM dev proxy.
- **`loadEnv` prefix** — removed the `''` (all-env) prefix; config no longer accidentally reads non-`VITE_` secrets into the build context.

### `frontend/` — Build fix
- Installed missing `@types/react-dom` dev dependency (was listed in `package.json` but never installed). Build now passes clean.

---

## Dual-Provider LLM Switch (2026-03-04)

> Gemini 2.5 Flash Lite added as the default provider alongside existing NIM support.

### `frontend/.env`
- Renamed `GEMINI_API_KEYS` → `VITE_GEMINI_API_KEY` (requires `VITE_` prefix for Vite to expose to client)
- `VITE_AI_PROVIDER=gemini` is now the default; set to `nim` to switch to NVIDIA NIM

### `frontend/services/geminiService.ts`
- **`PROVIDER` constant at top** — `VITE_AI_PROVIDER === "nim" ? "nim" : "gemini"`. Gemini is the default when env var is absent or any value other than `"nim"`.
- **`sendNimStream()`** — private method for NVIDIA NIM (Llama 4 Maverick) via SSE. Dev uses Vite proxy at `/nim-api/` + `VITE_NIM_KEY`; prod routes through `/api/nim` Vercel function (key stays server-side).
- **`sendGeminiStream()`** — private method using `@google/genai` SDK. Model: `gemini-2.5-flash-lite`. Converts internal OpenAI-style history to Gemini format (`role: "model"`, `parts: [{text}]`); system message passed as `config.systemInstruction`.
- **`sendMessageStream()`** — routes to the active provider method based on `PROVIDER`.

---

## UI Polish Pass (2026-03-04)

> Post-revamp polish: Indian dish examples, Gemini branding, sidebar cleanup, richer meal cards.

### Landing Page

**`frontend/components/LandingPage/Hero.tsx`**
- Eyebrow badge: Gemini logo (`/gemini-logo-trans.jpg`) + "POWERED BY GOOGLE GEMINI 2.5"
- MockChatCard food: `friedrice-egg-vegies.jpg` image (was emoji 🍜 Pad Thai)
- Dish: **Egg Fried Rice with Veggies** — macros 450 kcal / 15g protein / 65g carbs / 12g fat (realistic Indian values)
- Typewriter strings updated to Indian context: "What's in this thali?", "Is dal good for weight loss?", "How much protein in paneer?"
- Horizontal padding: `px-6` → `px-8 lg:px-20`

**`frontend/components/LandingPage/Features.tsx`**
- Large bento card: 🍝 Spaghetti Bolognese → 🍛 **Chicken Biryani** (630 kcal / 28g protein / 72g carbs)
- `MACRO_DATA` donut: updated to biryani values (Protein 28g, Carbs 72g, Fat 22g)
- Section padding: `px-6` → `px-8 lg:px-16`

**`frontend/components/LandingPage/StatsBar.tsx`**
- Gemini logo shown above the "Gemini 2.5" stat tile

**`frontend/components/LandingPage/FinalCTA.tsx`**
- Fine print: "Powered by Google Gemini 2.5 Flash Lite" (was "Gemini-3-Flash")

### HealthSidebar

**`frontend/components/HealthSidebar.tsx`**
- **Removed:** water tracker, metabolic age tile, ideal weight range tile
- **Kept:** BMI card, 2-tile grid (BMR + Body Fat), Macro Targets bar chart, Today's Analyses, Recommendations

### Enhanced Meal Cards

**`frontend/types.ts`** — `MacroData` extended with: `dish?`, `serving?`, `health_score?` (0–10), `ingredients?`

**`frontend/services/geminiService.ts`**
- `parseMacroTag()` now parses `dish=`, `serving=`, `health_score=`, `ingredients=` fields
- Vision system prompt updated — AI must emit all extended fields in `[MACROS:]` tag

**`frontend/components/MacroCard.tsx`**
- Shows dish name + serving badge in header
- Health Score bar (color-coded 0–10)
- Ingredients chips (max 6 + "+N more")
- "Save" (Print) button — sets `data-print-target` on card + triggers `window.print()`

**`frontend/components/ChatWindow.tsx`**
- Diet plan detection heuristic (keywords: Day 1/2, breakfast, lunch, dinner + length > 300 chars)
- "Download Plan" button appears above detected diet plan messages
- Sets `data-print-target` on the message container before printing

**`frontend/index.css`**
- `@media print` rule: hides all body children except `[data-print-target]` element

**`frontend/public/`**
- `friedrice-egg-vegies.jpg` — served as static asset for landing page hero
- `gemini-logo-trans.jpg` — served as static asset for Gemini branding
