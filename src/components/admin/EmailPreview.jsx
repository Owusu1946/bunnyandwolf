import React from 'react';

/**
 * EmailPreview component - Renders a preview of an email campaign with customizable templates
 * 
 * @param {Object} props
 * @param {string} props.template - Template ID ('default', 'promotional', 'newsletter', 'announcement')
 * @param {string} props.subject - Email subject line
 * @param {string} props.content - HTML content of the email
 * @param {string} props.previewMode - Display mode ('desktop' or 'mobile')
 * @returns {JSX.Element} Email preview component
 */
const EmailPreview = ({ template, subject, content, previewMode = 'desktop' }) => {
  // Date for the email header
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Sample product data for showcase
  const sampleProducts = [
    {
      name: 'Premium Cotton T-Shirt',
      price: 'GH₵ 149.99',
      discount: 'GH₵ 199.99',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format',
      badge: 'New Arrival'
    },
    {
      name: 'Slim Fit Denim Jeans',
      price: 'GH₵ 299.99',
      discount: 'GH₵ 350.00',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format',
      badge: '15% Off'
    },
    {
      name: 'Classic Leather Bag',
      price: 'GH₵ 499.99',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format',
      badge: 'Trending'
    }
  ];
  
  // Enhanced template styles
  const templateStyles = {
    default: {
      headerColor: 'linear-gradient(135deg, #6B46C1, #805AD5)', // Purple gradient
      accentColor: '#6B46C1',
      secondaryColor: '#9F7AEA',
      bgColor: '#F9FAFB',
      textColor: '#111827',
      secondaryTextColor: '#4B5563',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      buttonStyle: {
        backgroundColor: '#6B46C1',
        hoverColor: '#5A32AC',
        textColor: 'white'
      }
    },
    promotional: {
      headerColor: 'linear-gradient(135deg, #F97316, #FDBA74)', // Orange gradient
      accentColor: '#F97316',
      secondaryColor: '#FB923C',
      bgColor: '#FFFBEB',
      textColor: '#7C2D12',
      secondaryTextColor: '#9A3412',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      buttonStyle: {
        backgroundColor: '#F97316',
        hoverColor: '#EA580C',
        textColor: 'white'
      }
    },
    newsletter: {
      headerColor: 'linear-gradient(135deg, #0EA5E9, #38BDF8)', // Blue gradient
      accentColor: '#0EA5E9',
      secondaryColor: '#7DD3FC',
      bgColor: '#F0F9FF',
      textColor: '#075985',
      secondaryTextColor: '#0369A1',
      fontFamily: 'Georgia, "Times New Roman", serif',
      buttonStyle: {
        backgroundColor: '#0EA5E9',
        hoverColor: '#0284C7',
        textColor: 'white'
      }
    },
    announcement: {
      headerColor: 'linear-gradient(135deg, #10B981, #34D399)', // Green gradient
      accentColor: '#10B981',
      secondaryColor: '#6EE7B7',
      bgColor: '#ECFDF5',
      textColor: '#065F46',
      secondaryTextColor: '#047857',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      buttonStyle: {
        backgroundColor: '#10B981',
        hoverColor: '#059669',
        textColor: 'white'
      }
    }
  };
  
  // Get the styles based on selected template
  const currentStyle = templateStyles[template] || templateStyles.default;

  // Product Showcase Component
  const ProductShowcase = () => {
    return (
      <div>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '30px 0 20px',
          color: currentStyle.textColor
        }}>
          Featured Products
        </h4>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '15px'
        }}>
          {sampleProducts.slice(0, previewMode === 'mobile' ? 1 : 3).map((product, index) => (
            <div key={index} style={{
              width: previewMode === 'mobile' ? '100%' : 'calc(33.33% - 10px)',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{
                position: 'relative',
                height: '160px',
                overflow: 'hidden'
              }}>
                {product.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '0',
                    backgroundColor: currentStyle.accentColor,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    borderTopRightRadius: '4px',
                    borderBottomRightRadius: '4px',
                    zIndex: 1
                  }}>
                    {product.badge}
                  </div>
                )}
                <img 
                  src={product.image} 
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{padding: '12px'}}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: currentStyle.textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {product.name}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                      color: currentStyle.accentColor
                    }}>
                      {product.price}
                    </span>
                    {product.discount && (
                      <div style={{
                        fontSize: '12px',
                        textDecoration: 'line-through',
                        color: '#888'
                      }}>
                        {product.discount}
                      </div>
                    )}
                  </div>
                  <a href="#" style={{
                    backgroundColor: currentStyle.accentColor,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}>
                    BUY NOW
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Special Promo component based on template type
  const SpecialPromo = () => {
    if (template === 'promotional') {
      return (
        <div style={{
          backgroundColor: '#FFF7ED',
          border: `2px dashed ${currentStyle.accentColor}`,
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center',
          margin: '25px 0'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: currentStyle.secondaryTextColor,
            marginBottom: '5px'
          }}>
            LIMITED TIME OFFER
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: currentStyle.accentColor,
            marginBottom: '8px'
          }}>
            GET 25% OFF YOUR FIRST ORDER
          </div>
          <div style={{
            backgroundColor: currentStyle.accentColor,
            color: 'white',
            fontWeight: 'bold',
            padding: '8px',
            maxWidth: '200px',
            margin: '0 auto',
            borderRadius: '4px',
            fontSize: '16px',
            letterSpacing: '1px'
          }}>
            CODE: SINOSPLY25
          </div>
          <div style={{
            fontSize: '12px',
            color: currentStyle.secondaryTextColor,
            marginTop: '8px'
          }}>
            Valid until {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
          </div>
        </div>
      );
    }
    
    if (template === 'announcement') {
      return (
        <div style={{
          backgroundColor: '#ECFDF5',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          margin: '25px 0'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: currentStyle.accentColor,
            marginBottom: '10px'
          }}>
            🎉 NEW COLLECTION LAUNCH 🎉
          </div>
          <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: currentStyle.textColor
          }}>
            Explore our latest designs, crafted with premium materials and attention to detail.
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className={`overflow-auto border rounded-lg ${previewMode === 'mobile' ? 'w-[375px] mx-auto' : 'w-full'}`} 
         style={{maxHeight: '600px'}}>
      <div style={{
        backgroundColor: '#f4f4f7', // Light grey background for email body
        fontFamily: currentStyle.fontFamily,
        color: currentStyle.textColor,
        padding: previewMode === 'mobile' ? '10px' : '20px',
      }}>
        {/* Email Container */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          {/* Email Header */}
          <div style={{
            background: currentStyle.headerColor,
            padding: '25px 20px',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Logo and Brand */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: currentStyle.accentColor
                }}>S</span>
              </div>
              <h2 style={{margin: 0, fontSize: previewMode === 'mobile' ? '18px' : '24px', color: 'white'}}>
                SINOSPLY
              </h2>
            </div>
            
            {/* View in Browser Link */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              fontSize: '10px'
            }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                View in browser
              </a>
            </div>
          </div>
          
          {/* Email Content Section */}
          <div style={{
            padding: previewMode === 'mobile' ? '15px' : '25px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#888888',
              marginBottom: '15px',
              textAlign: 'right'
            }}>
              {currentDate}
            </div>
            
            {/* Subject Line */}
            <h3 style={{
              borderBottom: `2px solid ${currentStyle.accentColor}`,
              paddingBottom: '12px',
              marginBottom: '20px',
              color: currentStyle.textColor,
              fontSize: previewMode === 'mobile' ? '18px' : '22px'
            }}>
              {subject || "Your Campaign Subject Line"}
            </h3>
            
            {/* Special Promotion Banner based on template */}
            <SpecialPromo />
            
            {/* Email Content */}
            <div style={{
              lineHeight: '1.6',
              fontSize: previewMode === 'mobile' ? '14px' : '16px',
            }}>
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p>Your email content will appear here. Start typing in the content area to see your email take shape!</p>
              )}
            </div>
            
            {/* Product Showcase */}
            <ProductShowcase />
            
            {/* Call to Action Button */}
            <div style={{
              textAlign: 'center',
              margin: '30px 0',
            }}>
              <a href="#" style={{
                background: `linear-gradient(to right, ${currentStyle.accentColor}, ${currentStyle.secondaryColor})`,
                color: 'white',
                padding: '14px 28px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '14px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                Shop The Collection
              </a>
            </div>
            
            {/* Social Proof */}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '8px',
              margin: '20px 0'
            }}>
              <div style={{
                fontWeight: '600',
                marginBottom: '10px',
                fontSize: '15px',
                textAlign: 'center',
                color: currentStyle.textColor
              }}>
                What Our Customers Say
              </div>
              <p style={{
                margin: '0',
                fontSize: '13px',
                fontStyle: 'italic',
                textAlign: 'center',
                color: '#555'
              }}>
                "The quality is amazing and delivery was super fast! Will definitely shop here again."
              </p>
              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: currentStyle.accentColor
              }}>
                – Sarah T., Accra
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{
            borderTop: '1px solid #eee',
            backgroundColor: '#f9f9f9',
            padding: '20px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
          }}>
            {/* Social Media Icons */}
            <div style={{ marginBottom: '15px' }}>
              <a href="#" style={{
                display: 'inline-block',
                margin: '0 5px',
                width: '30px',
                height: '30px',
                lineHeight: '30px',
                textAlign: 'center',
                backgroundColor: '#f1f1f1',
                borderRadius: '50%',
                color: currentStyle.accentColor,
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>f</a>
              <a href="#" style={{
                display: 'inline-block',
                margin: '0 5px',
                width: '30px',
                height: '30px',
                lineHeight: '30px',
                textAlign: 'center',
                backgroundColor: '#f1f1f1',
                borderRadius: '50%',
                color: currentStyle.accentColor,
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>t</a>
              <a href="#" style={{
                display: 'inline-block',
                margin: '0 5px',
                width: '30px',
                height: '30px',
                lineHeight: '30px',
                textAlign: 'center',
                backgroundColor: '#f1f1f1',
                borderRadius: '50%',
                color: currentStyle.accentColor,
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>in</a>
              <a href="#" style={{
                display: 'inline-block',
                margin: '0 5px',
                width: '30px',
                height: '30px',
                lineHeight: '30px',
                textAlign: 'center',
                backgroundColor: '#f1f1f1',
                borderRadius: '50%',
                color: currentStyle.accentColor,
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>ig</a>
            </div>
            
            <p style={{marginBottom: '8px'}}>
              &copy; {new Date().getFullYear()} Sinosply. All rights reserved.
            </p>
            <p style={{marginBottom: '12px'}}>
              123 Fashion Street, Accra, Ghana
            </p>
            
            <div style={{marginBottom: '15px'}}>
              <a href="#" style={{color: currentStyle.accentColor, textDecoration: 'none', margin: '0 8px'}}>Unsubscribe</a>
              <a href="#" style={{color: currentStyle.accentColor, textDecoration: 'none', margin: '0 8px'}}>Privacy Policy</a>
              <a href="#" style={{color: currentStyle.accentColor, textDecoration: 'none', margin: '0 8px'}}>Contact Us</a>
            </div>
            
            <p style={{fontSize: '11px', color: '#888', maxWidth: '400px', margin: '0 auto'}}>
              You received this email because you signed up for updates from Sinosply.
              Please add <strong>hello@sinosply.com</strong> to your contacts to ensure our emails reach your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview; 