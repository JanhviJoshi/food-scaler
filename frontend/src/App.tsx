import { useState } from 'react';
import MealForm from './MealForm';
import Results from './Results';
import { FormInputs, CalcResult } from './types';

function App() {
  const [result, setResult] = useState<CalcResult | null>(null);

  const handleSubmit = async (inputs: FormInputs) => {
    const response = await fetch('http://127.0.0.1:5001/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    const data: CalcResult = await response.json();
    setResult(data);
  };

  return (
    <div>
      <h1>PrepScale</h1>
      <MealForm onSubmit={handleSubmit} />
      {result && <Results data={result} />}
    </div>
  );
}

export default App;