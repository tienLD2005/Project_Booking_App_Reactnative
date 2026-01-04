package data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {
    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String dateOfBirth;
    private String gender;
}