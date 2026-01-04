import apiConfig from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const axiosInstance = axios.create({
    baseURL: apiConfig.API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 5000
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        } catch { }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest: any = error?.config || {};

        // Handle 401 Unauthorized - try to refresh token
        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                if (!refreshToken) throw error;
                const res = await axios.post(
                    `${apiConfig.API_BASE_URL}auth/refresh`,
                    { refreshToken }
                );
                const newToken = res?.data?.token;
                if (newToken) {
                    await AsyncStorage.setItem("accessToken", newToken);
                    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch {
                await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userProfile"]);
            }
        }

        // Enhance error with user-friendly message
        const enhancedError = { ...error };

        // Check for network errors
        if (!error?.response) {
            if (error?.code === 'NETWORK_ERROR' ||
                error?.message?.includes('Network Error') ||
                error?.message?.includes('network request failed') ||
                error?.code === 'ECONNREFUSED' ||
                error?.code === 'ENOTFOUND' ||
                error?.code === 'ECONNABORTED' ||
                error?.message?.includes('timeout') ||
                error?.message?.includes('ETIMEDOUT')) {
                enhancedError.userMessage = 'Mất kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
            } else if (error?.request && !error?.response) {
                enhancedError.userMessage = 'Mất kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
            }
        } else {
            // Server responded with error status
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.message || error?.response?.data?.error;

            // Use server message if available and not technical
            if (serverMessage && typeof serverMessage === 'string' &&
                !serverMessage.toLowerCase().includes('axios') &&
                !serverMessage.toLowerCase().includes('network') &&
                !serverMessage.toLowerCase().includes('timeout')) {
                enhancedError.userMessage = serverMessage;
            } else {
                // Use status-based message
                switch (status) {
                    case 400:
                        enhancedError.userMessage = 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
                        break;
                    case 401:
                        enhancedError.userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                        break;
                    case 403:
                        enhancedError.userMessage = 'Bạn không có quyền truy cập.';
                        break;
                    case 404:
                        enhancedError.userMessage = 'Không tìm thấy dữ liệu.';
                        break;
                    case 422:
                        enhancedError.userMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
                        break;
                    case 500:
                        enhancedError.userMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
                        break;
                    case 503:
                        enhancedError.userMessage = 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
                        break;
                    default:
                        enhancedError.userMessage = serverMessage || 'Đã xảy ra lỗi. Vui lòng thử lại.';
                }
            }
        }

        return Promise.reject(enhancedError);
    }
);

export default axiosInstance;
