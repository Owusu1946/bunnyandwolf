import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './components/ToastManager'
import { SidebarProvider } from './context/SidebarContext'
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
import CouponsPage from './pages/admin/CouponsPage'
import CampaignsPage from './pages/admin/CampaignsPage'
import AdminProfile from './pages/admin/AdminProfile'
import AdminSettings from './pages/admin/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import CollectionsPage from './pages/admin/CollectionsPage'
import PlatformsPage from './pages/admin/PlatformsPage'
import FeaturedCollectionPage from './pages/FeaturedCollectionPage'
// Wrap AdminRoute components with SidebarProvider
const AdminRouteWithSidebar = ({ children }) => (
  <SidebarProvider>
    <AdminRoute>
      {children}
    </AdminRoute>
  </SidebarProvider>
);

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
                <Route path="/collections/:collectionId" element={<FeaturedCollectionPage />} />
                <Route 
                  path="/profile" 
                  element={
                      <Profile />
                  } 
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Admin Routes with SidebarProvider */}
                <Route path="/admin/dashboard" element={
                  <AdminRouteWithSidebar>
                    <AdminDashboard />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/orders" element={
                  <AdminRouteWithSidebar>
                    <OrdersPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/all-orders" element={
                  <AdminRouteWithSidebar>
                    <AdminOrders />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/products" element={
                  <AdminRouteWithSidebar>
                    <ProductsPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/customers" element={
                  <AdminRouteWithSidebar>
                    <CustomersPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/chats" element={
                  <AdminRouteWithSidebar>
                    <ChatsPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/coupons" element={
                  <AdminRouteWithSidebar>
                    <CouponsPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/campaigns" element={
                  <AdminRouteWithSidebar>
                    <CampaignsPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/profile" element={
                  <AdminRouteWithSidebar>
                    <AdminProfile />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/settings" element={
                  <AdminRouteWithSidebar>
                    <AdminSettings />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/collections" element={
                  <AdminRouteWithSidebar>
                    <CollectionsPage />
                  </AdminRouteWithSidebar>
                } />
                <Route path="/admin/platforms" element={
                  <AdminRouteWithSidebar>
                    <PlatformsPage />
                  </AdminRouteWithSidebar>
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