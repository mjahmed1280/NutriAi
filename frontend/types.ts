
export enum DietPreference {
  ANYTHING = 'Anything',
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  KETO = 'Keto',
  PALEO = 'Paleo',
  PESCATARIAN = 'Pescatarian',
  GLUTEN_FREE = 'Gluten-Free'
}

export enum FitnessGoal {
  WEIGHT_LOSS = 'Weight Loss',
  MUSCLE_GAIN = 'Muscle Gain',
  MAINTENANCE = 'Maintenance',
  ATHLETIC_PERFORMANCE = 'Athletic Performance'
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary',
  LIGHTLY_ACTIVE = 'Lightly Active',
  MODERATELY_ACTIVE = 'Moderately Active',
  VERY_ACTIVE = 'Very Active'
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  dietaryPreference: DietPreference;
  fitnessGoal: FitnessGoal;
  allergies: string[];
  medicalConditions: string[];
  isCompleted: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestions?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
