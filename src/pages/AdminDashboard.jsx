import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/admin/Sidebar';
import { FaUsers, FaShoppingCart, FaComments, FaMoneyBill } from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Mock data for the line chart
const userAnalyticsData = [
  { month: 'January', Organic: 42, Paid: 24 },
  { month: 'February', Organic: 45, Paid: 48 },
  { month: 'March', Organic: 40, Paid: 62 },
  { month: 'April', Organic: 55, Paid: 74 },
  { month: 'May', Organic: 67, Paid: 52 },
  { month: 'June', Organic: 72, Paid: 50 },
  { month: 'July', Organic: 70, Paid: 65 }
];

// Mock data for the pie chart
const revenueData = [
  { name: 'Shirts', value: 35 },
  { name: 'Shoes', value: 40 },
  { name: 'Bags', value: 25 }
];

const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6'];

const StatCard = ({ icon, title, value, bgColor }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <h3 className="text-2xl font-semibold mt-1">{value}</h3>
    </div>
    <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center bg-opacity-20`}>
      {icon}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/v1/admin/basic-stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.data.success) {
        setStats({
          userCount: response.data.data.userCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total customers"
            value={stats.userCount}
            icon={<FaUsers className="text-orange-500 w-6 h-6" />}
            bgColor="bg-orange-500"
          />
          <StatCard
            title="Total income"
            value="GH₵ 6,760.89"
            icon={<FaMoneyBill className="text-green-500 w-6 h-6" />}
            bgColor="bg-green-500"
          />
          <StatCard
            title="New Orders"
            value="150"
            icon={<FaShoppingCart className="text-blue-500 w-6 h-6" />}
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Unread Chats"
            value="15"
            icon={<FaComments className="text-purple-500 w-6 h-6" />}
            bgColor="bg-purple-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* User Analytics Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">User Analytics</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="Organic" 
                    stroke="#06B6D4" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Paid" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#06B6D4] mr-2"></div>
                <span className="text-sm text-gray-600">Organic</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-2"></div>
                <span className="text-sm text-gray-600">Paid</span>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Revenue</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              {revenueData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 