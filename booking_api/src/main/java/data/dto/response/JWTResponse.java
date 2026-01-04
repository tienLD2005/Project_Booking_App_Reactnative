package data.dto.response;

import data.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JWTResponse {
    private String fullName;
    private String email;
    private String phone;
    private String authorities;
    private String token;
    private String refreshToken;


    public JWTResponse(User user, String accessToken, String refreshToken, String authorities) {
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhoneNumber();
        this.token = accessToken;
        this.refreshToken = refreshToken;
        this.authorities = authorities;
    }

}