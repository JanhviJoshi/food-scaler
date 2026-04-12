import { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { CalcResult } from './types';

interface Props {
  data: CalcResult;
}

const card: React.CSSProperties = {
  background: 'white',
  border: '0.5px solid #e8e8e8',
  borderRadius: 12,
  padding: '16px 20px',
  marginBottom: 12,
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 14,
};

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '0.5px solid #f0f0f0',
};

const label: React.CSSProperties = {
  fontSize: 13,
  color: '#555',
};

const value: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#222',
};

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
    <div style={{ maxWidth: 500, margin: '0 auto 40px', padding: '0 20px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: '#f7f7f5', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>calories target per meal</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{data.per_meal.targetCalories} <span style={{ fontSize: 13, color: '#999', fontWeight: 400 }}>kcal</span></div>
        </div>
        <div style={{ background: '#f7f7f5', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>protein per meal</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{data.per_meal.targetProtein} <span style={{ fontSize: 13, color: '#999', fontWeight: 400 }}>g</span></div>
        </div>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Breakdown Per Meal</div>
        {Object.entries(data.per_meal.breakdown).map(([key, val]) => (
          <div key={key} style={row}>
            <span style={label}>{key}</span>
            {key === 'total' ? (
      <span style={{ ...value, background: '#EAF3DE', color: '#3B6D11', padding: '2px 10px', borderRadius: 99, fontSize: 12 }}>{val}</span>
    ) : (
            <span style={value}>{val}</span>
    )}
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={sectionLabel as React.CSSProperties}>Shopping list — {data.servings} servings</div>
          <Button
            small
            minimal
            intent={copied ? 'success' : 'none'}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
        <pre style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 2, margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>
          {shoppingText}
        </pre>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Per box</div>
        {Object.entries(data.per_box).map(([key, val]) => (
          <div key={key} style={row}>
            <span style={label}>{key}</span>
            <span style={value}>{val}</span>
          </div>
        ))}
        <div style={{ ...row, borderBottom: 'none', paddingTop: 10 }}>
          <span style={{ ...label, fontWeight: 500, color: '#222' }}>Portion weight</span>
          <span style={{ ...value, background: '#EAF3DE', color: '#3B6D11', padding: '2px 10px', borderRadius: 99, fontSize: 12 }}>{data.portion_weight}</span>
        </div>
      </div>

      <div style={card}>
        <div style={sectionLabel}>Daily split</div>
        <div style={row}>
          <span style={label}>Breakfast</span>
          <span style={value}>{data.daily_split.breakfast}</span>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={label}>Lunch / Dinner</span>
          <span style={value}>{data.daily_split.lunch_dinner}</span>
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>{data.breakfast_note}</div>
      </div>

    </div>
  );
};

export default Results;