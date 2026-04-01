-- ============================================================
-- TEST SEED DATA — "Монгол Инноваци 2026" Conference
-- 2026-05-15 ~ 2026-05-16, Ulaanbaatar
-- Run in Supabase SQL Editor (as service_role)
-- ============================================================

-- ============================================================
-- 1. SPEAKERS (10 хүн)
-- ============================================================
INSERT INTO speakers (full_name, full_name_en, title, title_en, organization, organization_en, bio, bio_en, country, avatar_url, is_active) VALUES

('Батболд Дорж', 'Batbold Dorj',
 'Технологийн захирал', 'CTO',
 'Монгол Дижитал', 'Mongolia Digital',
 'Монголын тэргүүлэх технологийн компанийн захирал. 15 жилийн туршлагатай.',
 'CTO of Mongolia''s leading tech company with 15 years of experience.',
 'MN', 'https://ui-avatars.com/api/?name=Batbold+Dorj&background=6366f1&color=fff', true),

('Оюунцэцэг Ганбаатар', 'Oyuntsetseg Ganbaatar',
 'AI судлаач', 'AI Researcher',
 'МУИС', 'National University of Mongolia',
 'Хиймэл оюун ухааны чиглэлээр олон улсын түвшинд судалгаа хийдэг.',
 'International AI researcher specializing in machine learning.',
 'MN', 'https://ui-avatars.com/api/?name=Oyuntsetseg+G&background=8b5cf6&color=fff', true),

('Анхбаяр Цэрэн', 'Ankhbayar Tseren',
 'Үүсгэн байгуулагч', 'Founder & CEO',
 'NomadTech', 'NomadTech',
 'Олон амжилттай стартап байгуулсан Монголын тэргүүлэх бизнес эрхлэгч.',
 'Serial entrepreneur and founder of multiple successful startups.',
 'MN', 'https://ui-avatars.com/api/?name=Ankhbayar+T&background=06b6d4&color=fff', true),

('Sarah Johnson', 'Sarah Johnson',
 'Инновацийн захирал', 'Director of Innovation',
 'Google Asia Pacific', 'Google Asia Pacific',
 'Google-ийн Ази номхон далайн бүсийн инновацийн хариуцлагатай удирдагч.',
 'Leading innovation initiatives across the Asia Pacific region at Google.',
 'US', 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff', true),

('Тэмүүлэн Нармандах', 'Temuulen Narmandakh',
 'Blockchain архитектор', 'Blockchain Architect',
 'Хаан Банк', 'Khan Bank',
 'Монголын банкны салбарт blockchain технологийг нэвтрүүлж буй мэргэжилтэн.',
 'Expert implementing blockchain technology in Mongolia''s banking sector.',
 'MN', 'https://ui-avatars.com/api/?name=Temuulen+N&background=f59e0b&color=fff', true),

('Мөнхжаргал Пүрэв', 'Munkhjargal Purev',
 'UX Design удирдагч', 'Head of UX Design',
 'Unitel', 'Unitel',
 'Монголын телеком компанийн хэрэглэгчийн туршлагын хариуцлагатай.',
 'Leading user experience design at Mongolia''s major telecom company.',
 'MN', 'https://ui-avatars.com/api/?name=Munkhjargal+P&background=ef4444&color=fff', true),

('Hiroshi Tanaka', 'Hiroshi Tanaka',
 'Ерөнхий захирал', 'Managing Director',
 'SoftBank Mongolia', 'SoftBank Mongolia',
 'SoftBank-ийн Монгол дахь хөрөнгө оруулалтыг удирдаж байгаа туршлагатай удирдагч.',
 'Experienced leader managing SoftBank''s investments in Mongolia.',
 'JP', 'https://ui-avatars.com/api/?name=Hiroshi+Tanaka&background=3b82f6&color=fff', true),

('Сарантуяа Бадамдорж', 'Sarantuya Badamdorj',
 'Кибер аюулгүй байдлын мэргэжилтэн', 'Cybersecurity Expert',
 'МХЕГ', 'National Cyber Security Center',
 'Монголын кибер аюулгүй байдлыг хариуцан ажилладаг хуучирсан мэргэжилтэн.',
 'Veteran cybersecurity professional protecting Mongolia''s digital infrastructure.',
 'MN', 'https://ui-avatars.com/api/?name=Sarantuya+B&background=64748b&color=fff', true),

('Баясгалан Лхагвасүрэн', 'Bayasgalan Lkhagvasuren',
 'Fintech нэвтрүүлэгч', 'Fintech Innovator',
 'QPay', 'QPay',
 'Монгол дахь QPay платформыг байгуулж, дижитал төлбөрийг нийтэд хүргэсэн.',
 'Founded QPay platform and made digital payments accessible to all Mongolians.',
 'MN', 'https://ui-avatars.com/api/?name=Bayasgalan+L&background=8b5cf6&color=fff', true),

('Emma Chen', 'Emma Chen',
 'Тогтвортой хөгжлийн зөвлөх', 'Sustainability Consultant',
 'UN Development Programme', 'UN Development Programme',
 'НҮБ-ын хөгжлийн хөтөлбөрийн Монгол дахь тогтвортой технологийн зөвлөх.',
 'UNDP sustainability technology advisor based in Mongolia.',
 'SG', 'https://ui-avatars.com/api/?name=Emma+Chen&background=10b981&color=fff', true)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. VENUES (5 танхим)
-- ============================================================
INSERT INTO venues (name, name_en, description, capacity, location, floor, is_active) VALUES
('Үндсэн танхим', 'Main Hall',
 'Нээлт, хаалт болон үндсэн илтгэлүүдийн том танхим', 500,
 'A блок, 1-р давхар', 1, true),

('Семинарын өрөө A', 'Workshop Room A',
 'Практик дадлагын жижиг танхим', 80,
 'B блок, 2-р давхар', 2, true),

('Семинарын өрөө B', 'Workshop Room B',
 'Практик дадлагын жижиг танхим', 60,
 'B блок, 2-р давхар', 2, true),

('VIP зочны өрөө', 'VIP Lounge',
 'VIP зочид болон илтгэгчдийн амрах өрөө', 50,
 'C блок, 1-р давхар', 1, true),

('Сүлжээний зона', 'Networking Zone',
 'Оролцогчид харилцах болон хоол хүнс авах зона', 200,
 'A блок, 1-р давхар (гаднах тал)', 1, true)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. EVENT SESSIONS (15 session — 2 өдөр)
-- ============================================================

-- Venues-ийн ID-уудыг авна
WITH v AS (
  SELECT id, name_en FROM venues
),
s AS (
  SELECT id, full_name_en FROM speakers
)
INSERT INTO event_sessions (
  title, title_en, description, description_en,
  session_type, venue_id, starts_at, ends_at,
  capacity, is_registration_open, zone, tags, is_published
)
SELECT
  title, title_en, description, description_en,
  session_type::text,
  (SELECT id FROM venues WHERE name_en = venue_name LIMIT 1),
  starts_at::timestamptz, ends_at::timestamptz,
  capacity, true, zone, tags, true
FROM (VALUES

  -- DAY 1: May 15, 2026
  (
    'Нээлтийн ёслол', 'Opening Ceremony',
    'Арга хэмжааны албан ёсны нээлт болон VIP зочдын мэндчилгээ',
    'Official opening ceremony with VIP guest greetings',
    'keynote', 'Main Hall',
    '2026-05-15 09:00:00+08', '2026-05-15 10:00:00+08',
    500, 'green', ARRAY['opening', 'ceremony', 'keynote']
  ),
  (
    'Монголын дижитал ирээдүй', 'Digital Future of Mongolia',
    'Монголын технологийн салбарын хөгжлийн чиглэл болон боломжуудын тухай үндсэн илтгэл',
    'Keynote on the direction and opportunities in Mongolia''s technology sector',
    'keynote', 'Main Hall',
    '2026-05-15 10:15:00+08', '2026-05-15 11:15:00+08',
    500, 'green', ARRAY['digital', 'innovation', 'keynote']
  ),
  (
    'AI болон машин сургалт — практик хэрэглээ', 'AI & Machine Learning — Practical Applications',
    'Бодит амьдрал дахь хиймэл оюун ухааны технологийн хэрэглээний жишээнүүд',
    'Real-world examples of AI technology applications in everyday life',
    'general', 'Main Hall',
    '2026-05-15 11:30:00+08', '2026-05-15 12:30:00+08',
    500, 'green', ARRAY['ai', 'machine-learning', 'technology']
  ),
  (
    'Үдийн завсарлага', 'Lunch Break',
    'Хоол хүнс, сүлжээ тогтоох цаг',
    'Lunch and networking time',
    'networking', 'Networking Zone',
    '2026-05-15 12:30:00+08', '2026-05-15 13:30:00+08',
    200, 'both', ARRAY['lunch', 'networking']
  ),
  (
    'Flutter-ээр мобайл апп хөгжүүлэх', 'Mobile App Development with Flutter',
    'Flutter framework ашиглан iOS болон Android апп хөгжүүлэх практик семинар',
    'Hands-on workshop on developing iOS and Android apps using Flutter',
    'workshop', 'Workshop Room A',
    '2026-05-15 13:30:00+08', '2026-05-15 15:30:00+08',
    80, 'green', ARRAY['flutter', 'mobile', 'workshop', 'coding']
  ),
  (
    'Blockchain болон Web3 технологи', 'Blockchain & Web3 Technology',
    'Блокчэйн технологийг бизнест нэвтрүүлэх арга замууд',
    'Ways to implement blockchain technology in business',
    'workshop', 'Workshop Room B',
    '2026-05-15 13:30:00+08', '2026-05-15 15:30:00+08',
    60, 'blue', ARRAY['blockchain', 'web3', 'fintech', 'workshop']
  ),
  (
    'Кибер аюулгүй байдлын эрсдэл', 'Cybersecurity Risks Panel',
    'Дижитал аюулгүй байдлыг хамгаалах стратегийн тухай мэргэжилтнүүдийн хэлэлцүүлэг',
    'Expert discussion on strategies for protecting digital security',
    'panel', 'Main Hall',
    '2026-05-15 15:45:00+08', '2026-05-15 17:00:00+08',
    500, 'green', ARRAY['cybersecurity', 'panel', 'security']
  ),
  (
    'Өдрийн хаалт болон VIP зоогийн үдэшлэг', 'Day 1 Closing & VIP Dinner',
    'Эхний өдрийн дүгнэлт болон урилгат VIP зоогийн үдэшлэг',
    'Day 1 summary and invitation-only VIP dinner',
    'networking', 'VIP Lounge',
    '2026-05-15 18:00:00+08', '2026-05-15 20:00:00+08',
    50, 'both', ARRAY['vip', 'dinner', 'networking']
  ),

  -- DAY 2: May 16, 2026
  (
    'Өглөөний бүртгэл болон кофе', 'Morning Registration & Coffee',
    'Хоёрдугаар өдрийн бүртгэл болон өглөөний кофе',
    'Day 2 registration and morning coffee',
    'networking', 'Networking Zone',
    '2026-05-16 08:30:00+08', '2026-05-16 09:00:00+08',
    200, 'both', ARRAY['registration', 'networking']
  ),
  (
    'Fintech болон дижитал төлбөр', 'Fintech & Digital Payments',
    'Монголын санхүүгийн технологийн хөгжил болон ирээдүйн чиг хандлага',
    'Development of financial technology in Mongolia and future trends',
    'keynote', 'Main Hall',
    '2026-05-16 09:00:00+08', '2026-05-16 10:00:00+08',
    500, 'green', ARRAY['fintech', 'payments', 'qpay', 'keynote']
  ),
  (
    'Тогтвортой технологи ба ногоон хөгжил', 'Sustainable Tech & Green Development',
    'Технологи болон байгаль орчны тогтвортой хөгжлийн уялдаа холбоо',
    'Connecting technology with sustainable environmental development',
    'general', 'Main Hall',
    '2026-05-16 10:15:00+08', '2026-05-16 11:15:00+08',
    500, 'green', ARRAY['sustainability', 'green', 'environment']
  ),
  (
    'UX/UI дизайны шилдэг туршлага', 'UX/UI Design Best Practices',
    'Хэрэглэгчид тулгуурласан дизайны зарчим болон практик семинар',
    'User-centered design principles and hands-on workshop',
    'workshop', 'Workshop Room A',
    '2026-05-16 11:30:00+08', '2026-05-16 13:00:00+08',
    80, 'green', ARRAY['ux', 'ui', 'design', 'workshop']
  ),
  (
    'Стартап байгуулах 101', 'Startup Fundamentals 101',
    'Амжилттай стартап байгуулах үндэс болон зөвлөмжүүд',
    'Fundamentals and tips for building a successful startup',
    'workshop', 'Workshop Room B',
    '2026-05-16 11:30:00+08', '2026-05-16 13:00:00+08',
    60, 'blue', ARRAY['startup', 'entrepreneurship', 'business', 'workshop']
  ),
  (
    'Үдийн завсарлага — Ногоон хоол', 'Lunch — Green Menu',
    'Байгальд ээлтэй ногоон хоолны цэстэй үдийн завсарлага',
    'Eco-friendly green menu lunch break',
    'networking', 'Networking Zone',
    '2026-05-16 13:00:00+08', '2026-05-16 14:00:00+08',
    200, 'both', ARRAY['lunch', 'green', 'networking']
  ),
  (
    'Хаалтын ёслол болон шагнал гардуулалт', 'Closing Ceremony & Awards',
    'Арга хэмжааний хаалт, шилдэг оролцогчдод шагнал гардуулах ёслол',
    'Closing ceremony and awards presentation to outstanding participants',
    'keynote', 'Main Hall',
    '2026-05-16 16:00:00+08', '2026-05-16 17:30:00+08',
    500, 'both', ARRAY['closing', 'awards', 'ceremony']
  )

) AS data(title, title_en, description, description_en, session_type, venue_name, starts_at, ends_at, capacity, zone, tags)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. SESSION SPEAKERS холбох
-- ============================================================
INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Opening Ceremony' AND sp.full_name_en = 'Batbold Dorj'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'keynote_speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Digital Future of Mongolia' AND sp.full_name_en = 'Batbold Dorj'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'keynote_speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'AI & Machine Learning — Practical Applications' AND sp.full_name_en = 'Oyuntsetseg Ganbaatar'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Mobile App Development with Flutter' AND sp.full_name_en = 'Munkhjargal Purev'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Blockchain & Web3 Technology' AND sp.full_name_en = 'Temuulen Narmandakh'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'moderator', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Cybersecurity Risks Panel' AND sp.full_name_en = 'Sarantuya Badamdorj'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'panelist', 2
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Cybersecurity Risks Panel' AND sp.full_name_en = 'Hiroshi Tanaka'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'keynote_speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Fintech & Digital Payments' AND sp.full_name_en = 'Bayasgalan Lkhagvasuren'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'keynote_speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Sustainable Tech & Green Development' AND sp.full_name_en = 'Emma Chen'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'Startup Fundamentals 101' AND sp.full_name_en = 'Ankhbayar Tseren'
ON CONFLICT DO NOTHING;

INSERT INTO session_speakers (session_id, speaker_id, role, sort_order)
SELECT es.id, sp.id, 'speaker', 1
FROM event_sessions es, speakers sp
WHERE es.title_en = 'UX/UI Design Best Practices' AND sp.full_name_en = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. PRODUCTS (8 бараа)
-- ============================================================
INSERT INTO products (name, name_en, description, description_en, price, currency, category, stock_count, is_active) VALUES

('Арга хэмжааний футболк', 'Event T-Shirt',
 '"Монгол Инноваци 2026" брэндтэй чанарын футболк',
 'Quality t-shirt branded with "Mongolia Innovation 2026"',
 35000, 'MNT', 'merchandise', 200, true),

('Тэмдэглэлийн дэвтэр', 'Conference Notebook',
 'Хатуу хавтастай A5 тэмдэглэлийн дэвтэр + харандаа',
 'Hard-cover A5 notebook + pen set',
 25000, 'MNT', 'merchandise', 150, true),

('Арга хэмжааний цүнх', 'Event Bag',
 'Экологийн цэвэр материалаар хийсэн хөнгөн тот цүнх',
 'Lightweight tote bag made from eco-friendly materials',
 20000, 'MNT', 'merchandise', 300, true),

('USB цэнэглэгч (10,000mAh)', 'Power Bank (10,000mAh)',
 'Гар утасны ачааллыг 3 удаа цэнэглэх боломжтой',
 'Can charge smartphone 3 times',
 45000, 'MNT', 'merchandise', 100, true),

('Өглөөний кофе + хоол', 'Morning Coffee & Snack',
 'Americano эсвэл Latte + нэг аяга зууш',
 'Americano or Latte + one snack',
 12000, 'MNT', 'food', -1, true),

('Үдийн хоол (стандарт)', 'Standard Lunch Box',
 'Хоёр хоол, шөл, ус багтсан бүрэн хоолны иж',
 'Full meal set with two dishes, soup, and water',
 25000, 'MNT', 'food', -1, true),

('Үдийн хоол (ногоон)', 'Green Lunch Box',
 'Ургамлын гаралтай хоол — байгаль орчинд ээлтэй',
 'Plant-based meal — eco-friendly option',
 22000, 'MNT', 'food', -1, true),

('VIP иж бүрдэл', 'VIP Package',
 'Футболк + дэвтэр + USB цэнэглэгч + 2 өдрийн хоол — 20% хямдралтай',
 'T-shirt + notebook + power bank + 2-day lunch — 20% discount',
 100000, 'MNT', 'merchandise', 50, true)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. RESTAURANTS (3 газар)
-- ============================================================
INSERT INTO restaurants (name, name_en, description, cuisine_type, location, opening_hours, is_active) VALUES

('Номын хоол', 'Nomadic Kitchen',
 'Монголын уламжлалт хоол болон орчин үеийн хоолны иж бүрдэл',
 'Mongolian traditional', 'A блок, 1-р давхар',
 '{"weekday": "07:00-21:00", "weekend": "08:00-20:00"}'::jsonb, true),

('The Green Table', 'The Green Table',
 'Органик ургамлын гаралтай хоол — байгальд ээлтэй ресторан',
 'Vegan / Organic', 'B блок, газрын давхар',
 '{"weekday": "08:00-20:00", "weekend": "09:00-19:00"}'::jsonb, true),

('Sky Café', 'Sky Café',
 'Олон улсын хоол болон кофе — панорамик харагдалтай',
 'International / Café', 'C блок, дээд давхар',
 '{"weekday": "06:30-22:00", "weekend": "07:00-22:00"}'::jsonb, true)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. HOTELS (4 зочид буудал)
-- ============================================================
INSERT INTO hotels (name, name_en, description, address, stars, distance_km, phone, is_active) VALUES

('Шангри-Ла Улаанбаатар', 'Shangri-La Ulaanbaatar',
 'Улаанбаатарын хамгийн тансаг 5 одтой зочид буудал. Арга хэмжааний газраас алхах зайд.',
 'Олимпийн гудамж 19, Улаанбаатар', 5, 0.3, '+976 7702 9999', true),

('Kempinski Hotel Khan Palace', 'Kempinski Hotel Khan Palace',
 'Дэлхийн алдартай Kempinski брэндийн 5 одтой зочид буудал.',
 'Чингисийн талбай 13, Улаанбаатар', 5, 0.5, '+976 7011 5060', true),

('Туя Хотел', 'Tuya Hotel',
 'Тохилог болон хэмнэлттэй 3 одтой зочид буудал. Хотын төвд байрладаг.',
 'Энхтайваны өргөн чөлөө 5, Улаанбаатар', 3, 1.2, '+976 7010 1234', true),

('Nomin Inn', 'Nomin Inn',
 'Цэвэр, тав тухтай 2 одтой зочид буудал. Оюутан болон залуу аялагчдад тохиромжтой.',
 'Бага тойруу 8, Улаанбаатар', 2, 2.0, '+976 9900 5678', true)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. NOTIFICATIONS (5 мэдэгдэл)
-- ============================================================
INSERT INTO notifications (title, title_en, body, body_en, notification_type, is_emergency) VALUES

('Арга хэмжаанд тавтай морилно уу! 🎉', 'Welcome to the Event! 🎉',
 '"Монгол Инноваци 2026" арга хэмжаанд тавтай морилно уу! Бүх хөтөлбөр болон мэдээллийг апп-аас харна уу.',
 'Welcome to "Mongolia Innovation 2026"! View all programme details and information in the app.',
 'general', false),

('Маргааш нээлт 09:00 цагт', 'Opening Ceremony Tomorrow at 9:00 AM',
 'Маргааш өглөөний 09:00 цагт Үндсэн танхимд нээлтийн ёслол болно. Цаг тухайд ирнэ үү!',
 'Opening ceremony tomorrow at 9:00 AM in the Main Hall. Please arrive on time!',
 'programme', false),

('⚠️ Яаралтай: Гал унтраах дадлага', '⚠️ Emergency Drill Notice',
 'Өнөөдөр 14:00 цагт гал унтраах дадлага болно. Бүх оролцогчид гарцаар гарна уу. Энэ бол ДАДЛАГА.',
 'Fire evacuation drill at 2:00 PM today. All participants please use the exits. This is a DRILL.',
 'emergency', true),

('Flutter семинарын суудал хязгаарлагдмал', 'Flutter Workshop — Limited Seats',
 'Flutter семинарын суудал ердөө 20 үлдсэн байна! Суудлаа хурдан захиалаарай.',
 'Only 20 seats remaining for the Flutter Workshop! Register quickly to secure your spot.',
 'programme', false),

('Сүлжээний зона нээлтэй байна', 'Networking Zone Open',
 'Сүлжээний зона A блокт нээлттэй байна. Хоол, уух зүйл болон хамт олонтой уулзах боломжтой.',
 'The Networking Zone in Block A is open. Food, drinks, and great connections await!',
 'general', false)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. НЭМЭЛТ MAP POIs
-- ============================================================
INSERT INTO map_pois (name, name_en, category, latitude, longitude, address, description, description_en, is_active) VALUES

('Эмнэлгийн цэг', 'Medical Center',
 'medical', 47.9079, 106.9039,
 'Арга хэмжааний газар — A блок',
 'Арга хэмжааний эмнэлгийн цэг, 24/7 нээлттэй',
 'Event medical center, open 24/7', true),

('Бүртгэлийн тавцан', 'Registration Desk',
 'venue', 47.9078, 106.9038,
 'Үндсэн орц — A блок',
 'Арга хэмжааны бүртгэл болон мэдээлэл авах цэг',
 'Event registration and information desk', true),

('Зогсоол', 'Parking Area',
 'transport', 47.9070, 106.9030,
 'Ард талын зогсоол',
 'Оролцогчдын машины зогсоол — үнэгүй',
 'Free parking area for participants', true),

('Уухын булан', 'Coffee Corner',
 'restaurant', 47.9076, 106.9042,
 'B блок — 1-р давхар',
 'Кофе болон хөнгөн зуушны булан',
 'Coffee and light snacks corner', true),

('Гэрэл зургийн буланг', 'Photo Zone',
 'attraction', 47.9081, 106.9041,
 'Гол гарц — А блокийн урд',
 '"Монгол Инноваци 2026" гэрэл зургийн фрэйм',
 '"Mongolia Innovation 2026" photo frame spot', true)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. НЭМЭЛТ BADGES (шинэ)
-- ============================================================
INSERT INTO badges (name, name_en, description, description_en, icon, requirement_steps, badge_type) VALUES
('Анхдагч оролцогч', 'First Attendee', 'Анхны session-д бүртгүүлсэн', 'Registered for first session', '🎟️', 0, 'attendance'),
('Идэвхтэй оролцогч', 'Active Participant', '5 session-д оролцсон', 'Attended 5 sessions', '⭐', 0, 'attendance'),
('Конференцийн тэмцэгч', 'Conference Champion', '10 session-д оролцсон', 'Attended 10 sessions', '🏆', 0, 'attendance'),
('Ногоон баатар', 'Green Hero', 'Ногоон хоол сонгосон', 'Chose the green menu', '🥗', 0, 'special'),
('Сүлжээний мастер', 'Networking Master', '3 workshop-д оролцсон', 'Attended 3 workshops', '🤝', 0, 'special')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
DO $$
DECLARE
  speaker_count int;
  venue_count int;
  session_count int;
  product_count int;
  restaurant_count int;
  hotel_count int;
  notification_count int;
  poi_count int;
  badge_count int;
BEGIN
  SELECT COUNT(*) INTO speaker_count FROM speakers;
  SELECT COUNT(*) INTO venue_count FROM venues;
  SELECT COUNT(*) INTO session_count FROM event_sessions;
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO restaurant_count FROM restaurants;
  SELECT COUNT(*) INTO hotel_count FROM hotels;
  SELECT COUNT(*) INTO notification_count FROM notifications;
  SELECT COUNT(*) INTO poi_count FROM map_pois;
  SELECT COUNT(*) INTO badge_count FROM badges;

  RAISE NOTICE '✅ Seed data inserted successfully:';
  RAISE NOTICE '   👥 Speakers: %', speaker_count;
  RAISE NOTICE '   🏛️  Venues: %', venue_count;
  RAISE NOTICE '   📅 Sessions: %', session_count;
  RAISE NOTICE '   🛍️  Products: %', product_count;
  RAISE NOTICE '   🍽️  Restaurants: %', restaurant_count;
  RAISE NOTICE '   🏨 Hotels: %', hotel_count;
  RAISE NOTICE '   🔔 Notifications: %', notification_count;
  RAISE NOTICE '   📍 Map POIs: %', poi_count;
  RAISE NOTICE '   🏅 Badges: %', badge_count;
END $$;
