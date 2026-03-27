export type UserRole = 'super_admin' | 'specialist' | 'vip' | 'participant';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  organization: string | null;
  avatar_url: string | null;
  is_approved: boolean;
  is_active: boolean;
}

export interface VipApplication {
  full_name: string;
  email: string;
  organization?: string;
  position?: string;
  reason?: string;
}
