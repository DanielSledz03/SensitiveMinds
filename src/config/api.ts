// API Configuration
// Change this URL when deploying to different environments
export const API_CONFIG = {
  BASE_URL: 'https://sensitiveminds-backend-production.up.railway.app',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Environment-specific configurations
export const getApiUrl = (): string => {
  // You can add environment detection here
  // For example: process.env.NODE_ENV === 'production' ? productionUrl : developmentUrl
  return API_CONFIG.BASE_URL;
};
