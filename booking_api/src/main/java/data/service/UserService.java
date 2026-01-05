package data.service;

import data.dto.request.ChangePasswordRequest;
import data.dto.request.ForgotPasswordRequest;
import data.dto.request.ResetPasswordRequest;
import data.dto.request.UpdateProfileRequest;
import data.dto.request.UserLogin;
import data.dto.request.UserRegister;
import data.dto.response.JWTResponse;
import data.dto.response.UserResponseDTO;
import data.entity.User;

public interface UserService {
    User registerUser(UserRegister userRegister);
    void setPassword(String phoneNumber, String password);
    JWTResponse login(UserLogin userLogin);
    User getCurrentUser();
    User getUserById(Integer userId);
    UserResponseDTO updateProfile(UpdateProfileRequest request);
    UserResponseDTO updateAvatar(org.springframework.web.multipart.MultipartFile file);
    void changePassword(ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
