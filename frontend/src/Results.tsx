import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalcResult } from './types';

interface Props {
  data: CalcResult;
}

const Results = ({ data }: Props) => {
  const [copied, setCopied] = useState(false);

  const shoppingText = Object.entries(data.shopping_list)
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(shoppingText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-12 space-y-4">

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">per meal target</div>
          <div className="text-2xl font-medium">{data.per_meal.targetCalories} <span className="text-sm text-slate-400 font-normal">kcal</span></div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">protein per meal</div>
          <div className="text-2xl font-medium">{data.per_meal.targetProtein} <span className="text-sm text-slate-400 font-normal">g</span></div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Daily Split</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-sm text-slate-500">Breakfast</span>
            <span className="text-sm font-medium">{data.daily_split.breakfast}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-slate-500">Lunch / Dinner</span>
            <span className="text-sm font-medium">{data.daily_split.lunch_dinner}</span>
          </div>
          <p className="text-xs text-slate-300 pt-1">{data.breakfast_note}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {Object.entries(data.per_meal.breakdown).map(([key, val]) => (
            <div key={key} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-500">{key}</span>
              {key === 'total' ? (
                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{val}</span>
              ) : (
                <span className="text-sm font-medium">{val}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Shopping List — {data.servings} servings</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-7">
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-slate-700 leading-7 whitespace-pre-wrap font-sans">
            {shoppingText}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-400 font-medium">Per Box</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {Object.entries(data.per_box).map(([key, val]) => (
            <div key={key} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-500">{key}</span>
              <span className="text-sm font-medium">{val}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <span className="text-sm font-medium">Portion Weight</span>
            <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{data.portion_weight}</span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Results;