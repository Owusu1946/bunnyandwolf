import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaGithub, FaTwitter, FaApple, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import { GiCardboardBox } from 'react-icons/gi';
import { login, socialAuth } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import apiConfig from '../config/apiConfig';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic form validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('🔑 Login attempt:', { email: formData.email, passwordLength: formData.password.length });
      console.log('📡 API URL used:', apiConfig.baseURL);
      
      const response = await login(formData.email, formData.password);
      
      console.log('✅ Login response:', { 
        success: !!response, 
        hasToken: !!response?.token, 
        hasUser: !!response?.user,
        user: response?.user ? {
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role
        } : null
      });
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Store user data
      const userData = {
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        role: response.user.role
      };

      // Update localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('💾 User data stored in localStorage', { 
        token: !!response.token,
        user: userData 
      });
      
      // Update the user state in AuthContext
      setUser(userData);
      console.log('🔄 User state updated in AuthContext');

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Navigate to home page
      console.log('🔀 Navigating to home page');
      navigate('/home');
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await socialAuth(provider);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Store user data
      const userData = {
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        role: response.user.role
      };

      // Update localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      navigate('/home');
    } catch (err) {
      console.error('Social login error:', err);
      const errorMessages = {
        google: 'Google login failed. Please try again.',
        facebook: 'Facebook login failed. Please try again.',
        github: 'GitHub login failed. Please try again.',
        twitter: 'Twitter login failed. Please try again.',
        apple: 'Apple login failed. Please try again.'
      };
      setError(err.message || errorMessages[provider] || `${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 to-gray-100 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        {/* 3D Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: [0, -20, 0],
              opacity: 1,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 right-20"
          >
            <div className="w-32 h-32 bg-white backdrop-blur-sm rounded-2xl transform rotate-12 border border-gray-200 shadow-xl">
              <FiShoppingCart className="w-12 h-12 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>

          {/* Dollar Sign - Middle Right */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ 
              x: [0, 20, 0],
              opacity: 1,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-1/2 right-40"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl transform rotate-45 border border-slate-100 shadow-xl">
              <FiDollarSign className="w-10 h-10 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>

          {/* Box - Top Left */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ 
              x: [0, -20, 0],
              opacity: 1,
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute top-32 left-40"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-slate-100 shadow-xl">
              <GiCardboardBox className="w-11 h-11 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl font-bold text-gray-900">
                Sino<span className="text-black">sply</span>
              </h1>
              <p className="text-gray-600 mt-4 text-lg">Your global sourcing solution</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="bg-white shadow-xl p-8 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full ring-2 ring-white bg-gradient-to-r from-cyan-600 to-blue-600" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Join 10,000+ businesses worldwide</div>
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "Connecting with verified suppliers through Sinosply transformed our sourcing process. The platform's efficiency and reliability are unmatched."
              </p>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white font-bold">JM</span>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium">James Mensah</p>
                  <p className="text-gray-500 text-sm">Supply Chain Director</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-lg p-10 rounded-xl shadow-2xl border border-slate-700">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link to="/signup" className="font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-400/10 border border-red-400 text-red-400 px-4 py-3 rounded-lg relative" 
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border-b-2 border-gray-600 bg-black/30 rounded-t-lg text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-0 transition-all duration-200"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 border-b-2 border-gray-600 bg-black/30 rounded-t-lg text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-0 transition-all duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-500 hover:text-cyan-400 transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-500 hover:text-cyan-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-500 focus:ring-cyan-400 border-slate-600 rounded bg-slate-700/30"
                  checked={rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-3 px-4 border border-white text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </div>

            {/* Test API connection button */}
            <div>
              <motion.button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError('');
                    console.log('Testing API connection to:', apiConfig.baseURL);
                    
                    // Simple fetch request to test connectivity
                    const response = await fetch(`${apiConfig.baseURL}/auth/test-connection`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    const data = await response.json();
                    console.log('API test response:', data);
                    
                    if (response.ok) {
                      alert(`API connection successful: ${JSON.stringify(data)}`);
                    } else {
                      throw new Error(data.error || 'Connection failed');
                    }
                  } catch (err) {
                    console.error('API test error:', err);
                    setError(`API connection error: ${err.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 group relative w-full flex justify-center py-2 px-4 border border-cyan-500 text-sm font-medium rounded-lg text-cyan-500 bg-transparent hover:bg-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test API Connection
              </motion.button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-3">
                {[
                  { icon: FaGoogle, color: 'text-white', provider: 'google' },
                  { icon: FaFacebook, color: 'text-white', provider: 'facebook' },
                  { icon: FaGithub, color: 'text-white', provider: 'github' },
                  { icon: FaTwitter, color: 'text-white', provider: 'twitter' },
                  { icon: FaApple, color: 'text-white', provider: 'apple' }
                ].map((provider, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => handleSocialLogin(provider.provider)}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex justify-center py-2 px-4 border border-slate-600 rounded-lg shadow-md bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <provider.icon className={`h-5 w-5 ${provider.color}`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
