export interface MapPOI {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  category: 'venue' | 'hotel' | 'restaurant' | 'transport' | 'attraction' | 'medical' | 'other';
  latitude: number;
  longitude: number;
  address: string | null;
  image_url: string | null;
}

export interface FloorPlan {
  id: string;
  name: string;
  name_en: string | null;
  floor_number: number;
  svg_url: string | null;
  svg_content: string | null;
}

export interface IndoorZone {
  id: string;
  floor_plan_id: string;
  name: string;
  name_en: string | null;
  zone_type: string;
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
  color: string;
  qr_code: string | null;
}

export interface QrCheckpoint {
  id: string;
  zone_id: string;
  qr_code: string;
  label: string | null;
  label_en: string | null;
}
