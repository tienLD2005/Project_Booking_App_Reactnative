package data.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import data.dto.request.ChangePasswordRequest;
import data.dto.request.ForgotPasswordRequest;
import data.dto.request.RefreshTokenRequest;
import data.dto.request.ResendOtpRequest;
import data.dto.request.ResetPasswordRequest;
import data.dto.request.SetPasswordRequest;
import data.dto.request.UpdateProfileRequest;
import data.dto.request.UserLogin;
import data.dto.request.UserRegister;
import data.dto.request.VerifyOtpRequest;
import data.dto.response.APIResponse;
import data.dto.response.JWTResponse;
import data.dto.response.UserResponseDTO;
import data.entity.User;
import data.mapper.UserMapper;
import data.repository.UserRepository;
import data.security.jwt.JWTProvider;
import data.service.OtpService;
import data.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:8081")

public class AccountController {
    private final UserService userService;
    private final OtpService otpService;
    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final JWTProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final HttpServletRequest request;

    @PostMapping("/register")
    public ResponseEntity<APIResponse<UserResponseDTO>> registerUser(@Valid @RequestBody UserRegister userRegister) {
        try {
            User user = userService.registerUser(userRegister);
            UserResponseDTO dto = UserMapper.toDTO(user);
            return ResponseEntity.ok(APIResponse.success(dto, "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP."));
        } catch (RuntimeException e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(400)
                    .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<APIResponse<Map<String, String>>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean isValid = otpService.verifyOtp(request.getOtp(), request.getPhoneNumber());
        if (!isValid) {
            return ResponseEntity.status(400)
                    .body(APIResponse.error("Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.", null));
        }
        return ResponseEntity.ok(APIResponse.success(
                Map.of("message", "Xác thực OTP thành công. Vui lòng đặt mật khẩu."),
                "Xác thực OTP thành công"));
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<APIResponse<Map<String, String>>> completeRegistration(@Valid @RequestBody SetPasswordRequest request) {
        try {
            userService.setPassword(request.getPhoneNumber(), request.getPassword());
            return ResponseEntity.ok(APIResponse.success(
                    Map.of("message", "Đăng ký hoàn tất thành công. Bạn có thể đăng nhập ngay."),
                    "Đăng ký hoàn tất thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<APIResponse<Map<String, String>>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        try {
            otpService.resendOtp(request.getPhoneNumber());
            return ResponseEntity.ok(APIResponse.success(
                    Map.of("message", "Mã OTP mới đã được gửi (vui lòng kiểm tra email hoặc tin nhắn)."),
                    "Gửi lại OTP thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLogin userLogin, HttpServletRequest request) {
        log.info("Login request: email={}, password={}", userLogin.getEmail(), userLogin.getPassword());
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(userLogin.getEmail(), userLogin.getPassword())
        );

        User user = userRepository.findByEmail(userLogin.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!user.isEnabled()) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Tài khoản chưa được kích hoạt. Vui lòng hoàn tất đăng ký."));
        }

        String authorities = auth.getAuthorities() == null ? "" : String.join(
                ",",
                auth.getAuthorities().stream().map(a -> a.getAuthority()).toList()
        );

        String accessToken = jwtProvider.generateToken(user.getEmail(), authorities);
        String refreshToken = jwtProvider.generateRefreshToken(user.getEmail(), authorities);

        JWTResponse response = new JWTResponse(
                user,
                accessToken,
                refreshToken,
                authorities
        );

        return ResponseEntity.ok(response);

    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest body) {
        String refreshToken = body.getRefreshToken();
        if (refreshToken == null || !jwtProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token không hợp lệ"));
        }
        String email = jwtProvider.getUsernameFromToken(refreshToken);
        String newAccessToken = jwtProvider.generateToken(email, "");
        return ResponseEntity.ok(Map.of("token", newAccessToken));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleSignIn(@RequestBody Map<String, String> request) {
        try {
            String accessToken = request.get("accessToken");
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.status(400)
                    .body(Map.of("message", "Access token không được để trống"));
            }

            // Verify Google access token và lấy thông tin user
            // Sử dụng RestTemplate để gọi Google API
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String googleApiUrl = "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken;
            
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> googleUserInfo = restTemplate.getForObject(googleApiUrl, Map.class);
                
                if (googleUserInfo == null) {
                    return ResponseEntity.status(400)
                        .body(Map.of("message", "Không thể xác thực với Google"));
                }

                String email = (String) googleUserInfo.get("email");
                String fullName = (String) googleUserInfo.get("name");

                if (email == null) {
                    return ResponseEntity.status(400)
                        .body(Map.of("message", "Không thể lấy email từ Google"));
                }

                // Tìm hoặc tạo user
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user == null) {
                    // Tạo user mới nếu chưa tồn tại
                    user = new User();
                    user.setEmail(email);
                    user.setFullName(fullName != null ? fullName : "Google User");
                    user.setEnabled(true);
                    // Tạo password ngẫu nhiên (user sẽ không dùng password để login)
                    user.setPasswordHash(passwordEncoder.encode("GOOGLE_AUTH_" + System.currentTimeMillis()));
                    user = userRepository.save(user);
                    log.info("Created new user from Google Sign-In: {}", email);
                } else {
                    // Cập nhật thông tin nếu cần
                    if (fullName != null && !fullName.equals(user.getFullName())) {
                        user.setFullName(fullName);
                        userRepository.save(user);
                    }
                }

                if (!user.isEnabled()) {
                    user.setEnabled(true);
                    userRepository.save(user);
                }

                // Tạo JWT tokens
                String authorities = "";
                String jwtAccessToken = jwtProvider.generateToken(user.getEmail(), authorities);
                String jwtRefreshToken = jwtProvider.generateRefreshToken(user.getEmail(), authorities);

                JWTResponse response = new JWTResponse(
                    user,
                    jwtAccessToken,
                    jwtRefreshToken,
                    authorities
                );

                return ResponseEntity.ok(response);
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                log.error("Google API error: {}", e.getMessage());
                return ResponseEntity.status(400)
                    .body(Map.of("message", "Access token không hợp lệ hoặc đã hết hạn"));
            }
        } catch (Exception e) {
            log.error("Google Sign-In error: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("message", "Lỗi khi xử lý đăng nhập Google: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<APIResponse<UserResponseDTO>> getCurrentUser() {
        try {
            User user = userService.getCurrentUser();
            UserResponseDTO dto = UserMapper.toDTO(user);
            return ResponseEntity.ok(APIResponse.success(dto, "Lấy thông tin user thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<APIResponse<UserResponseDTO>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            UserResponseDTO dto = userService.updateProfile(request);
            return ResponseEntity.ok(APIResponse.success(dto, "Cập nhật thông tin thành công"));
        } catch (RuntimeException e) {
            // Nếu là lỗi yêu cầu OTP, trả về 200 với message
            if (e.getMessage().contains("OTP")) {
                return ResponseEntity.ok(APIResponse.error(e.getMessage(), null));
            }
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<APIResponse<Map<String, String>>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(request);
            return ResponseEntity.ok(APIResponse.success(
                Map.of("message", "Đổi mật khẩu thành công"),
                "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<APIResponse<Map<String, String>>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            userService.forgotPassword(request);
            return ResponseEntity.ok(APIResponse.success(
                Map.of("message", "OTP đã được gửi đến số điện thoại của bạn"),
                "Gửi OTP thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<APIResponse<Map<String, String>>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request);
            return ResponseEntity.ok(APIResponse.success(
                Map.of("message", "Đặt lại mật khẩu thành công"),
                "Đặt lại mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
}
