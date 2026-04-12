import { Card, Tag, Divider } from '@blueprintjs/core';
import { CalcResult } from './types';

interface Props {
  data: CalcResult;
}

const Results = ({ data }: Props) => {
  return (
    <div style={{ maxWidth: 480, margin: '24px auto', padding: '0 20px' }}>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Daily Split</h3>
        <p><strong>Breakfast:</strong> {data.daily_split.breakfast}</p>
        <p><strong>Lunch/Dinner:</strong> {data.daily_split.lunch_dinner}</p>
        <p style={{ color: '#888', fontSize: 13 }}>{data.breakfast_note}</p>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>
          Per Meal — {data.per_meal.targetCalories} kcal / {data.per_meal.targetProtein}g protein
        </h3>
        <Divider />
        {Object.entries(data.per_meal.breakdown).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: '#555' }}>{key}</span>
            <Tag minimal>{value}</Tag>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Shopping List — {data.servings} servings</h3>
        <Divider />
        {Object.entries(data.shopping_list).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: '#555' }}>{key}</span>
            <Tag intent="primary" minimal>{value}</Tag>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Per Box</h3>
        <Divider />
        {Object.entries(data.per_box).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: '#555' }}>{key}</span>
            <Tag minimal>{value}</Tag>
          </div>
        ))}
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
          <strong>Portion Weight</strong>
          <Tag intent="success" minimal>{data.portion_weight}</Tag>
        </div>
      </Card>

    </div>
  );
};

export default Results;