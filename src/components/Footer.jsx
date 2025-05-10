import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaApple, FaGooglePlay, FaTiktok, FaFacebookF, FaInstagram, FaSnapchatGhost, FaYoutube, FaPinterestP } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>HELP</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/track-order">Track Order</Link></li>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/sizing">Sizing</Link></li>
            <li><Link to="/care-guide">Care Guide</Link></li>
            <li><Link to="/afterpay">Afterpay</Link></li>
            <li><Link to="/klarna">Klarna</Link></li>
            <li><Link to="/shop-pay">Shop Pay</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>MORE POLLY</h3>
          <ul>
            <li><Link to="/gift-cards">Gift Cards</Link></li>
            <li><Link to="/rewards">Rewards</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/give-get">Give $15, Get $15</Link></li>
            <li><Link to="/promotions">Promotions</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>LOWER IMPACT</h3>
          <ul>
            <li><Link to="/social-responsibility">Social Responsibility</Link></li>
            <li><Link to="/ethical-sourcing">Ethical Sourcing</Link></li>
            <li><Link to="/about-lower-impact">About Lower Impact</Link></li>
            <li><Link to="/sustainability">Sustainability & Environment</Link></li>
            <li><Link to="/equality">Equality & Community</Link></li>
            <li><Link to="/transparency">California Transparency Act</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>GET IN TOUCH</h3>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/store-locator">Store Locator</Link></li>
            <li><Link to="/collabs">Collabs</Link></li>
            <li><Link to="/ambassador">College Ambassador</Link></li>
            <li><Link to="/affiliate">Affiliate Program</Link></li>
            <li><Link to="/accessibility">Accessibility</Link></li>
            <li><Link to="/cookies">Cookies Settings</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>DOWNLOAD OUR APP</h3>
          <div className="app-buttons">
            <a href="https://apps.apple.com/us/app" target="_blank" rel="noopener noreferrer" className="app-store-button">
              <FaApple /> ON THE APP STORE
            </a>
            <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer" className="google-play-button">
              <FaGooglePlay /> ON GOOGLE PLAY
            </a>
          </div>
          <div className="rating">
            <div className="stars">☆☆☆☆☆</div>
            <div className="rating-text">No rating available</div>
          </div>
        </div>

        <div className="footer-section">
          <h3>SIGN UP FOR 15% OFF</h3>
          <div className="signup-form">
            <input type="text" placeholder="ENTER PHONE NUMBER" />
            <button type="submit">→</button>
          </div>
          <p className="terms">
            By signing up via text you agree to receive recurring automated marketing messages and shopping cart reminders at the phone number provided. Consent is not a condition of purchase. Reply stop to unsubscribe. Help for help. MSG & Data Rates May Apply. View <Link to="/privacy">Privacy Policy</Link> and <Link to="/tos">TOS</Link>
          </p>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <div className="social-links">
          <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"><FaTiktok /></a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://www.snapchat.com" target="_blank" rel="noopener noreferrer"><FaSnapchatGhost /></a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
          <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer"><FaPinterestP /></a>
        </div>

        <div className="store-selector">
          <span className="flag-icon">🇺🇸</span> YOURE ON OUR USA STORE - CHANGE TO <a href="#">AUS HERE</a>
        </div>

        <div className="legal-links">
          <span>©SINOSPLY WEBSITE USA</span>
          <span className="separator">|</span>
          <Link to="/terms-of-sale">TERMS OF SALE</Link>
          <span className="separator">|</span>
          <Link to="/terms-of-use">TERMS OF USE</Link>
          <span className="separator">|</span>
          <Link to="/privacy-policy">PRIVACY POLICY</Link>
          <span className="separator">|</span>
          <Link to="/sitemap">SITEMAP</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
