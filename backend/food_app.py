from flask import Flask, render_template_string, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CHEAT_SHEET = {
    'proteins': {
        'chicken':        {'raw_grams': 130, 'protein_grams': 26, 'calories': 195},  # thighs
        'turkey':         {'raw_grams': 130, 'protein_grams': 30, 'calories': 182},
        'shrimp':         {'raw_grams': 150, 'protein_grams': 29, 'calories': 126},
        'tofu':           {'raw_grams': 260, 'protein_grams': 22, 'calories': 210},  # fixed protein
        'egg':            {'raw_grams': 1,   'protein_grams': 6,  'calories': 70},
        'cottage_cheese': {'raw_grams': 200, 'protein_grams': 23, 'calories': 173},
        'chickpeas':      {'raw_grams': 150, 'protein_grams': 11, 'calories': 180},  # fixed calories
    },
    'carbs': {
        'rice':  {'raw_grams': 65,  'unit': 'grams', 'carb_grams': 50, 'calories': 236},
        'pasta': {'raw_grams': 75,  'unit': 'grams', 'carb_grams': 54, 'calories': 268},
        'roti':  {'count': 3, 'unit': 'count', 'carb_grams': 45, 'calories': 240},
        'wraps': {'count': 2, 'unit': 'count', 'carb_grams': 50, 'calories': 260},
        'bread': {'count': 3, 'unit': 'count', 'carb_grams': 42, 'calories': 210},
    },
    'veggies': {
        'broccoli':  {'raw_grams': 150, 'calories': 51, 'carb_grams': 10},
        'spinach':   {'raw_grams': 150, 'calories': 35, 'carb_grams': 5},
        'mixed_veg': {'raw_grams': 150, 'calories': 50, 'carb_grams': 8},
        'none':      {'raw_grams': 0,   'calories': 0,  'carb_grams': 0},
    }
}


# @app.route('/api/calculate', methods=['POST'])  # New endpoint
# def calculate():
#     data = request.get_json()
#     result = calculate_prep(data)
#     return jsonify(result)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        data = request.json
        result = calculate_prep(data)
        return jsonify(result)
    
    # return render_template_string(HTML_TEMPLATE)
    return jsonify({"test": 1})


def calculate_prep(data):
    daily_calories = int(data['dailyCalories'])
    daily_protein = int(data['dailyProtein'])
    servings = int(data['servings'])

    proteins = data.get('proteins', ['chicken'])
    carb_type = data['carbType']
    veggie_type = data.get('veggieType', 'none')

    # Meal split
    breakfast_protein = 20
    breakfast_calories = 400
    lunch_dinner_protein = (daily_protein - breakfast_protein) / 2
    lunch_dinner_calories = (daily_calories - breakfast_calories) / 2

    # Protein share logic
    if set(proteins) == {'chicken', 'egg'}:
        protein_shares = {'chicken': 0.7, 'egg': 0.3}
    else:
    # Single protein — gets 100%
        protein_shares = {p: 1.0 for p in proteins}

    protein_breakdown = {}
    protein_totals = {}
    total_protein_cals = 0
    total_protein_grams_raw = 0

    for p_type in proteins:
        protein = CHEAT_SHEET['proteins'][p_type]
        target = lunch_dinner_protein * protein_shares[p_type]  
        scale = target / protein['protein_grams']

        scaled_cals = protein['calories'] * scale
        scaled_raw = protein['raw_grams'] * scale
        scaled_protein = protein['protein_grams'] * scale

        total_protein_cals += scaled_cals
        total_protein_grams_raw += scaled_raw

        protein_breakdown[p_type] = f"{round(scaled_cals)} kcal, {round(scaled_protein)}g protein"
        protein_totals[p_type] = round(scaled_raw * servings)

    carb = CHEAT_SHEET['carbs'][carb_type]
    veggie = CHEAT_SHEET['veggies'][veggie_type]

    carb_cals = carb['calories']
    veggie_cals = veggie['calories']
    subtotal_cals = total_protein_cals + carb_cals + veggie_cals

    gap_cals = max(0, lunch_dinner_calories - subtotal_cals)
    oil_grams_per_meal = round(gap_cals / 9)
    oil_grams_total = oil_grams_per_meal * servings

    if 'raw_grams' in carb:
        total_carb_grams = round(carb['raw_grams'] * servings)
        carb_display = f"{total_carb_grams}g dry"
    else:
        total_carb_grams = carb['count'] * servings
        carb_display = f"{total_carb_grams} pieces"

    total_veggie_grams = round(veggie['raw_grams'] * servings)

    shopping_list = {}
    for p_type, total_grams in protein_totals.items():
        shopping_list[f"{p_type} (raw)"] = f"{total_grams}g"
    shopping_list.update({
        carb_type: carb_display,
        veggie_type: f"{total_veggie_grams}g",
        'oil': f"{round(oil_grams_total / 14)} tbsp total"
    })

    # Portion weight: proteins shrink ~25% (skip for no-cook items), carbs expand
    no_cook_proteins = {'egg', 'cottage_cheese'}
    cooked_protein_grams = sum(
        (protein_totals[p] * (1.0 if p in no_cook_proteins else 0.75))
        for p in proteins
    )
    portion_weight = round(
        (cooked_protein_grams + total_carb_grams * 2.5 + total_veggie_grams + oil_grams_total) / servings
    )

    per_box = {}

    for p_type in proteins:
        raw_per_serving = protein_totals[p_type] / servings
        yield_factor = 1.0 if p_type in no_cook_proteins else 0.75
        per_box[p_type] = f"{round(raw_per_serving * yield_factor)}g cooked"

    if 'raw_grams' in carb:
        per_box[carb_type] = f"{round(carb['raw_grams'] * 2.5)}g cooked"  # dry expands
    else:
        per_box[carb_type] = f"{carb['count']} pieces"

    per_box[veggie_type] = f"{veggie['raw_grams']}g"
    per_box['oil'] = f"{oil_grams_per_meal}g (~{round(oil_grams_per_meal / 14)} tbsp)"

    return {
        'daily_split': {
            'breakfast': f"{breakfast_calories} kcal, {breakfast_protein}g protein",
            'lunch_dinner': f"{round(lunch_dinner_calories)} kcal, {round(lunch_dinner_protein)}g protein each"
        },
        'per_meal': {
            'targetCalories': round(lunch_dinner_calories),
            'targetProtein': round(lunch_dinner_protein),
            'breakdown': {
                **protein_breakdown,
                carb_type: f"{carb_cals} kcal",
                veggie_type: f"{veggie_cals} kcal ({veggie['raw_grams']}g)",
                'subtotal': f"{round(subtotal_cals)} kcal",
                'oilRecommended': f"{oil_grams_per_meal}g (~{round(oil_grams_per_meal / 14)} tbsp)",
                'total': f"{round(subtotal_cals + oil_grams_per_meal * 9)} kcal"
            }
        },
        'shopping_list': shopping_list,
        'per_box': per_box,
        'portion_weight': f"{portion_weight}g per box",
        'servings': servings,
        'breakfast_note': "Breakfast: 400kcal/20g protein (eggs + yogurt/toast)"
    }



HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>PrepScale</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #333; margin-bottom: 30px; }
        .input-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; color: #555; }
        input, select { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
        input:focus, select:focus { outline: none; border-color: #4CAF50; }
        button { width: 100%; padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; }
        button:hover { background: #45a049; }
        .result { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4CAF50; }
        .result-title { font-size: 18px; font-weight: bold; margin: 15px 0 8px 0; color: #333; }
        .list-item { margin: 8px 0; padding: 8px; background: white; border-radius: 6px; border-left: 3px solid #e9ecef; }
        .oil-rec { border-left-color: #4CAF50 !important; background: #e8f5e8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍚 PrepScale</h1>
        
        <form id="calcForm">
            <div class="input-group">
                <label>Daily Calories</label>
                <input type="number" id="dailyCalories" value="1600">
            </div>
            
            <div class="input-group">
                <label>Daily Protein (g, only counts protein from protein sources, doesnt account protein powder [~+10g])</label>
                <input type="number" id="dailyProtein" value="60">
            </div>
            
            <div class="input-group">
                <label>Meals/Day</label>
                <input type="number" id="mealsPerDay" value="3">
            </div>
            
            <div class="input-group">
                <label>Servings to Prep</label>
                <input type="number" id="servings" value="4">
            </div>
            
            <div style="display: flex; gap: 15px;">
                
                    <div class="input-group">
        <label>Proteins (comma separated)</label>
        <input type="text" id="proteins" value="chicken" placeholder="chicken,tofu">
    </div>
    
    <div class="input-group">
        <label>Veggie</label>
        <select id="veggieType">
            <option value="mixed_veg">Mixed veg</option>
            <option value="broccoli">Broccoli</option>
            <option value="spinach">Spinach</option>
            <option value="none">None</option>
        </select>
    </div>
                <div style="flex: 1;">
                    <label>Carb</label>
                    <select id="carbType">
                        <option value="rice">Rice</option>
                        <option value="pasta">Pasta</option>
                        <option value="roti">Roti</option>
                        <option value="wraps">Wraps</option>
                        <option value="bread">Bread (3 slices)</option>
                    </select>
                </div>
            </div>
            
            <button type="submit">CALCULATE →</button>
        </form>
        
        <div id="result" class="result" style="display: none;"></div>
    </div>

    <script>
        document.getElementById('calcForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
    dailyCalories: document.getElementById('dailyCalories').value,
    dailyProtein: document.getElementById('dailyProtein').value,
    servings: document.getElementById('servings').value,
    proteins: document.getElementById('proteins').value.split(',').map(p => p.trim()),
    carbType: document.getElementById('carbType').value,
    veggieType: document.getElementById('veggieType').value
};

            
            const response = await fetch('/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            displayResult(result);
        });
        
        function displayResult(result) {
            const resultDiv = document.getElementById('result');
            
            resultDiv.innerHTML = `
                <div class="result-title">Per Meal (${result.per_meal.targetCalories} kcal target):</div>
                <div class="list-item">Target: ${result.per_meal.targetCalories} kcal, ${result.per_meal.targetProtein}g protein</div>
                
                <div class="result-title">Breakdown:</div>
                ${Object.entries(result.per_meal.breakdown).map(([key, value]) => 
                    `<div class="list-item ${key === 'oilRecommended' ? 'oil-rec' : ''}">${key}: ${value}</div>`
                ).join('')}

                <div class="result-title">Daily Split:</div>
    <div class="list-item">${result.daily_split.breakfast}</div>
    <div class="list-item">${result.daily_split.lunch_dinner}</div>
    
    <div class="result-title">Lunch/Dinner Meal (${result.per_meal.targetCalories} kcal target):</div>
    <!-- rest unchanged -->
    
    <div class="result-title">Breakfast reminder:</div>
    <div class="list-item">${result.breakfast_note}</div>

                
                <div class="result-title">Shopping (${result.servings || 4} servings):</div>
                ${Object.entries(result.shopping_list).map(([key, value]) => 
                    `<div class="list-item">${key}: ${value}</div>`
                ).join('')}
                
                <div class="result-title">After cooking:</div>
                <div class="list-item">${result.portion_weight}</div>
                <div class="list-item">${result.per_box}</div>
            `;
            
            resultDiv.style.display = 'block';
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }
    </script>
</body>
</html>
'''

if __name__ == '__main__':
    app.run(debug=True, port=5000)
