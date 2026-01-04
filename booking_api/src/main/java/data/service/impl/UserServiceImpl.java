package data.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import data.dto.request.ChangePasswordRequest;
import data.dto.request.ForgotPasswordRequest;
import data.dto.request.ResetPasswordRequest;
import data.dto.request.UpdateProfileRequest;
import data.dto.request.UserLogin;
import data.dto.request.UserRegister;
import data.dto.response.JWTResponse;
import data.dto.response.UserResponseDTO;
import data.entity.Otp;
import data.entity.User;
import data.mapper.UserMapper;
import data.repository.OtpRepository;
import data.repository.UserRepository;
import data.security.jwt.JWTProvider;
import data.security.pricipal.CustomUserDetails;
import data.service.OtpService;
import data.service.UserService;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JWTProvider jwtProvider;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private OtpService otpService;
    @Autowired
    private OtpRepository otpRepository;

    @Override
    @Transactional
    public User registerUser(UserRegister userRegister) {
        if (userRepository.existsByEmail(userRegister.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        if (userRepository.existsByPhoneNumber(userRegister.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        
        // Tạo password tạm thời (sẽ được thay đổi sau khi verify OTP và set password)
        String tempPassword = "TEMP_PASSWORD_" + System.currentTimeMillis();
        
        User user = User.builder()
                .fullName(userRegister.getFullName())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .email(userRegister.getEmail())
                .phoneNumber(userRegister.getPhoneNumber())
                .dateOfBirth(userRegister.getDateOfBirth())
                .gender(userRegister.getGender())
                .enabled(false) // Chưa được kích hoạt cho đến khi verify OTP và set password
                .build();
        userRepository.save(user);
        
        // Tạo và gửi OTP
        otpService.createOtp(user);
        
        log.info("User registered: {}, waiting for OTP verification", user.getEmail());
        return user;
    }

    @Override
    @Transactional
    public void setPassword(String phoneNumber, String password) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Otp otp = otpRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP. Vui lòng xác thực OTP trước."));

        if (!otp.isVerified()) {
            throw new RuntimeException("Vui lòng xác thực OTP trước khi đặt mật khẩu");
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEnabled(true);
        userRepository.save(user);

        // Xóa OTP theo user thay vì xóa instance đang managed
        otpRepository.deleteByUser(user);

        log.info("Password set successfully for user: {}", phoneNumber);
    }


    @Override
    public JWTResponse login(UserLogin userLogin) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLogin.getEmail(), userLogin.getPassword()));
        } catch (AuthenticationException e) {
            log.error("Sai email hoặc password!");
            throw new RuntimeException("Đăng nhập thất bại!");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return JWTResponse.builder()
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .build();
    }

    @Override
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

    }

    @Override
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));
    }

    @Override
    @Transactional
    public UserResponseDTO updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        
        // Kiểm tra email đã tồn tại chưa (nếu đổi email)
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email đã tồn tại");
            }
        }
        
        // Nếu đổi số điện thoại, cần verify OTP
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
            // Kiểm tra số điện thoại mới đã tồn tại chưa
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã tồn tại");
            }
            
            if (request.getOtp() == null || request.getOtp().isEmpty()) {
                // Gửi OTP đến số điện thoại mới
                otpService.createOtpForPhoneChange(user, request.getPhoneNumber());
                throw new RuntimeException("Vui lòng nhập OTP đã được gửi đến số điện thoại mới");
            }
            
            // Verify OTP với user hiện tại
            boolean isValidOtp = otpService.verifyOtpForUser(request.getOtp(), user);
            if (!isValidOtp) {
                throw new RuntimeException("OTP không đúng hoặc đã hết hạn");
            }
        }
        
        // Cập nhật thông tin
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        
        user = userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());
        
        return UserMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        
        // Xác thực mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với số điện thoại này"));
        
        // Tạo và gửi OTP
        otpService.createOtp(user);
        
        log.info("OTP sent for password reset to phone: {}", request.getPhoneNumber());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        
        // Validate OTP đã được verify (từ bước verify-otp screen) và chưa hết hạn
        boolean isValidOtp = otpService.validateOtpForReset(request.getOtp(), request.getPhoneNumber());
        if (!isValidOtp) {
            throw new RuntimeException("OTP không đúng, chưa được xác thực hoặc đã hết hạn");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setEnabled(true);
        userRepository.save(user);
        
        // Xóa OTP sau khi reset password thành công
        Otp otp = otpRepository.findByUser(user).orElse(null);
        if (otp != null) {
            otpRepository.delete(otp);
        }
        
        log.info("Password reset successfully for user: {}", request.getPhoneNumber());
    }
}
