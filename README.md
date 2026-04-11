# Flask + React Integration Notes

## Connecting Frontend and Backend with `fetch`

React talks to Flask over HTTP using the browser's built-in `fetch` API.
The frontend runs on one port (e.g. `:3000`) and the backend on another (e.g. `:5001`).
They are completely separate processes — React just sends HTTP requests to Flask like any client would.

### Basic Pattern

```typescript
useEffect(() => {
  fetch('http://127.0.0.1:5001/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proteins: ['chicken', 'eggs'],
      carbs: ['rice'],
      vegetables: ['broccoli'],
      servings: 3
    })
  })
    .then(res => res.json())
    .then(data => console.log(data));
}, []);
```

- `useEffect` with `[]` runs once on component load — good for initial data fetching
- `body: JSON.stringify(...)` serializes your JS object into JSON for Flask to read
- `.then(res => res.json())` parses the JSON response from Flask
- Once confirmed working (visible in browser console), replace `console.log(data)` with `setResults(data)` to drive the UI

### Flask Side

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    # do your logic here
    return jsonify({ "result": [] })
```

---

## Errors Encountered

### 1. CORS Error
**Error:**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000'
has been blocked by CORS policy
```
**Cause:** Browsers block requests between different origins by default.
Flask needs to explicitly allow cross-origin requests.

**Fix:**
```bash
pip install flask-cors
```
```python
from flask_cors import CORS
CORS(app)  # add this right after creating the app
```
Then restart Flask — changes don't take effect until you do.

---

### 2. `localhost` vs `127.0.0.1` Mismatch
**Cause:** Even though they resolve to the same IP, the browser treats
`localhost` and `127.0.0.1` as different origins. If Flask is running on
`127.0.0.1:5000`, fetching from `localhost:5000` can still trigger a CORS failure.

**Fix:** Match the fetch URL exactly to what Flask reports in the terminal:
```typescript
// use this
fetch('http://127.0.0.1:5001/api/calculate', ...

// not this
fetch('http://localhost:5001/api/calculate', ...
```

---

### 3. Port 5000 Access Denied (Mac)
**Cause:** On macOS, port 5000 is reserved by **AirPlay Receiver** by default.
Running `flask run` on port 5000 results in an access denied error.

**Fix (Option A):** Disable AirPlay Receiver:
> System Settings → General → AirDrop & Handoff → AirPlay Receiver → Off

**Fix (Option B):** Run Flask on a different port:
```bash
flask run --port 5001
```
Then update your fetch URL to match.