package data.service;

import data.entity.Otp;
import data.entity.User;

public interface OtpService {
    String generateOtpCode();
    Otp createOtp(User user);
    Otp createOtpForPhoneChange(User user, String newPhoneNumber);
    boolean verifyOtp(String otpCode, String phoneNumber);
    boolean validateOtpForReset(String otpCode, String phoneNumber);
    boolean verifyOtpForUser(String otpCode, User user);
    void sendOtpSms(String phoneNumber, String otpCode);
    void resendOtp(String phoneNumber);
    void deleteOtp(User user);
}
