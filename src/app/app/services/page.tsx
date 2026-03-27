import Link from 'next/link';

const serviceCards = [
  {
    href: '/app/services/shop',
    icon: '🛍️',
    title: 'Дэлгүүр',
    description: 'Сувенир, хоол, тасалбар',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    titleColor: 'text-blue-800',
  },
  {
    href: '/app/services/transport',
    icon: '🚌',
    title: 'Тээвэр',
    description: 'Такси, түрээс, шаттл',
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
    titleColor: 'text-green-800',
  },
  {
    href: '/app/services/transport?type=airport_transfer',
    icon: '✈️',
    title: 'Нисэх онгоц',
    description: 'Нисэх буудлын трансфер',
    color: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
    titleColor: 'text-sky-800',
  },
  {
    href: '/app/services/restaurant',
    icon: '🍽️',
    title: 'Ресторан',
    description: 'Ширээ захиалга, хоол',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    titleColor: 'text-orange-800',
  },
  {
    href: '/app/services/hotel',
    icon: '🏨',
    title: 'Зочид буудал',
    description: 'Арга хэмжээний ойролцоох буудлууд',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    titleColor: 'text-purple-800',
  },
  {
    href: '/app/services/esim',
    icon: '📱',
    title: 'e-SIM',
    description: 'Монгол интернет / дуут холбоо',
    color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
    titleColor: 'text-teal-800',
  },
  {
    href: '/app/services/lost-found',
    icon: '🔍',
    title: 'Алдсан/Олдсон зүйл',
    description: 'Мэдэгдэх ба хайх',
    color: 'bg-red-50 hover:bg-red-100 border-red-200',
    titleColor: 'text-red-800',
  },
  {
    href: '/app/wallet',
    icon: '💳',
    title: 'Хэтэвч',
    description: 'Үлдэгдэл, гүйлгээ',
    color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    titleColor: 'text-yellow-800',
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Үйлчилгээ</h1>
        <p className="text-gray-500 mt-1">Арга хэмжээний бүх үйлчилгээ</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {serviceCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${card.color}`}
          >
            <span className="text-4xl">{card.icon}</span>
            <p className={`font-semibold text-center text-sm ${card.titleColor}`}>{card.title}</p>
            <p className="text-xs text-gray-500 text-center">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
