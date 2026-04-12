import { useState } from 'react';
import { FormGroup, NumericInput, HTMLSelect, Button } from '@blueprintjs/core';
import { FormInputs } from './types';

interface Props {
  onSubmit: (inputs: FormInputs) => void;
}

const PROTEINS = ['chicken', 'turkey', 'shrimp', 'tofu', 'egg', 'cottage_cheese', 'chickpeas'];
const PROTEIN_LABELS: Record<string, string> = {
  chicken: 'Chicken',
  turkey: 'Turkey',
  shrimp: 'Shrimp',
  tofu: 'Tofu',
  egg: 'Egg',
  cottage_cheese: 'Cottage Cheese',
  chickpeas: 'Chickpeas',
};

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px',
  borderRadius: 99,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  border: active ? '1.5px solid #97C459' : '1px solid #d0d0d0',
  background: active ? '#EAF3DE' : 'transparent',
  color: active ? '#3B6D11' : '#666',
  transition: 'all 0.15s ease',
  userSelect: 'none',
});

const MealForm = ({ onSubmit }: Props) => {
  const [dailyCalories, setDailyCalories] = useState(1600);
  const [dailyProtein, setDailyProtein] = useState(60);
  const [servings, setServings] = useState(4);
  const [selectedProteins, setSelectedProteins] = useState<string[]>(['chicken']);
  const [carbType, setCarbType] = useState('rice');
  const [veggieType, setVeggieType] = useState('mixed_veg');

  const toggleProtein = (protein: string) => {
    setSelectedProteins(prev =>
      prev.includes(protein)
        ? prev.length === 1 ? prev : prev.filter(p => p !== protein)
        : [...prev, protein]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      dailyCalories,
      dailyProtein,
      servings,
      proteins: selectedProteins,
      carbType,
      veggieType,
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: '36px auto', padding: '0 20px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingBottom: 16, borderBottom: '0.5px solid #e0e0e0' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥗</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>PrepScale</div>
          <div style={{ fontSize: 13, color: '#888' }}>meal prep calculator</div>
        </div>
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e8e8e8', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Targets</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <FormGroup label="Daily calories" style={{ margin: 0 }}>
            <NumericInput fill value={dailyCalories} onValueChange={val => setDailyCalories(val)} min={0} />
          </FormGroup>
          <FormGroup label="Daily protein (g)" style={{ margin: 0 }}>
            <NumericInput fill value={dailyProtein} onValueChange={val => setDailyProtein(val)} min={0} />
          </FormGroup>
        </div>
        <FormGroup label="Servings to prep" style={{ margin: 0 }}>
          <NumericInput fill value={servings} onValueChange={val => setServings(val)} min={1} />
        </FormGroup>
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e8e8e8', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Protein</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PROTEINS.map(p => (
            <span
              key={p}
              style={chipStyle(selectedProteins.includes(p))}
              onClick={() => toggleProtein(p)}
            >
              {PROTEIN_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', border: '0.5px solid #e8e8e8', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Carb & Veggie</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Carb" style={{ margin: 0 }}>
            <HTMLSelect fill value={carbType} onChange={e => setCarbType(e.target.value)} options={[
              { value: 'rice', label: 'Rice' },
              { value: 'pasta', label: 'Pasta' },
              { value: 'roti', label: 'Roti' },
              { value: 'wraps', label: 'Wraps' },
              { value: 'bread', label: 'Bread' },
            ]} />
          </FormGroup>
          <FormGroup label="Veggie" style={{ margin: 0 }}>
            <HTMLSelect fill value={veggieType} onChange={e => setVeggieType(e.target.value)} options={[
              { value: 'mixed_veg', label: 'Mixed Veg' },
              { value: 'broccoli', label: 'Broccoli' },
              { value: 'spinach', label: 'Spinach' },
              { value: 'none', label: 'None' },
            ]} />
          </FormGroup>
        </div>
      </div>

      <Button intent="success" fill large onClick={handleSubmit}>
        Calculate →
      </Button>

    </div>
  );
};

export default MealForm;