import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaGithub, FaTwitter, FaApple, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import {  FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import {  GiCardboardBox } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { register, socialAuth } from '../services/auth';



const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSocialSignup = async (provider) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await socialAuth(provider);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        const userData = {
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        (userData);
        
        navigate('/');
      }
    } catch (err) {
      setError(err.message || `${provider} signup failed`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                className="block w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="(+233) 000-000-000"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-12 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-12 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-500 hover:text-cyan-400 transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-500 hover:text-cyan-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - White Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-white to-gray-50 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        {/* 3D Floating Elements - Similar to Login but with different positions */}
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
            <div className="w-32 h-32 bg-white/80 backdrop-blur-sm rounded-2xl transform rotate-12 border border-gray-100 shadow-2xl">
              <FiShoppingCart className="w-12 h-12 text-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
    <div className="w-24 h-24 bg-white/80 backdrop-blur-sm rounded-2xl transform rotate-45 border border-gray-100 shadow-2xl">
      <FiDollarSign className="w-10 h-10 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
    <div className="w-28 h-28 bg-white/80 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-gray-100 shadow-2xl">
      <GiCardboardBox className="w-11 h-11 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
                Sino<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">sply</span>
              </h1>
              <p className="text-gray-600 mt-4 text-lg">Join our global sourcing network</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="bg-white shadow-2xl p-8 rounded-2xl border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full ring-2 ring-white bg-gradient-to-r from-cyan-500 to-blue-500" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Join 10,000+ businesses worldwide</div>
              </div>
              <p className="text-gray-700 italic text-lg leading-relaxed">
                Connecting with verified suppliers through Sinosply transformed our sourcing process. The platforms efficiency and reliability are unmatched.
              </p>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
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

      {/* Right Panel - Dark Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-md w-full space-y-8 bg-gray-800 bg-opacity-50 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-gray-700">
          <div>
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 mb-2">
              Create Account
            </h1>
            <p className="text-center text-gray-400 text-sm">
              Sign up to get started
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-8 relative">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 
                      ${step >= num 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                        : 'bg-gray-700 text-gray-400'}`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-1 transition-all duration-300 ${
                        step > num 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                          : 'bg-gray-700'
                      }`} />
                    </div>
                  )})
                </div>
              ))}
            </div>

            {renderStep()}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg 
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-blue-600'} 
                    transition-all duration-200`}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-4">
                {[
                  { icon: FaGoogle, provider: 'google' },
                  { icon: FaFacebook, provider: 'facebook' },
                  { icon: FaGithub, provider: 'github' },
                  { icon: FaTwitter, provider: 'twitter' },
                  { icon: FaApple, provider: 'apple' }
                ].map((provider, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSocialSignup(provider.provider)}
                    disabled={loading}
                    className="flex items-center justify-center p-2 border border-gray-600 rounded-lg shadow-sm text-gray-300 bg-gray-700 bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <provider.icon className="h-5 w-5 text-gray-300 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
