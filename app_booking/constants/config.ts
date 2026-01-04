/**
 * API Configuration
 * 
 * For mobile devices/emulators:
 * - Use your computer's IP address instead of localhost
 * - Find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
 * - Example: http://192.168.2.176:8080/api/v1/
 * 
 * For web:
 * - Can use localhost: http://localhost:8080/api/v1/
 */

// Get the IP address of your computer
// Replace this with your actual IP address
// You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = __DEV__
  ? "http://192.168.51.107:8080/api/v1/"
  // Development - use your computer's IP
  : "https://your-production-api.com/api/v1/"; // Production

export default {
  API_BASE_URL,
};

