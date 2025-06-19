import React from 'react';

const SinosplyLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-black">Sinosply Stores</h1>
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </div>
      <style jsx="true">{`
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #000;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SinosplyLoader; 