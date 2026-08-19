const StatCard = ({ title, value, icon, trend, positive }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
            {positive ? '+' : '-'}{trend} <span className="text-gray-400 font-normal ml-1">vs last month</span>
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full ${positive ? 'bg-emerald-100 text-primary' : 'bg-blue-100 text-blue-600'}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
