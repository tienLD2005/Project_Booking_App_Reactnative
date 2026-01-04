package data.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResetPasswordRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    private String newPassword;
    
    @NotBlank(message = "OTP không được để trống")
    private String otp;
}

