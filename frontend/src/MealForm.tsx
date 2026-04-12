import { useState } from 'react';
import { FormInputs } from './types';

interface Props {
  onSubmit: (inputs: FormInputs) => void;
}

const MealForm = ({ onSubmit }: Props) => {
  const [dailyCalories, setDailyCalories] = useState(1600); //  have a variable called dailyCalories, its starting value is 1600, and setDailyCalories is the function I call to change it.
  const [dailyProtein, setDailyProtein] = useState(60);
  const [servings, setServings] = useState(4);
  const [proteins, setProteins] = useState('chicken');
  const [carbType, setCarbType] = useState('rice');
  const [veggieType, setVeggieType] = useState('mixed_veg');

  const handleSubmit = () => {
    onSubmit({
      dailyCalories,
      dailyProtein,
      servings,
      proteins: proteins.split(',').map(p => p.trim()),
      carbType,
      veggieType,
    });
  };

  return (
    <div>
      <label>Daily Calories</label>
      <input type="number" value={dailyCalories} onChange={e => setDailyCalories(Number(e.target.value))} 
      // So the flow is: user types → onChange fires → state updates → input re-renders with new value. 
      />

      <label>Daily Protein (g)</label>
      <input type="number" value={dailyProtein} onChange={e => setDailyProtein(Number(e.target.value))} />

      <label>Servings to Prep</label>
      <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} />

      <label>Proteins (comma separated)</label>
      <input type="text" value={proteins} onChange={e => setProteins(e.target.value)} />

      <label>Carb</label>
      <select value={carbType} onChange={e => setCarbType(e.target.value)}>
        <option value="rice">Rice</option>
        <option value="pasta">Pasta</option>
        <option value="roti">Roti</option>
        <option value="wraps">Wraps</option>
        <option value="bread">Bread</option>
      </select>

      <label>Veggie</label>
      <select value={veggieType} onChange={e => setVeggieType(e.target.value)}>
        <option value="mixed_veg">Mixed Veg</option>
        <option value="broccoli">Broccoli</option>
        <option value="spinach">Spinach</option>
        <option value="none">None</option>
      </select>

      <button onClick={handleSubmit}>Calculate →</button>
    </div>
  );
};

export default MealForm;