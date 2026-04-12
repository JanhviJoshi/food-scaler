import { useState } from 'react';
import { FormGroup, InputGroup, NumericInput, Button, HTMLSelect } from '@blueprintjs/core';
import { FormInputs } from './types';

interface Props {
  onSubmit: (inputs: FormInputs) => void;
}

const MealForm = ({ onSubmit }: Props) => {
  const [dailyCalories, setDailyCalories] = useState(1600);
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
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 24 }}>PrepScale</h2>

      <FormGroup label="Daily Calories">
        <NumericInput
          fill
          value={dailyCalories}
          onValueChange={val => setDailyCalories(val)}
          min={0}
        />
      </FormGroup>

      <FormGroup label="Daily Protein (g)">
        <NumericInput
          fill
          value={dailyProtein}
          onValueChange={val => setDailyProtein(val)}
          min={0}
        />
      </FormGroup>

      <FormGroup label="Servings to Prep">
        <NumericInput
          fill
          value={servings}
          onValueChange={val => setServings(val)}
          min={1}
        />
      </FormGroup>

      <FormGroup label="Proteins (comma separated)" helperText="e.g. chicken, egg">
        <InputGroup
          value={proteins}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProteins(e.target.value)}
        />

        {/* <HTMLSelect
          fill
          value={carbType}
          onChange={e => setCarbType(e.target.value)}
          options={[
            { value: 'rice', label: 'Rice' },
            { value: 'pasta', label: 'Pasta' },
            { value: 'roti', label: 'Roti' },
            { value: 'wraps', label: 'Wraps' },
            { value: 'bread', label: 'Bread' },
          ]}
        /> */}
      </FormGroup>

      <FormGroup label="Carb">
        <HTMLSelect
          fill
          value={carbType}
          onChange={e => setCarbType(e.target.value)}
          options={[
            { value: 'rice', label: 'Rice' },
            { value: 'pasta', label: 'Pasta' },
            { value: 'roti', label: 'Roti' },
            { value: 'wraps', label: 'Wraps' },
            { value: 'bread', label: 'Bread' },
          ]}
        />
      </FormGroup>

      <FormGroup label="Veggie">
        <HTMLSelect
          fill
          value={veggieType}
          onChange={e => setVeggieType(e.target.value)}
          options={[
            { value: 'mixed_veg', label: 'Mixed Veg' },
            { value: 'broccoli', label: 'Broccoli' },
            { value: 'spinach', label: 'Spinach' },
            { value: 'none', label: 'None' },
          ]}
        />
      </FormGroup>

      <Button intent="primary" fill onClick={handleSubmit}>
        Calculate
      </Button>
    </div>
  );
};

export default MealForm;