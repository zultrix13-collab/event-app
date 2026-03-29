# Gap Analysis — Системийн Шаардлага vs Одоогийн Хэрэгжилт
## Event Digital Platform | 2026-03-30

> Энэ баримт шаардлагын `SYSTEM_REQUIREMENTS.md`-тэй харьцуулж одоогийн кодын байдлыг үнэлсэн.
> 
> **Статус тэмдэглэгээ:**
> - ✅ Хэрэгжсэн (ажиллаж байна)
> - 🔶 Хэсэгчлэн (UI/stub бий, backend дутуу)
> - ❌ Хэрэгжээгүй (огт байхгүй)
> - ⚠️ PoC хийх шаардлагатай (нарийн төвөгтэй)

---

## AUTH — Нэвтрэлт ба Аутентификаци

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| AUTH-01 | Email OTP нэвтрэлт | ✅ | Supabase Magic Link + OTP, retry хязгаар тохируулагдсан |
| AUTH-02 | Biometric Authentication | ❌ | Веб дээр биометр байхгүй. Flutter-д хэрэгжүүлэх шаардлагатай (iOS Face/Touch ID, Android Fingerprint) |
| AUTH-03 | QR + NFC Дижитал Үнэмлэх | 🔶 | QR генераци хийгдсэн (`digital-id.ts`), HMAC signature бий. Гэвч NFC тэмдэглэгчийг iOS/Android аппд хэрэгжүүлээгүй. Offline verification хэрэгжүүлэгдээгүй. ⚠️ PoC шаардлагатай |
| AUTH-04 | SSO (Single Sign-On) | 🔶 | Supabase JWT ашигладаг. Веб OK. Flutter-д жинхэнэ SSO токен refresh нэмэгдэх хэрэгтэй |
| AUTH-05 | Role-based Access Control | ✅ | `user_roles` хүснэгт, RLS policy, middleware шалгалт хийгдсэн |

---

## PROG — Хөтөлбөр

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| PROG-01 | Арга хэмжааний календарь | ✅ | `/app/programme` хуудас, өдрөөр шүүх, дэлгэрэнгүй харах |
| PROG-02 | Суудал захиалга + Багтаамж | 🔶 | Захиалах UI бий, `sessions` хүснэгтэд `capacity` талбар бий. Race condition-оос хамгаалах Redis lock ⚠️ **хэрэгжүүлэгдээгүй** |
| PROG-03 | Хувийн хөтөлбөр (My Agenda) | ✅ | `/app/programme/agenda` хуудас, iCal export API (`/api/agenda/ical`) |
| PROG-04 | QR/NFC Ирцийн бүртгэл | 🔶 | `/app/programme/checkin/[sessionId]` хуудас бий. Гэвч NFC-ийн хэсэг байхгүй, QR зөвхөн бүртгэл. `/api/map/checkin` route бий |
| PROG-05 | Санал асуулга ба үнэлгээ | ❌ | Feedback form байхгүй |
| PROG-06 | Илтгэгчийн профайл удирдлага | ✅ | `/admin/speakers` CRUD, `/api/admin/speakers` route |

---

## SVC — Үйлчилгээ

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| SVC-01 | Дэлгүүр / Marketplace | 🔶 | Shop UI, cart, orders хуудас бий. Гэвч жинхэнэ checkout → төлбөр урсгал дутуу |
| SVC-02 | Тээврийн үйлчилгээ | 🔶 | `/app/services/transport` UI хуудас бий. 3rd party API integration **байхгүй** |
| SVC-03 | Нисэх буудлын тээвэр | 🔶 | Transport хуудсанд нэгдсэн UI бий. Flight number input дутуу |
| SVC-04 | Хоол & Ресторан | 🔶 | `/app/services/restaurant` UI хуудас бий. Захиалгын систем дутуу |
| SVC-05 | Буудал | 🔶 | `/app/services/hotel` UI хуудас бий. Booking integration байхгүй |
| SVC-06 | E-SIM худалдан авалт | ❌ | UI болон backend огт байхгүй. Оператортой гэрээ хэлэлцэх хэрэгтэй |
| SVC-07 | Lost & Found | ✅ | `/app/services/lost-found` UI, `/admin/complaints` dashboard бий |
| SVC-08 | Худалдаа үйлчилгээний бүртгэл | 🔶 | Vendors admin (`/api/admin/vendors`) бий. KYC процесс дутуу |

---

## PAY — Төлбөрийн Систем

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| PAY-01 | Дижитал хэтэвч (Wallet) | 🔶 | Wallet UI бий (`/app/wallet`), topup хуудас бий. ACID transaction, idempotency key ⚠️ **хэрэгжүүлэгдээгүй** |
| PAY-02 | Банкны карт холболт | ❌ | UI болон tokenization байхгүй. PCI-DSS нийцтэй integration шаардлагатай |
| PAY-03 | QR төлбөр (QPay/SocialPay) | 🔶 | `socialpay.ts` модуль, `/api/qpay`, `/api/payment/qpay-callback` route бий. Sandbox тест хийгдсэн эсэх тодорхойгүй |
| PAY-04 | Апп доторх худалдаа | ❌ | iOS StoreKit / Android Billing байхгүй. Flutter-д хэрэгжүүлэх |
| PAY-05 | Нэгдсэн тайлан | 🔶 | `/admin/stats/export` route бий. Гүйцэд дашборд дутуу |

---

## MAP — Газрын Зураг

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| MAP-01 | Гадаад газрын зураг | ✅ | Google Maps + OutdoorMap component, POI дэмжинэ |
| MAP-02 | Хурлын байрны дотоод зураг | 🔶 | IndoorMap component, FloorPlan DB schema бий. SVG overlay дэмжинэ. Гэвч жинхэнэ floor plan байхгүй |
| MAP-03 | Навигаци | ❌ | А→Б маршрут тооцоолол байхгүй. Google Maps directions API нэмэх шаардлагатай |
| MAP-04 | Indoor Navigation (Beacon/QR) | 🔶 | QR checkin map-тай холбогдсон (`/api/map/checkin`). BLE beacon integration байхгүй. ⚠️ Hardware шаардлага |
| MAP-05 | Offline Map | 🔶 | `/app/map/offline` хуудас UI бий. Татах товч static mock. Жинхэнэ tile caching байхгүй |

---

## NOTIF — Мэдэгдэл

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| NOTIF-01 | Push Notification | 🔶 | `/admin/announcements` Admin хуудас бий. APNs/FCM жинхэнэ integration байхгүй |
| NOTIF-02 | SMS Notification | ❌ | SMS API integration байхгүй |
| NOTIF-03 | Email Notification | ✅ | Supabase-ийн email (magic link, баталгаажуулалт) ажиллаж байна |
| NOTIF-04 | Онцгой байдлын мэдэгдэл | 🔶 | Announcements хуудсанд `is_emergency` талбар байна. Broadcast бүх хэрэглэгчид push хүргэх механизм дутуу |
| NOTIF-05 | Автомат орчуулга | ❌ | Translation API байхгүй |
| NOTIF-06 | Хэрэглэгчийн шүүлт | 🔶 | Announcements-д audience шүүлтийн талбар бий. Push шүүлт хэрэгжүүлэгдээгүй |

---

## AI — Chatbot

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| AI-01 | RAG-д суурилсан chatbot | ✅ | `/api/chat`, `chat_sessions`, `chat_messages`, `kb_documents` — бүтэн RAG pipeline бий. Vector search хэрэгжсэн |
| AI-02 | Монгол/Англи хэл дэмжих | ✅ | ChatWidget Монгол/Англи хоёр хэлд хариулна. Language detection хэрэгжсэн |
| AI-03 | Бодит цагийн мэдээлэл | 🔶 | `/api/ai/index-document` route бий. CMS-тэй auto re-index холбогдоогүй |
| AI-04 | Human handoff | ✅ | `operator_handoffs` хүснэгт, escalation logic chat route-д хэрэгжсэн |
| AI-05 | Conversation logging | ✅ | `chat_messages` хүснэгтэд бүртгэгдэнэ. Retention policy тодорхойгүй |

---

## GREEN — Ногоон Оролцоо

| ID | Шаардлага | Статус | Тайлбар |
|---|---|---|---|
| GREEN-01 | Алхам тоолох (Step Counter) | 🔶 | `StepLogger` component, manual input дэмжинэ. HealthKit/Health Connect **автомат** integration байхгүй |
| GREEN-02 | CO₂ нөлөөллийн тооцоо | ✅ | Алхмаас CO₂ тооцоолох логик хэрэгжсэн (0.08g/step) |
| GREEN-03 | Leaderboard & Badge | ✅ | `/app/green/leaderboard`, `BadgeGrid` component, `/supabase/migrations/...green_leaderboard.sql` |
| GREEN-04 | Хувийн мэдээлэл устгах | ❌ | Data retention / auto-delete policy байхгүй |

---

## ADMIN — Удирдлагын Систем

| Модуль | Статус | Тайлбар |
|---|---|---|
| Хэрэглэгч удирдах | ✅ | `/admin` хуудасуудын цуглуулга, organizations, users CRUD |
| 2FA | ✅ | `/admin/settings/MfaSetupSection.tsx`, TOTP хэрэгжсэн |
| IP хязгаарлалт | ❌ | Middleware-д IP whitelist байхгүй |
| Push мэдэгдэл илгээх | 🔶 | Announcements UI бий. APNs/FCM реал push байхгүй |
| Статистик тайлан | 🔶 | `/admin/stats/export` route. Dashboard дутуу |
| Lost & Found | ✅ | `/admin/complaints` |
| Audit log | ✅ | `/admin/audit` хуудас, `audit_log` хүснэгт |

---

## ВЭБ — Website хэсгүүд

| Хэсэг | Статус | Тайлбар |
|---|---|---|
| CMS / Content Management | ❌ | Headless CMS (Strapi/Contentful) байхгүй. Контент шууд DB-д |
| About Event / Blue Zone хуудас | ❌ | `/app` route бий ч public website (олон нийтэд) тусдаа хийгдээгүй |
| Media Gallery / Press kit | ❌ | CDN-д suурилсан media хэсэг байхгүй |
| Exhibition / B2B уулзалт | ❌ | Байхгүй |
| News & Updates | ❌ | Байхгүй |
| Elasticsearch хайлт | ❌ | Full-text search байхгүй |
| CO₂ / Weather widget (header) | ❌ | OpenAQ / OpenWeatherMap integration байхгүй |

---

## ТЕХНИКИЙН ШААРДЛАГА

| Шаардлага | Статус | Тайлбар |
|---|---|---|
| SSL/TLS | ✅ | Vercel-д HTTPS автомат |
| Audit log | ✅ | Хэрэгжсэн |
| OWASP хамгаалалт | 🔶 | Supabase RLS, input validation бий. Гэвч pentest хийгдэж баталгаажаагүй |
| GDPR | 🔶 | Privacy page бий. Data deletion, consent flow дутуу |
| IP хязгаарлалт (Admin) | ❌ | Байхгүй |
| Docker/Kubernetes | ❌ | Vercel дээр байна. K8s production орчин бий болгоогүй |
| Health check endpoint | ✅ | `/api/health` route хэрэгжсэн |
| Staging орчин | ❌ | Тусдаа staging байхгүй |
| CI/CD pipeline | 🔶 | Vercel auto-deploy бий. GitLab CI / GitHub Actions дутуу |
| Load test (10,000+ concurrent) | ❌ | Хийгдэж баталгаажаагүй |

---

## НЭГТГЭСЭН ДҮН

### Хэрэгжилтийн хувь хэмжээ

| Бүлэг | ✅ Бүрэн | 🔶 Хэсэгчлэн | ❌ Байхгүй | Нийт |
|---|---|---|---|---|
| AUTH | 2 | 2 | 1 | 5 |
| PROG | 3 | 2 | 1 | 6 |
| SVC | 1 | 5 | 2 | 8 |
| PAY | 0 | 3 | 2 | 5 |
| MAP | 1 | 3 | 1 | 5 |
| NOTIF | 1 | 3 | 2 | 6 |
| AI | 4 | 1 | 0 | 5 |
| GREEN | 2 | 1 | 1 | 4 |
| **Нийт** | **14 (35%)** | **20 (50%)** | **10 (25%)** | **40** |

---

## ДАРААГИЙН АЛХАМ — Эрэмбэлсэн Тэргүүлэх Ажлууд

### 🔴 Шууд хэрэгжүүлэх (PoC + эрсдэлийн бууруулалт)

1. **PROG-02** — Race condition хамгаалалт (Redis lock + load test)
2. **PAY-01** — Wallet ACID transaction + idempotency key
3. **AUTH-03** — NFC дэмжлэг Flutter-д нэмэх
4. **NOTIF-01** — APNs/FCM жинхэнэ push notification

### 🟡 Дараагийн Sprint

5. **SVC-01** — Shop checkout → PAY холболт
6. **AUTH-02** — Flutter biometric (Face ID/Touch ID)
7. **MAP-03** — Навигаци (Google Directions API)
8. **NOTIF-02** — SMS Монгол оператортой холболт
9. **PAY-03** — QPay/SocialPay sandbox баталгаажуулалт
10. **GREEN-01** — HealthKit/Health Connect автомат интеграци

### 🟢 Дараагийн фаз

11. **SVC-06** — E-SIM (оператортой гэрээний дараа)
12. **MAP-04** — BLE Beacon PoC
13. **CMS** — Headless CMS сонгох, нэгтгэх
14. **Admin IP whitelist** — Middleware-д хэрэгжүүлэх
15. **GDPR** — Data deletion + consent flow
16. **K8s/Docker** — Production deploy орчин бий болгох
17. **Вэбсайт** — Public website (About, Blue Zone, News, Media) хуудсуудыг бий болгох

---

*Сүүлчийн шинэчлэл: 2026-03-30*
