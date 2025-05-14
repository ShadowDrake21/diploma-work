package com.backend.app.dto;

import com.backend.app.enums.Role;

import lombok.Data;

@Data
public class RegisterRequest {
	private String username;
    private String email;
    private String password;
    private Role role;   
}