-- Map POIs (Points of Interest) - outdoor
CREATE TABLE IF NOT EXISTS map_pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  category text DEFAULT 'general' CHECK (category IN ('venue', 'hotel', 'restaurant', 'transport', 'attraction', 'medical', 'other')),
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  address text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indoor floor plans
CREATE TABLE IF NOT EXISTS floor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  floor_number int DEFAULT 0,
  svg_url text, -- URL to SVG file stored in Supabase Storage
  svg_content text, -- Inline SVG for small plans
  width_meters numeric(8,2),
  height_meters numeric(8,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indoor zones/rooms on floor plans
CREATE TABLE IF NOT EXISTS indoor_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_plan_id uuid REFERENCES floor_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_en text,
  zone_type text DEFAULT 'room' CHECK (zone_type IN ('room', 'hall', 'registration', 'restaurant', 'medical', 'toilet', 'exit', 'shop', 'stage')),
  -- SVG coordinates (percentage-based for responsive)
  x_percent numeric(5,2) NOT NULL, -- 0-100
  y_percent numeric(5,2) NOT NULL,
  width_percent numeric(5,2) DEFAULT 10,
  height_percent numeric(5,2) DEFAULT 10,
  color text DEFAULT '#10b981',
  qr_code text UNIQUE, -- QR code for this zone (check-in)
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- QR checkpoints (indoor navigation)
CREATE TABLE IF NOT EXISTS qr_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES indoor_zones(id) ON DELETE CASCADE,
  qr_code text UNIQUE NOT NULL,
  label text,
  label_en text,
  scanned_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User location history (indoor)
CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES indoor_zones(id) ON DELETE SET NULL,
  checkpoint_id uuid REFERENCES qr_checkpoints(id) ON DELETE SET NULL,
  located_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_locations_user ON user_locations(user_id);

-- RLS
ALTER TABLE map_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE indoor_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read map_pois" ON map_pois FOR SELECT USING (is_active = true);
CREATE POLICY "Public read floor_plans" ON floor_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public read indoor_zones" ON indoor_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Public read qr_checkpoints" ON qr_checkpoints FOR SELECT USING (true);
CREATE POLICY "Users manage own locations" ON user_locations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins manage pois" ON map_pois FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage floor_plans" ON floor_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage indoor_zones" ON indoor_zones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

-- Seed: Sample POIs (Ulaanbaatar area - adjust as needed)
INSERT INTO map_pois (name, name_en, category, latitude, longitude, address, description, description_en) VALUES
('Үндэсний ордон', 'State Palace', 'venue', 47.9077, 106.9037, 'Чингисийн талбай, Улаанбаатар', 'Арга хэмжааний үндсэн цэг', 'Main event venue'),
('Чингис хаан олон улсын нисэх буудал', 'Chinggis Khaan International Airport', 'transport', 47.8433, 106.7667, 'Улаанбаатар', 'Олон улсын нисэх буудал', 'International airport'),
('Шангри-Ла Улаанбаатар', 'Shangri-La Ulaanbaatar', 'hotel', 47.9126, 106.9197, 'Олимпийн гудамж 19', '5 одтой зочид буудал', '5-star hotel'),
('Kempinski Hotel', 'Kempinski Hotel', 'hotel', 47.9066, 106.9136, 'Чингисийн талбай 13', '5 одтой зочид буудал', '5-star hotel'),
('Туршлагын ресторан', 'Experience Restaurant', 'restaurant', 47.9080, 106.9050, 'Арга хэмжааний газар', 'Арга хэмжааний ресторан', 'Event restaurant')
ON CONFLICT DO NOTHING;

-- Seed: Sample floor plan (simplified SVG-based)
INSERT INTO floor_plans (name, name_en, floor_number, svg_content, width_meters, height_meters) VALUES
(
  '1-р давхар — Үндсэн танхим',
  'Floor 1 — Main Hall',
  1,
  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.5"/><rect x="5" y="5" width="90" height="20" fill="#dcfce7" stroke="#16a34a" stroke-width="0.5" rx="1"/><text x="50" y="17" text-anchor="middle" font-size="4" fill="#15803d">ҮНДСЭН ТАНХИМ / MAIN HALL</text><rect x="5" y="30" width="40" height="30" fill="#dbeafe" stroke="#2563eb" stroke-width="0.5" rx="1"/><text x="25" y="47" text-anchor="middle" font-size="3" fill="#1d4ed8">БҮРТГЭЛ / REGISTRATION</text><rect x="55" y="30" width="40" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="0.5" rx="1"/><text x="75" y="47" text-anchor="middle" font-size="3" fill="#92400e">VIP ЗОЧНЫ ӨРӨӨ</text><rect x="5" y="65" width="25" height="20" fill="#fce7f3" stroke="#db2777" stroke-width="0.5" rx="1"/><text x="17" y="77" text-anchor="middle" font-size="3" fill="#9d174d">ХООЛ</text><rect x="35" y="65" width="25" height="20" fill="#f0fdf4" stroke="#16a34a" stroke-width="0.5" rx="1"/><text x="47" y="77" text-anchor="middle" font-size="3" fill="#15803d">ЭМНЭЛЭГ</text><rect x="65" y="65" width="25" height="20" fill="#f5f3ff" stroke="#7c3aed" stroke-width="0.5" rx="1"/><text x="77" y="77" text-anchor="middle" font-size="3" fill="#5b21b6">ДЭЛГҮҮР</text><rect x="5" y="88" width="12" height="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5" rx="1"/><text x="11" y="93" text-anchor="middle" font-size="2.5" fill="#475569">ГАРЦ</text><rect x="83" y="88" width="12" height="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5" rx="1"/><text x="89" y="93" text-anchor="middle" font-size="2.5" fill="#475569">ГАРЦ</text></svg>',
  80,
  60
);

-- Seed: indoor zones for the floor plan
WITH fp AS (SELECT id FROM floor_plans LIMIT 1)
INSERT INTO indoor_zones (floor_plan_id, name, name_en, zone_type, x_percent, y_percent, width_percent, height_percent, color, qr_code)
SELECT
  fp.id,
  name, name_en, zone_type, x_percent, y_percent, width_percent, height_percent, color, qr_code
FROM fp, (VALUES
  ('Үндсэн танхим', 'Main Hall', 'hall', 5.0, 5.0, 90.0, 20.0, '#10b981', 'QR-ZONE-MAIN-HALL'),
  ('Бүртгэлийн цэг', 'Registration', 'registration', 5.0, 30.0, 40.0, 30.0, '#3b82f6', 'QR-ZONE-REGISTRATION'),
  ('VIP өрөө', 'VIP Lounge', 'room', 55.0, 30.0, 40.0, 30.0, '#f59e0b', 'QR-ZONE-VIP'),
  ('Хоолны газар', 'Restaurant', 'restaurant', 5.0, 65.0, 25.0, 20.0, '#ec4899', 'QR-ZONE-RESTAURANT'),
  ('Эмнэлгийн цэг', 'Medical Center', 'medical', 35.0, 65.0, 25.0, 20.0, '#22c55e', 'QR-ZONE-MEDICAL'),
  ('Дэлгүүр', 'Shop', 'shop', 65.0, 65.0, 25.0, 20.0, '#8b5cf6', 'QR-ZONE-SHOP')
) AS z(name, name_en, zone_type, x_percent, y_percent, width_percent, height_percent, color, qr_code);
