export interface EventSession {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  session_type: 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other';
  venue_id: string | null;
  venue?: Venue;
  speakers?: Speaker[];
  starts_at: string;
  ends_at: string;
  capacity: number;
  registered_count: number;
  is_registration_open: boolean;
  zone: 'green' | 'blue' | 'both';
  tags: string[] | null;
  is_published: boolean;
}

export interface Venue {
  id: string;
  name: string;
  name_en: string | null;
  capacity: number;
  location: string | null;
  floor: number | null;
}

export interface Speaker {
  id: string;
  full_name: string;
  full_name_en: string | null;
  title: string | null;
  organization: string | null;
  avatar_url: string | null;
  country: string | null;
}

export interface SeatRegistration {
  id: string;
  session_id: string;
  user_id: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  registered_at: string;
}

export interface Notification {
  id: string;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
  notification_type: 'general' | 'programme' | 'emergency' | 'system';
  target_roles: string[] | null;
  target_countries: string[] | null;
  sent_by: string | null;
  sent_at: string;
  is_emergency: boolean;
}
