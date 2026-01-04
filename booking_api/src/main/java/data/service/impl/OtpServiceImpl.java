package data.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import data.entity.Otp;
import data.entity.User;
import data.repository.OtpRepository;
import data.repository.UserRepository;
import data.service.OtpService;
import data.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {
    
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_LENGTH = 4; // Tạo 4 chữ số OTP

    @Override
    public String generateOtpCode() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Override
    @Transactional
    public Otp createOtp(User user) {
        // Tìm OTP cũ nếu có
        Optional<Otp> existingOtpOpt = otpRepository.findByUser(user);
        String otpCode = generateOtpCode();
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        
        Otp otp;
        if (existingOtpOpt.isPresent()) {
            // Cập nhật OTP cũ thay vì xóa và tạo mới để tránh duplicate key constraint
            otp = existingOtpOpt.get();
            otp.setOtpCode(otpCode);
            otp.setExpiredAt(expiredAt);
            otp.setVerified(false);
            otp = otpRepository.save(otp);
            log.info("OTP updated for user: {}, OTP: {}", user.getEmail(), otpCode);
        } else {
            // Tạo OTP mới nếu chưa có
            otp = Otp.builder()
                    .otpCode(otpCode)
                    .user(user)
                    .expiredAt(expiredAt)
                    .verified(false)
                    .build();
            otp = otpRepository.save(otp);
            log.info("OTP created for user: {}, OTP: {}", user.getEmail(), otpCode);
        }
        
        // Gửi OTP qua Email (ưu tiên)
        try {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                emailService.sendOtpEmail(user.getEmail(), otpCode);
                log.info("OTP sent to email: {}", user.getEmail());
            } else {
                // fallback to SMS/log
                sendOtpSms(user.getPhoneNumber(), otpCode);
            }
        } catch (MessagingException e) {
            // Nếu gửi email thất bại, fallback về SMS/log để đảm bảo người dùng vẫn nhận OTP
            log.warn("Failed to send OTP email to {}: {}. Falling back to SMS/log.", user.getEmail(), e.getMessage());
            sendOtpSms(user.getPhoneNumber(), otpCode);
        }

        return otp;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String otpCode, String phoneNumber) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            log.warn("User not found with phone number: {}", phoneNumber);
            return false;
        }

        User user = userOpt.get();
        Optional<Otp> otpOpt = otpRepository.findByOtpCodeAndUser(otpCode, user);
        
        if (otpOpt.isEmpty()) {
            log.warn("Invalid OTP code: {} for user: {}", otpCode, phoneNumber);
            return false;
        }

        Otp otp = otpOpt.get();
        
        // Kiểm tra OTP đã được verify chưa
        if (otp.isVerified()) {
            log.warn("OTP already verified for user: {}", phoneNumber);
            return false;
        }

        // Kiểm tra OTP hết hạn
        if (otp.getExpiredAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for user: {}", phoneNumber);
            otpRepository.delete(otp);
            return false;
        }

        // Đánh dấu OTP đã được verify
        otp.setVerified(true);
        otpRepository.save(otp);
        
        log.info("OTP verified successfully for user: {}", phoneNumber);
        return true;
    }

    @Override
    public boolean validateOtpForReset(String otpCode, String phoneNumber) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            log.warn("User not found with phone number: {}", phoneNumber);
            return false;
        }

        User user = userOpt.get();
        Optional<Otp> otpOpt = otpRepository.findByOtpCodeAndUser(otpCode, user);
        
        if (otpOpt.isEmpty()) {
            log.warn("Invalid OTP code: {} for user: {}", otpCode, phoneNumber);
            return false;
        }

        Otp otp = otpOpt.get();
        
        // Kiểm tra OTP đã được verify (đã verify ở bước verify-otp screen)
        if (!otp.isVerified()) {
            log.warn("OTP not verified yet for user: {}", phoneNumber);
            return false;
        }

        // Kiểm tra OTP hết hạn (kiểm tra thêm 5 phút sau khi verify)
        if (otp.getExpiredAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for user: {}", phoneNumber);
            return false;
        }
        
        log.info("OTP validated for reset password for user: {}", phoneNumber);
        return true;
    }

    @Override
    public void sendOtpSms(String phoneNumber, String otpCode) {
        try {
            // Log OTP ra console để dễ dàng lấy mã nhập (dùng cho development)
            System.out.println("\n");
            System.out.println("========================================");
            System.out.println("         MÃ OTP ĐĂNG KÝ");
            System.out.println("========================================");
            System.out.println("Số điện thoại: " + phoneNumber);
            System.out.println("MÃ OTP: " + otpCode);
            System.out.println("Thời gian hết hạn: " + OTP_EXPIRY_MINUTES + " phút");
            System.out.println("========================================");
            System.out.println("\n");
            
            log.info("OTP generated for phone: {}, OTP Code: {}", phoneNumber, otpCode);
        } catch (Exception e) {
            log.error("Error generating OTP for {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Không thể tạo OTP", e);
        }
    }

    @Override
    @Transactional
    public void resendOtp(String phoneNumber) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng với số điện thoại: " + phoneNumber);
        }

        User user = userOpt.get();
        createOtp(user);
        log.info("OTP resent to phone: {}", phoneNumber);
    }

    @Override
    @Transactional
    public Otp createOtpForPhoneChange(User user, String newPhoneNumber) {
        // Tìm OTP cũ nếu có
        Optional<Otp> existingOtpOpt = otpRepository.findByUser(user);
        String otpCode = generateOtpCode();
        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        
        Otp otp;
        if (existingOtpOpt.isPresent()) {
            // Cập nhật OTP cũ thay vì xóa và tạo mới để tránh duplicate key constraint
            otp = existingOtpOpt.get();
            otp.setOtpCode(otpCode);
            otp.setExpiredAt(expiredAt);
            otp.setVerified(false);
            otp = otpRepository.save(otp);
            log.info("OTP updated for phone change - user: {}, new phone: {}, OTP: {}", user.getEmail(), newPhoneNumber, otpCode);
        } else {
            // Tạo OTP mới nếu chưa có
            otp = Otp.builder()
                    .otpCode(otpCode)
                    .user(user)
                    .expiredAt(expiredAt)
                    .verified(false)
                    .build();
            otp = otpRepository.save(otp);
            log.info("OTP created for phone change - user: {}, new phone: {}, OTP: {}", user.getEmail(), newPhoneNumber, otpCode);
        }
        
        // Gửi OTP đến số điện thoại mới
        sendOtpSms(newPhoneNumber, otpCode);
        
        return otp;
    }

    @Override
    @Transactional
    public boolean verifyOtpForUser(String otpCode, User user) {
        Optional<Otp> otpOpt = otpRepository.findByOtpCodeAndUser(otpCode, user);
        
        if (otpOpt.isEmpty()) {
            log.warn("Invalid OTP code: {} for user: {}", otpCode, user.getEmail());
            return false;
        }

        Otp otp = otpOpt.get();
        
        // Kiểm tra OTP đã được verify chưa
        if (otp.isVerified()) {
            log.warn("OTP already verified for user: {}", user.getEmail());
            return false;
        }

        // Kiểm tra OTP hết hạn
        if (otp.getExpiredAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for user: {}", user.getEmail());
            otpRepository.delete(otp);
            return false;
        }

        // Đánh dấu OTP đã được verify
        otp.setVerified(true);
        otpRepository.save(otp);
        
        log.info("OTP verified successfully for user: {}", user.getEmail());
        return true;
    }

    @Override
    @Transactional
    public void deleteOtp(User user) {
        otpRepository.deleteByUser(user);
    }
}
