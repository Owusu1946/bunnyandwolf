import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/admin/Sidebar';
import { FaUsers, FaShoppingCart, FaComments, FaMoneyBill } from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useCustomersStore } from '../store/customersStore';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';

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

// Color palette for the pie chart
const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#EF4444'];

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
  const [stats, setStats] = useState({});
  
  // Get customer count from store instead of API
  const { totalCustomers, customers, fetchCustomers } = useCustomersStore();
  const customerCount = totalCustomers || customers.length || 0;
  
  // Get orders data from order store
  const { orders, fetchOrders } = useOrderStore();
  const orderCount = orders.length || 0;
  
  // Get products data
  const productStore = useProductStore();
  const products = productStore.getProducts();
  
  // Calculate total income from orders
  const totalIncome = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2);
  
  // Calculate revenue by category
  const revenueData = useMemo(() => {
    // Create an object to store revenue by category
    const categoryRevenue = {};
    
    // Process each order
    orders.forEach(order => {
      // Process each item in the order
      (order.items || []).forEach(item => {
        // Try to find the product to get its category
        const product = products.find(p => p._id === item.productId);
        
        // Use the category name if found, or "Other" as fallback
        const category = product?.category || "Other";
        
        // Calculate item revenue (price * quantity)
        const itemRevenue = item.price * item.quantity;
        
        // Add to category total
        if (categoryRevenue[category]) {
          categoryRevenue[category] += itemRevenue;
        } else {
          categoryRevenue[category] = itemRevenue;
        }
      });
    });
    
    // Convert to array format for the pie chart
    const result = Object.entries(categoryRevenue).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
    
    // If no data, provide sample data
    if (result.length === 0) {
      return [
        { name: 'DRESSES', value: 35 },
        { name: 'TOPS', value: 40 },
        { name: 'BOTTOMS', value: 25 }
      ];
    }
    
    // Sort by value descending
    return result.sort((a, b) => b.value - a.value);
  }, [orders, products]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    // Load customers from store if needed
    if (customers.length === 0) {
      fetchCustomers();
    }
    
    // Load all orders from API (or use sample if needed)
    const loadOrders = async () => {
      try {
        console.log('Dashboard - Loading all orders...');
        const result = await fetchOrders();
        if (!result.success || orders.length === 0) {
          useOrderStore.getState().initializeWithSampleOrder();
        }
      } catch (error) {
        console.error('Dashboard - Error fetching orders:', error);
      }
    };
    loadOrders();
    
    // Load products if needed
    if (products.length === 0) {
      productStore.fetchProducts();
    }
    
    fetchStats();
  }, [user, navigate, fetchCustomers, customers.length, products.length]);

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
          // Don't need userCount from API anymore
          // Using store data instead
          ...response.data.data
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
            value={customerCount}
            icon={<FaUsers className="text-orange-500 w-6 h-6" />}
            bgColor="bg-orange-500"
          />
          <StatCard
            title="Total income"
            value={`GH₵ ${totalIncome}`}
            icon={<FaMoneyBill className="text-green-500 w-6 h-6" />}
            bgColor="bg-green-500"
          />
          <StatCard
            title="New Orders"
            value={orderCount}
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
            <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
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
                  <Tooltip formatter={(value) => `GH₵ ${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 flex-wrap gap-4">
              {revenueData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}: GH₵ {item.value}</span>
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