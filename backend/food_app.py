from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

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


@app.route('/api/calculate', methods=['POST']) 
def calculate():
    data = request.get_json()
    result = calculate_prep(data)
    return jsonify(result)

@app.route('/')
def index():
    return jsonify({"status": "healthy"})


def calculate_prep(data):
    daily_calories = int(data['dailyCalories'])
    daily_protein = int(data['dailyProtein'])
    servings = int(data['servings'])

    proteins = data.get('proteins', ['chicken'])
    carb_type = data['carbType']
    veggie_type = data.get('veggieType', 'none')
    veggie_display_name = veggie_type.replace('_', ' ')

    # Meal split
    breakfast_protein = 20
    breakfast_calories = 400
    lunch_dinner_protein = (daily_protein - breakfast_protein) / 2
    lunch_dinner_calories = (daily_calories - breakfast_calories) / 2

    print(lunch_dinner_protein)
    # Protein share logic
    if set(proteins) == {'chicken', 'egg'}:
        protein_shares = {'chicken': 0.7, 'egg': 0.3}
    else:
        protein_shares = {p: 1.0 for p in proteins}

    protein_breakdown = {}
    protein_totals = {}
    total_protein_cals = 0

    for p_type in proteins:
        protein = CHEAT_SHEET['proteins'][p_type]
        target = lunch_dinner_protein * protein_shares[p_type]
        scale = target / protein['protein_grams']

        scaled_cals = protein['calories'] * scale
        scaled_raw = protein['raw_grams'] * scale
        scaled_protein = protein['protein_grams'] * scale

        total_protein_cals += scaled_cals

        protein_breakdown[p_type] = f"{round(scaled_cals)} kcal, {round(scaled_protein)}g protein"
        protein_totals[p_type] = round(scaled_raw * servings)

    carb = CHEAT_SHEET['carbs'][carb_type]
    veggie = CHEAT_SHEET['veggies'][veggie_type]

    # Calorie distribution — protein first, then veggies, carbs fill the rest
    remaining_cals = lunch_dinner_calories - total_protein_cals
    veggie_cals = remaining_cals * 0.20
    carb_cals = remaining_cals - veggie_cals
    subtotal_cals = total_protein_cals + veggie_cals + carb_cals

    # Calculate grams from calorie targets
    if veggie_type == 'none':
        total_veggie_grams = 0
        carb_cals = remaining_cals  # give all remaining to carbs if no veggie
    else:
        total_veggie_grams = round(veggie_cals * (veggie['raw_grams'] / veggie['calories']) * servings)

    if 'raw_grams' in carb:
        total_carb_grams = round(carb_cals * (carb['raw_grams'] / carb['calories']) * servings)
        carb_display = f"{total_carb_grams}g dry"
    else:
        # count-based carbs (roti, wraps, bread) — find closest count
        cals_per_unit = carb['calories'] / carb['count']
        units_per_meal = round(carb_cals / cals_per_unit)
        total_carb_grams = units_per_meal * servings
        carb_display = f"{total_carb_grams} pieces"

    # Shopping list
    shopping_list = {}
    for p_type, total_grams in protein_totals.items():
        if CHEAT_SHEET['proteins'][p_type].get('unit') == 'count':
            egg_count = round(total_grams / CHEAT_SHEET['proteins'][p_type]['raw_grams'])
            shopping_list[p_type] = f"{egg_count} eggs"
        else:
            shopping_list[f"{p_type} (raw)"] = f"{total_grams}g"

    shopping_list.update({
        carb_type: carb_display,
        veggie_display_name: f"{total_veggie_grams}g",
    })

    # Portion weight
    no_cook_proteins = {'egg', 'cottage_cheese'}
    cooked_protein_grams = sum(
        protein_totals[p] * (1.0 if p in no_cook_proteins else 0.75)
        for p in proteins
    )
    portion_weight = round(
        (cooked_protein_grams + total_carb_grams * 2.5 + total_veggie_grams) / servings
    )

    # Per box
    per_box = {}
    for p_type in proteins:
        raw_per_serving = protein_totals[p_type] / servings
        yield_factor = 1.0 if p_type in no_cook_proteins else 0.75
        if CHEAT_SHEET['proteins'][p_type].get('unit') == 'count':
            count_per_box = round(raw_per_serving / CHEAT_SHEET['proteins'][p_type]['raw_grams'])
            cooked_grams = round(raw_per_serving * yield_factor)
            per_box[p_type] = f"{count_per_box} eggs ({cooked_grams}g)"
        else:
            per_box[p_type] = f"{round(raw_per_serving * yield_factor)}g cooked"

    if 'raw_grams' in carb:
        per_box[carb_type] = f"{round((total_carb_grams / servings) * 2.5)}g cooked"
    else:
        per_box[carb_type] = f"{round(total_carb_grams / servings)} pieces"

    per_box[veggie_display_name] = f"{round(total_veggie_grams / servings)}g"

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
                carb_type: f"{round(carb_cals)} kcal",
                veggie_display_name: f"{round(veggie_cals)} kcal ({round(total_veggie_grams / servings)}g)",
                'subtotal': f"{round(subtotal_cals)} kcal",
                'total': f"{round(subtotal_cals)} kcal"
            }
        },
        'shopping_list': shopping_list,
        'per_box': per_box,
        'portion_weight': f"{portion_weight}g per box",
        'servings': servings,
        'breakfast_note': "Breakfast: 400kcal/20g protein (eggs + yogurt/toast)"
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)
