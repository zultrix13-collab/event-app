import Link from 'next/link';

const serviceCards = [
  {
    href: '/app/services/shop',
    icon: '🛍️',
    title: 'Дэлгүүр',
    description: 'Сувенир, хоол, тасалбар худалдан авах',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    titleColor: 'text-blue-900',
    iconBg: 'bg-blue-100',
    arrowColor: 'text-blue-400',
  },
  {
    href: '/app/services/transport',
    icon: '🚌',
    title: 'Тээвэр',
    description: 'Такси, түрээс, шаттл үйлчилгээ',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    titleColor: 'text-green-900',
    iconBg: 'bg-green-100',
    arrowColor: 'text-green-400',
  },
  {
    href: '/app/services/transport?type=airport_transfer',
    icon: '✈️',
    title: 'Нисэх онгоц',
    description: 'Нисэх буудлын трансфер захиалах',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    hoverColor: 'hover:bg-sky-100',
    titleColor: 'text-sky-900',
    iconBg: 'bg-sky-100',
    arrowColor: 'text-sky-400',
  },
  {
    href: '/app/services/restaurant',
    icon: '🍽️',
    title: 'Ресторан',
    description: 'Ширээ захиалга, хоол хүргэлт',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    titleColor: 'text-orange-900',
    iconBg: 'bg-orange-100',
    arrowColor: 'text-orange-400',
  },
  {
    href: '/app/services/hotel',
    icon: '🏨',
    title: 'Зочид буудал',
    description: 'Арга хэмжааны ойролцоох буудлууд',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    titleColor: 'text-purple-900',
    iconBg: 'bg-purple-100',
    arrowColor: 'text-purple-400',
  },
  {
    href: '/app/services/esim',
    icon: '📱',
    title: 'e-SIM',
    description: 'Монгол интернет ба дуут холбоо',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverColor: 'hover:bg-teal-100',
    titleColor: 'text-teal-900',
    iconBg: 'bg-teal-100',
    arrowColor: 'text-teal-400',
  },
  {
    href: '/app/services/lost-found',
    icon: '🔍',
    title: 'Алдсан/Олдсон',
    description: 'Алдсан эсвэл олдсон зүйлийг мэдэгдэх',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-100',
    titleColor: 'text-red-900',
    iconBg: 'bg-red-100',
    arrowColor: 'text-red-400',
  },
  {
    href: '/app/wallet',
    icon: '💳',
    title: 'Хэтэвч',
    description: 'Үлдэгдэл шалгах, гүйлгээний түүх',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-100',
    titleColor: 'text-yellow-900',
    iconBg: 'bg-yellow-100',
    arrowColor: 'text-yellow-500',
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🛎️ Үйлчилгээ</h1>
        <p className="text-gray-500 mt-1 text-sm">Арга хэмжааний бүх үйлчилгээг нэг дороос</p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {serviceCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`flex flex-col p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md active:scale-95 ${card.bgColor} ${card.borderColor} ${card.hoverColor}`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center text-2xl mb-3 shadow-sm`}>
              {card.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className={`font-bold text-sm leading-tight ${card.titleColor}`}>{card.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{card.description}</p>
            </div>

            {/* Arrow */}
            <div className={`flex justify-end mt-3 ${card.arrowColor}`}>
              <span className="text-sm font-bold">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
