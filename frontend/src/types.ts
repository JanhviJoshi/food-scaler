export interface FormInputs {
    dailyCalories: number;
    dailyProtein: number;
    servings: number;
    proteins: string[];
    carbType: string;
    veggieType: string;
  }
  
  export interface CalcResult {
    daily_split: {
      breakfast: string;
      lunch_dinner: string;
    };
    per_meal: {
      targetCalories: number;
      targetProtein: number;
      breakdown: Record<string, string>;
    };
    shopping_list: Record<string, string>;
    per_box: Record<string, string>;
    portion_weight: string;
    servings: number;
    breakfast_note: string;
  }