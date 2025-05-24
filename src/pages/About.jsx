import React from 'react';
import { motion } from 'framer-motion';
import { FaUserCheck, FaPuzzlePiece, FaGlobeAsia, FaAward, FaShippingFast, FaCertificate } from 'react-icons/fa';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import '../styles/Home.css';

const About = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 } 
    }
  };
  
  // Team members data
  const teamMembers = [
    {
      name: 'Benjie Agyare',
      position: 'Founder & CEO',
      bio: 'With 15+ years in sourcing and quality control, Benjie founded Sinosply to bridge the gap between global buyers and Chinese manufacturers.',
      image: '/team/benjie.jpg'
    },
    {
      name: 'Michael Wong',
      position: 'Operations Director',
      bio: 'Michael oversees our sourcing network and ensures seamless logistics across our sourcing operations in China.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Li Wei',
      position: 'Quality Control Manager',
      bio: 'Based in Guangzhou, Li Wei leads our on-the-ground quality control team ensuring all products meet international standards.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'David Osei',
      position: 'Customer Success Manager',
      bio: 'David ensures our clients have a seamless experience from their first quote to final delivery.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
    }
  ];
  
  // Values data
  const values = [
    {
      title: 'Trust & Transparency',
      description: 'We believe in complete transparency throughout the entire sourcing process.',
      icon: <FaUserCheck className="w-6 h-6" />
    },
    {
      title: 'Quality Commitment',
      description: 'We never compromise on quality standards and thorough product verification.',
      icon: <FaAward className="w-6 h-6" />
    },
    {
      title: 'Global Perspective',
      description: 'Our diverse team brings international expertise while understanding local markets.',
      icon: <FaGlobeAsia className="w-6 h-6" />
    },
    {
      title: 'Customer Partnership',
      description: 'We view our clients as partners in a shared journey toward business growth.',
      icon: <FaPuzzlePiece className="w-6 h-6" />
    }
  ];
  
  // Certifications data
  const certifications = [
    {
      name: 'ISO 9001:2015',
      issuer: 'International Organization for Standardization',
      description: 'Quality Management System',
      year: '2021',
      icon: <FaCertificate />
    },
    {
      name: 'SEDEX',
      issuer: 'Supplier Ethical Data Exchange',
      description: 'Supply Chain Ethics Compliance',
      year: '2020',
      icon: <FaCertificate />
    },
    {
      name: 'Authorized Economic Operator',
      issuer: 'World Customs Organization',
      description: 'AEO Export & Import Certified',
      year: '2019',
      icon: <FaCertificate />
    },
    {
      name: 'Global Freight Alliance',
      issuer: 'International Freight Forwarder Association',
      description: 'Premium Member',
      year: '2018',
      icon: <FaShippingFast />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <HomeNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-r from-red-600 to-black">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-white/5 transform -skew-x-12"></div>
          <div className="absolute right-0 bottom-0 h-1/2 w-1/3 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            About Sinosply
          </motion.h1>
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-red-100 max-w-3xl mx-auto text-lg mb-8"
          >
            Your trusted partner for China sourcing and global supply chain solutions
          </motion.p>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-red-600 mb-6"></div>
              <p className="text-gray-600 mb-6">
                Founded in 2014, Sinosply began with a simple mission: to make sourcing from China accessible, 
                transparent, and hassle-free for businesses of all sizes.
              </p>
              <p className="text-gray-600 mb-6">
                Our founder, Benjie Agyare, experienced firsthand the challenges businesses face when trying to 
                navigate China's complex manufacturing landscape. After 15 years in international trade and 
                supply chain management, he assembled a team of experts to create a comprehensive sourcing 
                solution.
              </p>
              <p className="text-gray-600">
                Today, Sinosply has grown from a small team to a network of over 50 professionals across Ghana 
                and China, connecting businesses with over 2,000 verified manufacturers and handling millions in 
                procurement annually. Our success is built on our commitment to quality, transparency, and 
                unparalleled customer service.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-black/5 rounded-lg transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1607611439230-fcbf50e42f7c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                alt="Sinosply headquarters" 
                className="relative z-10 rounded-lg shadow-lg object-cover w-full h-full"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <div className="mt-2 w-24 h-1 bg-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              The core principles that guide everything we do
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center mb-4 text-red-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Meet Our Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
            <div className="mt-2 w-24 h-1 bg-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Expert professionals dedicated to your sourcing success
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-6 border-t-2 border-red-600">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-red-600 text-sm mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Certifications Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Our Certifications</h2>
            <div className="mt-2 w-24 h-1 bg-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              International standards and certifications that validate our quality and ethical practices
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <motion.div 
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Certificate Background with Border */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg transform rotate-1"></div>
                
                {/* Main Certificate */}
                <div className="relative bg-white border-4 border-double border-amber-300 rounded-lg p-6 shadow-md overflow-hidden">
                  {/* Gold Seal */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full opacity-20"></div>
                  
                  {/* Red Ribbon */}
                  <div className="absolute -top-1 -right-1 w-16 h-16">
                    <div className="absolute transform rotate-45 w-32 h-4 bg-red-600 right-0 top-6"></div>
                  </div>
                  
                  {/* Certificate Content */}
                  <div className="text-center mb-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white text-2xl">
                        {cert.icon}
                      </div>
                    </div>
                    
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{cert.issuer}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{cert.name}</h3>
                    <div className="w-12 h-1 bg-amber-300 mx-auto my-2"></div>
                    <p className="text-sm font-medium text-gray-700 mb-3">{cert.description}</p>
                    
                    <div className="flex items-center justify-center">
                      <div className="px-3 py-1 bg-amber-50 text-amber-800 text-xs rounded-full border border-amber-200">
                        Since {cert.year}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to work with us?</h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
              Start your sourcing journey with Sinosply today and experience the difference of having a dedicated partner on the ground in China.
            </p>
            <a 
              href="/quote" 
              className="inline-flex items-center px-6 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors duration-300"
            >
              Request a Quote
            </a>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About; 