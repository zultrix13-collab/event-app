export interface StepLog {
  id: string;
  user_id: string;
  steps: number;
  date: string;
  co2_saved_grams: number;
  source: 'healthkit' | 'health_connect' | 'manual';
}

export interface Badge {
  id: string;
  name: string;
  name_en: string | null;
  icon: string;
  requirement_steps: number;
  badge_type: string;
  description: string | null;
  description_en?: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  country: string | null;
  organization: string | null;
  total_steps: number;
  total_co2_saved: number;
  badge_count: number;
}

export interface UserStepStats {
  todaySteps: number;
  totalSteps: number;
  totalCo2Grams: number;
  badges: Badge[];
  rank?: number;
}
