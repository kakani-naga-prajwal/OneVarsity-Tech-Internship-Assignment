import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  YAxis,
  PieChart,
  Pie,
  Tooltip,
} from 'recharts';

// Hash product id+name to get unique seed per product (different pie values per image)
function productSeed(product) {
  const str = `${product?.id || ''}-${product?.name || ''}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// Demo data – unique values per product
function getDemoData(product) {
  const basePrice = Number(product?.price || 50);
  const seed = productSeed(product);
  const s = (n) => (n * seed) % 1000 + (seed % 50);

  return {
    totalSales: Math.round(basePrice * (12 + (seed % 15))),
    salesChange: 229 + (seed % 100),
    ordersToday: 8 + (seed % 10),
    ordersChange: 3 + (seed % 5),
    netProfit: Math.round(basePrice * 22 * (0.5 + (seed % 30) / 100)),
    profitChange: 2020 + (seed % 500),
    profitMargin: 55 + (seed % 15),
    marginChange: 2,
    salesVolume: [
      { name: 'Week 1', thisMonth: 800 + seed, lastMonth: 600 },
      { name: 'Week 2', thisMonth: 1200 + seed, lastMonth: 900 },
      { name: 'Week 3', thisMonth: 950 + seed, lastMonth: 1100 },
      { name: 'Week 4', thisMonth: 1400 + seed, lastMonth: 1200 },
    ],
    orderVolume: [
      { name: 'Week 1', thisMonth: 12, lastMonth: 10 },
      { name: 'Week 2', thisMonth: 18, lastMonth: 14 },
      { name: 'Week 3', thisMonth: 15, lastMonth: 20 },
      { name: 'Week 4', thisMonth: 22, lastMonth: 18 },
    ],
    pl: {
      salePrice: Math.round(basePrice * 120),
      referrerCut: 259,
      packaging: 380,
      shipping: 1140,
      warehouse: 912,
      transactions: 441,
    },
    salesByLocation: [
      { name: 'United States', value: 12000 + s(11) % 6000 },
      { name: 'Canada', value: 2500 + s(13) % 2000 },
      { name: 'UK', value: 1800 + s(17) % 1500 },
      { name: 'Australia', value: 900 + s(19) % 800 },
    ],
    ordersByChannel: [
      { name: 'Marketplace', value: 80 + s(2) % 60, fill: '#6366f1' },
      { name: 'Shop', value: 60 + s(3) % 50, fill: '#22c55e' },
      { name: 'Store', value: 50 + s(5) % 45, fill: '#f59e0b' },
      { name: 'Direct', value: 30 + s(7) % 35, fill: '#ef4444' },
    ],
    avgOrderValue: 20 + (seed % 30),
    salesByReferrer: [
      { name: 'Direct', value: 8000 + s(23) % 5000 },
      { name: 'Social', value: 2000 + s(29) % 1500 },
      { name: 'Search', value: 1500 + s(31) % 1200 },
      { name: 'Email', value: 800 + s(37) % 600 },
    ],
    revenueSplit: [
      { name: 'Product', value: 60 + (seed % 20) },
      { name: 'Shipping', value: 15 + (seed % 10) },
      { name: 'Tax', value: 8 + (seed % 5) },
      { name: 'Fees', value: 5 + (seed % 8) },
    ],
  };
}

export default function ProductKpiDashboard({ product }) {
  const data = getDemoData(product);

  return (
    <div className="mt-12 rounded-2xl overflow-hidden bg-slate-800 text-slate-100">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold">Product KPI Dashboard</h2>
        <p className="text-slate-400 text-sm">Analytics for: {product?.name}</p>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">Total Sales</p>
          <p className="text-2xl font-bold mt-1">₹{data.totalSales.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Today</p>
          <p className="text-emerald-400 text-sm mt-1">▲ ₹{data.salesChange} vs same day last week</p>
          <div className="h-20 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesVolume} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="name" hide />
                <Line type="monotone" dataKey="thisMonth" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lastMonth" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">Orders</p>
          <p className="text-2xl font-bold mt-1">{data.ordersToday + 35}</p>
          <p className="text-xs text-slate-400 mt-1">Today</p>
          <p className="text-emerald-400 text-sm mt-1">▲ {data.ordersChange} vs same day last week</p>
          <div className="h-20 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.orderVolume} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="name" hide />
                <Line type="monotone" dataKey="thisMonth" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lastMonth" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">Net Profit</p>
          <p className="text-2xl font-bold mt-1">₹{(data.netProfit / 1000).toFixed(2)}K</p>
          <p className="text-xs text-slate-400 mt-1">This month</p>
          <p className="text-emerald-400 text-sm mt-1">▲ ₹{(data.profitChange / 1000).toFixed(2)}k vs last month</p>
          <div className="mt-3">
            <p className="text-lg font-semibold">{data.profitMargin}%</p>
            <p className="text-slate-400 text-xs">Net profit margin</p>
            <p className="text-emerald-400 text-sm">▲ {data.marginChange}% vs last month</p>
          </div>
        </div>

        {/* Avg Order Value - Gauge */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">Avg. order value</p>
          <div className="relative mt-2 h-16">
            <svg viewBox="0 0 120 60" className="w-full h-full">
              <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#334155" strokeWidth="12" />
              <path
                d="M 10 50 A 50 50 0 0 1 110 50"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="12"
                strokeDasharray={`${(data.avgOrderValue / 50) * 157} 157`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl font-bold">₹{data.avgOrderValue}</span>
          </div>
          <p className="text-slate-400 text-xs text-center mt-1">₹0 — ₹50</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P&L Statement */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <h3 className="font-semibold mb-3">P&L statement – last month</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-400">Sale price</span>
              <span>₹{data.pl.salePrice.toLocaleString()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Referrer cut</span>
              <span>₹{data.pl.referrerCut}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Packaging costs</span>
              <span>₹{data.pl.packaging}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Shipping costs</span>
              <span>₹{data.pl.shipping}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">Warehouse costs</span>
              <span>₹{data.pl.warehouse}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-400">PayPal transactions</span>
              <span>₹{data.pl.transactions}</span>
            </li>
            <li className="flex justify-between border-t border-slate-600 pt-2 mt-2 font-medium">
              <span>Total costs</span>
              <span>₹{(data.pl.referrerCut + data.pl.packaging + data.pl.shipping + data.pl.warehouse + data.pl.transactions).toLocaleString()}</span>
            </li>
          </ul>
        </div>

        {/* Sales by location – Pie */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <h3 className="font-semibold mb-3">Sales by location</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.salesByLocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.salesByLocation.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(1)}K`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Orders by channel – Pie */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <h3 className="font-semibold mb-3">Orders by channel</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ordersByChannel}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.ordersByChannel.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by referrer – Pie */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <h3 className="font-semibold mb-3">Sales by referrer</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.salesByReferrer}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.salesByReferrer.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue split – Pie */}
        <div className="rounded-xl bg-slate-700/50 p-4">
          <h3 className="font-semibold mb-3">Revenue split</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.revenueSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.revenueSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
