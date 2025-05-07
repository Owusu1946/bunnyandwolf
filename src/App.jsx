import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './components/ToastManager'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import PaymentPage from './pages/PaymentPage'
import CheckoutPage from './pages/CheckoutPage'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import TrackOrderPage from './pages/TrackOrderPage'
import OrdersPage from './pages/admin/OrdersPage'
import AdminOrders from './pages/admin/AdminOrders'
import ProductsPage from './pages/admin/ProductsPage'
import CustomersPage from './pages/admin/CustomersPage'
import ChatsPage from './pages/admin/ChatsPage'
import AdminProfile from './pages/admin/AdminProfile'
import AdminSettings from './pages/admin/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              {/* <Navbar /> */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/track-order/:trackingNumber" element={<TrackOrderPage />} />
                <Route 
                  path="/profile" 
                  element={
                      <Profile />
                  } 
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <OrdersPage />
                  </AdminRoute>
                } />
                <Route path="/admin/all-orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <ProductsPage />
                  </AdminRoute>
                } />
                <Route path="/admin/customers" element={
                  <AdminRoute>
                    <CustomersPage />
                  </AdminRoute>
                } />
                <Route path="/admin/chats" element={
                  <AdminRoute>
                    <ChatsPage />
                  </AdminRoute>
                } />
                <Route path="/admin/profile" element={
                  <AdminRoute>
                    <AdminProfile />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                } />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App