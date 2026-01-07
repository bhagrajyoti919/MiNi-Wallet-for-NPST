import React, { useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function SpendingAnalytics({ transactions = [] }) {
  
  // Process data for charts
  const { monthlyData, dailyData } = useMemo(() => {
    // If no transactions, use mock data for visualization
    if (!transactions || transactions.length === 0) {
      const mockMonthly = [
        { name: 'Jan', spending: 4000, income: 2400 },
        { name: 'Feb', spending: 3000, income: 1398 },
        { name: 'Mar', spending: 2000, income: 9800 },
        { name: 'Apr', spending: 2780, income: 3908 },
        { name: 'May', spending: 1890, income: 4800 },
        { name: 'Jun', spending: 2390, income: 3800 },
        { name: 'Jul', spending: 3490, income: 4300 },
      ];

      const mockDaily = Array.from({ length: 7 }, (_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        amount: Math.floor(Math.random() * 5000) + 1000
      }));

      return { monthlyData: mockMonthly, dailyData: mockDaily };
    }

    // Process real transactions
    // Group by Month (simplified for demo - just taking last 6 months or all)
    // Assuming transaction has { created_at, amount, type }
    const months = {};
    const days = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.created_at || Date.now());
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const dayKey = date.toLocaleString('default', { weekday: 'short' }); // Or date number
      
      // Monthly Spending (Paid type)
      if (!months[monthKey]) months[monthKey] = { name: monthKey, spending: 0, income: 0 };
      if (tx.type === 'Paid') {
        months[monthKey].spending += tx.amount;
      } else {
        months[monthKey].income += tx.amount;
      }

      // Daily Volume (Total)
      if (!days[dayKey]) days[dayKey] = { day: dayKey, amount: 0 };
      days[dayKey].amount += tx.amount;
    });

    return { 
      monthlyData: Object.values(months), 
      dailyData: Object.values(days) 
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Monthly Spending Chart */}
      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Monthly Overview</h3>
                <p className="text-sm text-neutral-500">Income vs Spending</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
                <div className="flex items-center gap-1 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Income
                </div>
                <div className="flex items-center gap-1 text-rose-500">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    Spending
                </div>
            </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#888', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#888', fontSize: 12 }} 
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(23, 23, 23, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff' 
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#999', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
              <Area 
                type="monotone" 
                dataKey="spending" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSpending)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Transactions Chart */}
      <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Daily Volume</h3>
                <p className="text-sm text-neutral-500">Transaction volume last 7 days</p>
            </div>
            <div className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-medium text-neutral-500">
                Last 7 Days
            </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#888', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#888', fontSize: 12 }} 
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                    backgroundColor: 'rgba(23, 23, 23, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff' 
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
