import { useState } from 'react';
import MealForm from '../../frontend/src/MealForm';
import Results from '../../frontend/src/Results';
import { FormInputs, CalcResult } from './types';

function App() {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (inputs: FormInputs) => {
    setLoading(true);
    const response = await fetch('http://127.0.0.1:5000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    const data: CalcResult = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <MealForm onSubmit={handleSubmit} />
      {loading && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
         <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mt-6" />
        </div>
      )}
      {!loading && result && <Results data={result} />}
    </div>
  );
}

export default App;