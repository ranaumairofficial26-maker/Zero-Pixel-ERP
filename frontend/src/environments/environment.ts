const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: true,
  apiUrl: isLocal ? 'http://localhost:5282/api' : 'https://zero-pixel-erp.onrender.com/api'
};

