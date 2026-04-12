import { CalcResult } from './types';

interface Props {
  data: CalcResult;
}

const Results = ({ data }: Props) => {
  return (
    <div>
      <h2>Per Meal</h2>
      <p>Target: {data.per_meal.targetCalories} kcal, {data.per_meal.targetProtein}g protein</p>

      <h2>Breakdown</h2>
      {Object.entries(data.per_meal.breakdown).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}

      <h2>Shopping List ({data.servings} servings)</h2>
      {Object.entries(data.shopping_list).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}

      <h2>Per Box</h2>
      {Object.entries(data.per_box).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}

      <h2>Portion Weight</h2>
      <p>{data.portion_weight}</p>

      <h2>Daily Split</h2>
      <p>Breakfast: {data.daily_split.breakfast}</p>
      <p>Lunch/Dinner: {data.daily_split.lunch_dinner}</p>

      <p>{data.breakfast_note}</p>
    </div>
  );
};

export default Results;