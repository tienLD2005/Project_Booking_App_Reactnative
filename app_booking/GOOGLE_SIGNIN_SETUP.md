# Hướng dẫn cấu hình Google Sign-In

## Bước 1: Tạo Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo một project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn application type:
   - **Web application** (cho Expo development)
   - **iOS** (nếu build cho iOS)
   - **Android** (nếu build cho Android)
6. Điền thông tin:
   - **Name**: Tên ứng dụng của bạn
   - **Authorized redirect URIs**: 
     - `https://auth.expo.io/@your-username/your-app-slug` (cho Expo development)
     - Hoặc redirect URI được tạo tự động bởi `expo-auth-session`
7. Copy **Client ID** (có dạng: `xxxxx.apps.googleusercontent.com`)

## Bước 2: Cấu hình trong ứng dụng

1. Mở file `app/login.tsx`
2. Tìm dòng:
   ```typescript
   clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
   ```
3. Thay thế `YOUR_GOOGLE_CLIENT_ID` bằng Client ID thật của bạn

## Bước 3: Cấu hình Backend API

Backend cần có endpoint `/api/v1/auth/google` để xử lý Google Sign-In:

```java
@PostMapping("/google")
public ResponseEntity<APIResponse<AuthResponse>> googleSignIn(@RequestBody GoogleSignInRequest request) {
    // Xác thực accessToken với Google
    // Tạo hoặc tìm user trong database
    // Tạo JWT token và refresh token
    // Trả về token và user info
}
```

Request body:
```json
{
  "accessToken": "google_access_token"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt_access_token",
    "refreshToken": "refresh_token",
    "fullName": "User Name",
    "email": "user@gmail.com",
    "phone": "0123456789"
  }
}
```

## Lưu ý

- Trong môi trường development, `expo-auth-session` sẽ sử dụng proxy để xử lý redirect
- Khi build production, cần cấu hình redirect URI chính xác
- Đảm bảo backend có thể xác thực Google access token

