import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Derive analytics from the loaded users array
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let activeThisMonth = 0;

  // aggregate signups by month for the selected year
  const rawMonths = Array(12).fill(0);

  users.forEach((u) => {
    const d = new Date(u.created_at);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      activeThisMonth++;
    }
    if (d.getFullYear() === selectedYear) {
      rawMonths[d.getMonth()]++;
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const byMonth = rawMonths.map((count, index) => ({
    month: monthNames[index],
    signups: count,
  }));

  const analytics = {
    totalUsers: users.length,
    activeThisMonth,
    byMonth,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users & Analytics</h1>
          <p className="text-sm text-slate-500">User signups overview</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="input">
            <option value={new Date().getFullYear()}>This Year</option>
            <option value={new Date().getFullYear() - 1}>Last Year</option>
          </select>
          <Link to="/admin" className="btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Total users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalUsers}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Signups this month</p>
          <p className="text-2xl font-bold mt-1">{analytics.activeThisMonth}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-3">Monthly signups ({selectedYear})</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="signups" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium text-slate-800">{u.name}</td>
                  <td className="p-3 text-slate-600 text-sm">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${u.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-slate-100'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
