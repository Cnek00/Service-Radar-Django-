import { TrendingUp, Users, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface AnalyticsDashboardProps {
  data: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    rejectedRequests: number;
    totalRevenue?: number;
    activeUsers?: number;
  };
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const completionRate = data.totalRequests > 0
    ? ((data.completedRequests / data.totalRequests) * 100).toFixed(1)
    : '0';

  const stats = [
    {
      label: 'Toplam Talep',
      value: data.totalRequests,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Bekleyen',
      value: data.pendingRequests,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Tamamlanan',
      value: data.completedRequests,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Reddedilen',
      value: data.rejectedRequests,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Tamamlanma Oranı</span>
            <TrendingUp className="w-5 h-5 opacity-90" />
          </div>
          <div className="text-4xl font-bold mb-2">{completionRate}%</div>
          <div className="text-sm opacity-80">Son 30 gün</div>
        </div>

        {data.totalRevenue !== undefined && (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Toplam Gelir</span>
              <DollarSign className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-4xl font-bold mb-2">₺{data.totalRevenue.toLocaleString()}</div>
            <div className="text-sm opacity-80">Bu ay</div>
          </div>
        )}

        {data.activeUsers !== undefined && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Aktif Kullanıcılar</span>
              <Users className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-4xl font-bold mb-2">{data.activeUsers}</div>
            <div className="text-sm opacity-80">Bu hafta</div>
          </div>
        )}
      </div>
    </div>
  );
}
