import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const MealForm = ({ onSubmit }: Props) => {
  const [dailyCalories, setDailyCalories] = useState(1400);
  const [dailyProtein, setDailyProtein] = useState(80);
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
    <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-lg">🥗</div>
        <div>
          <div className="font-medium">PrepScale</div>
          <div className="text-sm text-slate-500">meal prep calculator</div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Daily calories</label>
              <Input
                type="number"
                value={dailyCalories}
                onChange={e => setDailyCalories(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Daily protein (g)</label>
              <Input
                type="number"
                value={dailyProtein}
                onChange={e => setDailyProtein(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Servings to prep</label>
            <Input
              type="number"
              value={servings}
              onChange={e => setServings(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Protein</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PROTEINS.map(p => (
              <span
                key={p}
                onClick={() => toggleProtein(p)}
                className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all select-none border ${
                  selectedProteins.includes(p)
                    ? 'bg-green-50 text-green-700 border-green-400'
                    : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {PROTEIN_LABELS[p]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Carb & Veggie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Carb</label>
              <Select value={carbType} onValueChange={setCarbType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="pasta">Pasta</SelectItem>
                  <SelectItem value="roti">Roti</SelectItem>
                  <SelectItem value="wraps">Wraps</SelectItem>
                  <SelectItem value="bread">Bread</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Veggie</label>
              <Select value={veggieType} onValueChange={setVeggieType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed_veg">Mixed Veg</SelectItem>
                  <SelectItem value="broccoli">Broccoli</SelectItem>
                  <SelectItem value="spinach">Spinach</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmit}>
        Calculate →
      </Button>
    </div>
  );
};

export default MealForm;