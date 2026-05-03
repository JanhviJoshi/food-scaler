# Decision: UI Changes & Stack Migration

## Stack Changes

| | Before | After |
|---|---|---|
| Build tool | Create React App (CRA) | Vite |
| Component library | Blueprint.js | shadcn/ui |
| Styling | Blueprint CSS + inline styles | Tailwind CSS |

### Why the migration
- CRA is unmaintained since 2022, Vite is the modern standard
- Blueprint.js is Palantir-specific, shadcn/ui + Tailwind is widely used across industry
- Tailwind is the most transferable frontend skill in 2025

---

## Setup (new dev)

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

---

## Component Changes

### `MealForm.tsx`
- Replaced `FormGroup` + `NumericInput` with shadcn `Input`
- Replaced `HTMLSelect` with shadcn `Select`
- Replaced Blueprint `Button` with shadcn `Button`
- Protein selection changed from text input (`"chicken, egg"`) to clickable chips
- Sections wrapped in shadcn `Card` components

### `Results.tsx`
- Replaced all Blueprint components with shadcn `Card`, `Button`
- Shopping list displayed as plain text block — easy to copy into Notes
- Copy to clipboard button — shows "✓ Copied" for 2 seconds after clicking
- `total` row in breakdown highlighted with green pill
- `portion_weight` highlighted with green pill

### `App.tsx`
- Removed Blueprint `Spinner`
- Replaced with Tailwind CSS spinner: `animate-spin` utility class

---

## Tailwind Patterns Used

```typescript
// Layout
"max-w-lg mx-auto px-4 py-8 space-y-4"   // centered container
"grid grid-cols-2 gap-3"                   // two column grid
"flex justify-between items-center"        // space between row

// Typography
"text-xs uppercase tracking-wider text-slate-400 font-medium"  // section label
"text-2xl font-medium"                                          // metric number
"text-sm text-slate-500"                                        // muted label

// Colors
"bg-green-50 text-green-700 border-green-400"   // active chip
"bg-slate-50 rounded-lg p-4"                    // metric card

// Interactive
"cursor-pointer transition-all select-none"     // chip behavior
"animate-spin"                                  // loading spinner
```

---

## shadcn Components Used

```bash
npx shadcn@latest add button card input select
```

Import pattern:
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
```

`@/` maps to `src/` — configured in `tsconfig.json` and `vite.config.ts`.