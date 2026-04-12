# React/TS + Flask Integration Reference

## Architecture

```
Browser (React :3000)  →  HTTP fetch  →  Flask API (:5001)
```

* These are two separate processes. 
* React is a client that sends HTTP requests to Flask. React talks to Flask over HTTP using the browser's built-in fetch API.
* Flask doesn't care it's React — it just returns JSON.

---

## Project Structure

```
app-name/
├── backend/
│   └── app.py
└── frontend/
    └── src/
        ├── types.ts        ← data shape definitions
        ├── App.tsx         ← orchestrator, owns fetch + state
        ├── MealForm.tsx    ← inputs, owns form state
        └── Results.tsx     ← stores the output
```

---

## Flask Setup

Two requirements to make Flask work as an API for a separate frontend:

### 1. CORS
Browsers block requests between different origins by default (`:3000` → `:5001`).
```bash
pip install flask-cors
```
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app) 
```

### 2. JSON routes
```python
@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()      # read JSON body from React
    result = calculate_prep(data)
    return jsonify(result)         # send JSON back
```

### (Optional) Can be run on a different port 
If 5000 gives an issue (especially on Mac)
```bash
flask run --port 5001
```

---

## React/TS Core Concepts

### Components
Any function that returns JSX is a component.
```typescript
const Results = ({ data }: Props) => {
  return <div>...</div>;
};
```
When used in another component, the syntax looks like: `<Results data={result} />`.

React calls the function and drops its HTML into the page.

### useState — keeping values in JS, not the DOM
```typescript
const [dailyCalories, setDailyCalories] = useState(1600);
```
- `dailyCalories` — the variable name
- `setDailyCalories` — function to update it
- `1600` — defualt or initial value

This replaces the need to read from the DOM with `getElementById` and keeps values in state.

### onChange — syncing input with state
```typescript
<input
  value={dailyCalories}
  onChange={e => setDailyCalories(Number(e.target.value))}
/>
```
FLow of above code snippet:

User types something → `onChange` fires → state of the dailyCalories variable updates → input re-renders. The value is taken from the element (ie, e.target.value).

### Props — passing data between components
```typescript
interface Props {
  data: CalcResult;        // data passed in
  onSubmit: () => void;    // function passed in (callback)
}

const Results = ({ data }: Props) => { ... }
```
Think of props like function parameters: `def results(data: CalcResult)`

### Data flow rule in React
- **Data flows down** — parent passes data to child via props
- **Events flow up** — child calls a function the parent passed in

TODO: add diagram here
```
                App (owns state + fetch)
  ↓ passes onSubmit function      ↑ MealForm calls it with    inputs
              MealForm (owns form state)
  
App (owns state + fetch)
  ↓ passes result data
  Results (display only)
```

### Conditional rendering
```typescript
{result && <Results data={result} />}
```
Only renders `Results` if `result` is not null. Before submit = nothing. After = results appear.

---

## TypeScript Essentials

### Interfaces — describing data shapes
```typescript
export interface CalcResult {
  shopping_list: Record<string, string>;  // dynamic keys
  per_meal: {
    targetCalories: number;               // fixed keys
    targetProtein: number;
  };
}
```
- Use `Record<string, string>` when keys are dynamic (e.g. depend on user input)
- Use specific interfaces when keys are always known

### Typing useState
```typescript
const [result, setResult] = useState<CalcResult | null>(null);
```
`| null` means "this is either a CalcResult or nothing yet"

### Why is a separate file `types.ts` needed?
Multiple components need the same types. Centralizing = one source of truth.

---

## The Fetch Pattern

```typescript
const handleSubmit = async (inputs: FormInputs) => {
  const response = await fetch('http://127.0.0.1:5001/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)   // JS object → JSON string
  });
  const data: CalcResult = await response.json();  // JSON string → JS object
  setResult(data);                 // store result → triggers re-render
};
```

This pattern — `fetch → await → setState` — is the core of every frontend/backend integration.

---

## Full Data Flow

```
User fills form
  → clicks Calculate
    → MealForm calls onSubmit(inputs)
      → App's handleSubmit fires
        → fetch POSTs inputs to Flask
          → Flask runs calculate_prep()
            → Flask returns JSON
              → setResult stores it
                → Results renders with data
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| CORS blocked | Flask not allowing cross-origin | Add `CORS(app)`, restart Flask |
| `localhost` vs `127.0.0.1` mismatch | Browser treats them as different origins | Match fetch URL exactly to what Flask terminal shows |
| Port 5000 access denied (Mac) | AirPlay Receiver owns port 5000 | `flask run --port 5001` |
| Changes not reflecting | Flask needs manual restart | Ctrl+C → `flask run` again |

---

## Dev Workflow

```bash
# Terminal 1 — backend
cd backend
flask run --port 5001

# Terminal 2 — frontend
cd frontend
npm start
```
