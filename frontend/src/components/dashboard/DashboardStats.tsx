interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
}

function StatCard({ title, value, trend, isPositive }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const stats = [
    {
      title: "At-Risk Products",
      value: 24,
      trend: "↓ 15% from yesterday",
      isPositive: true
    },
    {
      title: "Predicted Savings",
      value: "$1,245",
      trend: "↑ 8% from yesterday",
      isPositive: true
    },
    {
      title: "Rescue Success Rate",
      value: "78%",
      trend: "↑ 5% from yesterday",
      isPositive: true
    },
    {
      title: "Waste Reduction",
      value: "320 kg",
      trend: "↑ 12% from yesterday",
      isPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard 
          key={index}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          isPositive={stat.isPositive}
        />
      ))}
    </div>
  );
} 