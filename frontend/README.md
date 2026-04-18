# UI Reference — React + Blueprint.js

## Stack
- **Blueprint.js** 
- **Inline styles** — no separate CSS files, styles live on the component

### Install
```bash
npm install @blueprintjs/core @blueprintjs/icons --legacy-peer-deps
```
`--legacy-peer-deps` needed if on React 19 (Blueprint hasn't caught up yet)

### CSS imports — top of `index.tsx`
```typescript
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
```

---

## Blueprint Components Used

| Component | What it does | Key props |
|-----------|-------------|-----------|
| `FormGroup` | Wraps input with label + spacing | `label`, `helperText` |
| `NumericInput` | Number input with +/- buttons | `value`, `onValueChange`, `min`, `fill` |
| `InputGroup` | Styled text input | `value`, `onChange` |
| `HTMLSelect` | Styled dropdown | `value`, `onChange`, `options`, `fill` |
| `Button` | Action button | `intent`, `fill`, `large`, `minimal`, `small` |
| `Spinner` | Loading indicator | — |

### `NumericInput` vs `InputGroup` — why different handlers?
```typescript
// NumericInput — Blueprint component, gives you the number directly
<NumericInput onValueChange={val => setState(val)} />

// InputGroup — wraps native HTML, gives you browser event
<InputGroup onChange={e => setState(e.target.value)} />
```
Blueprint-specific components use custom handlers. Native HTML wrappers use standard browser events.

### Button intents
```typescript
<Button intent="primary">Blue</Button>
<Button intent="success">Green</Button>
<Button intent="danger">Red</Button>
<Button intent="warning">Orange</Button>
<Button minimal>Subtle</Button>
```

---

## Component Structure

```
App.tsx           ← orchestrator, owns fetch + result state
├── MealForm.tsx  ← all inputs, owns form state, calls onSubmit
└── Results.tsx   ← display only, receives CalcResult as prop
```

Rule: keep display and input logic in separate components.
Results should never own state — it just renders what it receives.

---

## Patterns

### Chip / toggle selector
Used for protein selection — better UX than a text input for known options.

```typescript
const [selected, setSelected] = useState<string[]>(['chicken']);

const toggle = (item: string) => {
  setSelected(prev =>
    prev.includes(item)
      ? prev.length === 1 ? prev : prev.filter(i => i !== item)  // prevent empty
      : [...prev, item]
  );
};

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px',
  borderRadius: 99,
  border: active ? '1.5px solid #97C459' : '1px solid #d0d0d0',
  background: active ? '#EAF3DE' : 'transparent',
  color: active ? '#3B6D11' : '#666',
  cursor: 'pointer',
  userSelect: 'none',
});

<span style={chipStyle(selected.includes(item))} onClick={() => toggle(item)}>
  {item}
</span>
```

### Copy to clipboard button
```typescript
const [copied, setCopied] = useState(false);

const handleCopy = () => {
  navigator.clipboard.writeText(textToCopy).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);  // resets after 2s
  });
};

<Button minimal small intent={copied ? 'success' : 'none'} onClick={handleCopy}>
  {copied ? '✓ Copied' : 'Copy'}
</Button>
```

### Conditional row styling
Highlight a specific row differently without adding extra components:
```typescript
{Object.entries(data).map(([key, val]) => (
  <div key={key}>
    <span>{key}</span>
    {key === 'total' ? (
      <span style={{ background: '#EAF3DE', color: '#3B6D11', borderRadius: 99, padding: '2px 10px' }}>
        {val}
      </span>
    ) : (
      <span>{val}</span>
    )}
  </div>
))}
```

### Reusable style objects
Define styles as constants outside the component to avoid rewriting them:
```typescript
const card: React.CSSProperties = {
  background: 'white',
  border: '0.5px solid #e8e8e8',
  borderRadius: 12,
  padding: '16px 20px',
  marginBottom: 12,
};

// use as:
<div style={card}>...</div>

// extend with spread:
<div style={{ ...card, marginBottom: 0 }}>...</div>
```

---

## Layout Patterns

### Two column grid
```typescript
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
  <div>left</div>
  <div>right</div>
</div>
```

### Key-value row (label left, value right)
```typescript
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid #f0f0f0' }}>
  <span style={{ fontSize: 13, color: '#555' }}>label</span>
  <span style={{ fontSize: 13, fontWeight: 500 }}>value</span>
</div>
```

### Metric card (big number)
```typescript
<div style={{ background: '#f7f7f5', borderRadius: 8, padding: '12px 14px' }}>
  <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>label</div>
  <div style={{ fontSize: 22, fontWeight: 500 }}>
    487 <span style={{ fontSize: 13, color: '#999', fontWeight: 400 }}>kcal</span>
  </div>
</div>
```

### Section card
```typescript
<div style={{ background: 'white', border: '0.5px solid #e8e8e8', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
  <div style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
    Section Title
  </div>
  {/* content */}
</div>
```

### Green pill tag (for highlighted values)
```typescript
<span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
  520g
</span>
```

---

## Loading State Pattern
Always track loading for any async operation:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  const data = await fetch(...).then(r => r.json());
  setResult(data);
  setLoading(false);
};

{loading && <Spinner />}
{!loading && result && <Results data={result} />}
```

---

## Dev Notes
- Restart Flask after every backend change (`Ctrl+C` → `flask run --port 5001`)
- Frontend hot reloads automatically on save
- Check browser console (`Inspect → Console`) for fetch errors
- Fix display name issues (e.g. `mixed_veg` → `mixed veg`) in the backend with `.replace('_', ' ')`, not in the frontend