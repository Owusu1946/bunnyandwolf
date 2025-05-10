/**
 * Notification Service for handling sound alerts and browser notifications
 */

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.isMuted = localStorage.getItem('chat_notifications_muted') === 'true';
    this.lastPlayed = 0;
    this.cooldownPeriod = 3000; // Minimum time between sounds in ms
    this.audioElements = {};
    
    // Initialize notification permissions
    this.initialize();
  }
  
  // Initialize notification permissions
  async initialize() {
    // Create audio elements for various notification sounds
    this.createAudioElements();
    
    // Check if browser supports notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.hasPermission = true;
      } else if (Notification.permission !== 'denied') {
        try {
          const permission = await Notification.requestPermission();
          this.hasPermission = permission === 'granted';
        } catch (err) {
          console.error('Error requesting notification permission:', err);
        }
      }
    }
  }
  
  createAudioElements() {
    // Create an audio element for message notification
    this.audioElements.message = new Audio();
    this.audioElements.message.src = '/assets/sounds/message.mp3';
    this.audioElements.message.preload = 'auto';
    this.audioElements.message.volume = 0.5;
    
    // Create a fallback sound if the file doesn't exist
    this.audioElements.message.onerror = () => {
      // Create a fallback audio using AudioContext API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        this.audioElements.message = {
          play: () => {
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
          }
        };
      } catch (err) {
        console.error('Error creating fallback audio:', err);
      }
    };
  }
  
  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('chat_notifications_muted', this.isMuted);
    return this.isMuted;
  }
  
  // Play a sound for a new message
  playMessageSound() {
    if (this.isMuted) return;
    
    const now = Date.now();
    // Only play if cooldown period has passed
    if (now - this.lastPlayed > this.cooldownPeriod) {
      try {
        this.audioElements.message.play().catch(err => {
          console.warn('Error playing notification sound:', err);
        });
        this.lastPlayed = now;
      } catch (err) {
        console.error('Error playing notification sound:', err);
      }
    }
  }
  
  // Show a browser notification for a new message
  showMessageNotification(title, options = {}) {
    if (!this.hasPermission || document.hasFocus()) return;
    
    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options
      });
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Focus window when notification is clicked
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error('Error showing notification:', err);
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService; 