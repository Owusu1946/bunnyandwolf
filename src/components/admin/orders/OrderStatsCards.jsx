import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaExclamationCircle, FaUndoAlt, FaDollarSign } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/formatters';

const OrderStatsCards = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: <FaBoxOpen className="text-purple-500" />,
      bgColor: 'bg-purple-50',
      iconBgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <FaExclamationCircle className="text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      iconBgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: <FaBoxOpen className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      iconBgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    {
      title: 'Shipped',
      value: stats.shipped,
      icon: <FaShippingFast className="text-indigo-500" />,
      bgColor: 'bg-indigo-50',
      iconBgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800'
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: <FaCheckCircle className="text-green-500" />,
      bgColor: 'bg-green-50',
      iconBgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <FaDollarSign className="text-emerald-500" />,
      bgColor: 'bg-emerald-50',
      iconBgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      isRevenue: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div 
          key={index} 
          className={`${card.bgColor} p-4 rounded-lg border ${card.borderColor} shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex items-center">
            <div className={`${card.iconBgColor} p-3 rounded-lg mr-4`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className={`text-xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatsCards; 