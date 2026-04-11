import { useEffect } from 'react';

function App() {

  useEffect(() => {
    fetch('http://127.0.0.1:5001', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proteins: ['chicken', 'egg'],
        carbType: 'rice',
        veggieType: 'broccoli',
        servings: 3,
        dailyCalories: 1600,
        dailyProtein: 60
      })
    })
      .then(res => res.json())
      .then(data => console.log(data));   // ← open browser console to see this
  }, []);

  return <div>Hello</div>;
}

export default App;
