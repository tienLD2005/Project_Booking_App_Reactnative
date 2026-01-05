package data.mapper;


import data.dto.response.UserResponseDTO;
import data.entity.User;

public class UserMapper {

    public static UserResponseDTO toDTO(User user) {
        if (user == null) return null;

        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(String.valueOf(user.getDateOfBirth()))
                .gender(user.getGender())
                .avatar(user.getAvatar())
                .build();
    }
}
