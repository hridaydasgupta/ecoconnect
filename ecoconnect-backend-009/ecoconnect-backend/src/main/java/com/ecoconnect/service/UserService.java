package com.ecoconnect.service;

import com.ecoconnect.dto.UpdateLocationRequest;
import com.ecoconnect.model.User;
import com.ecoconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void updateLocation(User user, UpdateLocationRequest request) {
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        userRepository.save(user);
    }
}
