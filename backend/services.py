from constants import CHEAT_SHEET

BREAKFAST_CALORIES = 400
BREAKFAST_PROTEIN = 20

def calculate_meal_split(daily_calories: int, daily_protein: int) -> dict:
    """Splits daily targets into breakfast and lunch/dinner targets."""
    return {
        'lunch_dinner_calories': (daily_calories - BREAKFAST_CALORIES) / 2,
        'lunch_dinner_protein': (daily_protein - BREAKFAST_PROTEIN) / 2,
        'breakfast_calories': BREAKFAST_CALORIES,
        'breakfast_protein': BREAKFAST_PROTEIN,
    }

def calculate_protein_portions(proteins: list, lunch_dinner_protein: float, servings: int) -> dict:
    """Calculates protein portions, calories and raw grams needed."""
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

    return {
        'breakdown': protein_breakdown,
        'totals': protein_totals,
        'total_cals': total_protein_cals,
    }

def calculate_shopping_list(protein_totals: dict, carb_type: str, carb_display: str, 
                             veggie_display_name: str, total_veggie_grams: int) -> dict:
    """Builds the shopping list from calculated portions."""
    shopping_list = {}

    for p_type, total_grams in protein_totals.items():
        protein = CHEAT_SHEET['proteins'][p_type]
        if protein.get('unit') == 'count':
            count = round(total_grams / protein['raw_grams'])
            shopping_list[p_type] = f"{count} eggs"
        else:
            shopping_list[f"{p_type} (raw)"] = f"{total_grams}g"

    shopping_list.update({
        carb_type: carb_display,
        veggie_display_name: f"{total_veggie_grams}g",
    })

    return shopping_list


def calculate_per_box(proteins: list, protein_totals: dict, servings: int,
                      carb_type: str, carb: dict, total_carb_grams: int,
                      veggie_display_name: str, total_veggie_grams: int) -> dict:
    """Builds the per box breakdown."""
    no_cook_proteins = {'egg', 'cottage_cheese'}
    per_box = {}

    for p_type in proteins:
        raw_per_serving = protein_totals[p_type] / servings
        yield_factor = 1.0 if p_type in no_cook_proteins else 0.75
        protein = CHEAT_SHEET['proteins'][p_type]
        if protein.get('unit') == 'count':
            count_per_box = round(raw_per_serving / protein['raw_grams'])
            cooked_grams = round(raw_per_serving * yield_factor)
            per_box[p_type] = f"{count_per_box} eggs ({cooked_grams}g)"
        else:
            per_box[p_type] = f"{round(raw_per_serving * yield_factor)}g cooked"

    if 'raw_grams' in carb:
        per_box[carb_type] = f"{round((total_carb_grams / servings) * 3)}g cooked"
    else:
        per_box[carb_type] = f"{round(total_carb_grams / servings)} pieces"

    per_box[veggie_display_name] = f"{round(total_veggie_grams / servings)}g"

    return per_box


from utils import grams_from_calories

def calculate_prep(data: dict) -> dict:
    daily_calories = int(data['dailyCalories'])
    daily_protein = int(data['dailyProtein'])
    servings = int(data['servings'])
    proteins = data.get('proteins', ['chicken'])
    carb_type = data['carbType']
    veggie_type = data.get('veggieType', 'none')
    veggie_display_name = veggie_type.replace('_', ' ')

    # Meal split
    meal_split = calculate_meal_split(daily_calories, daily_protein)
    lunch_dinner_calories = meal_split['lunch_dinner_calories']
    lunch_dinner_protein = meal_split['lunch_dinner_protein']

    # Protein portions
    protein_result = calculate_protein_portions(proteins, lunch_dinner_protein, servings)
    protein_breakdown = protein_result['breakdown']
    protein_totals = protein_result['totals']
    total_protein_cals = protein_result['total_cals']

    # Calorie distribution
    carb = CHEAT_SHEET['carbs'][carb_type]
    veggie = CHEAT_SHEET['veggies'][veggie_type]

    remaining_cals = lunch_dinner_calories - total_protein_cals
    veggie_cals = remaining_cals * 0.20 if veggie_type != 'none' else 0
    carb_cals = remaining_cals - veggie_cals

    # Grams from calories
    total_veggie_grams = round(grams_from_calories(veggie_cals, veggie['raw_grams'], veggie['calories']) * servings)

    if 'raw_grams' in carb:
        total_carb_grams = round(grams_from_calories(carb_cals, carb['raw_grams'], carb['calories']) * servings)
        carb_display = f"{total_carb_grams}g dry"
    else:
        cals_per_unit = carb['calories'] / carb['count']
        units_per_meal = round(carb_cals / cals_per_unit)
        total_carb_grams = units_per_meal * servings
        carb_display = f"{total_carb_grams} pieces"

    # Shopping list
    shopping_list = calculate_shopping_list(
        protein_totals, carb_type, carb_display, veggie_display_name, total_veggie_grams
    )

    # Per box
    per_box = calculate_per_box(
        proteins, protein_totals, servings, carb_type, carb,
        total_carb_grams, veggie_display_name, total_veggie_grams
    )

    # Portion weight
    no_cook_proteins = {'egg', 'cottage_cheese'}
    cooked_protein_grams = sum(
        protein_totals[p] * (1.0 if p in no_cook_proteins else 0.75)
        for p in proteins
    )
    portion_weight = round(
        (cooked_protein_grams + total_carb_grams * 2.5 + total_veggie_grams) / servings
    )

    subtotal_cals = total_protein_cals + veggie_cals + carb_cals

    return {
        'daily_split': {
            'breakfast': f"{BREAKFAST_CALORIES} kcal, {BREAKFAST_PROTEIN}g protein",
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