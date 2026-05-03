def grams_from_calories(target_cals: float, raw_grams: float, calories_per_serving: float) -> float:
    """Given a calorie target and a food's nutritional data, returns how many grams are needed."""
    if calories_per_serving == 0:
        return 0
    return target_cals * (raw_grams / calories_per_serving)