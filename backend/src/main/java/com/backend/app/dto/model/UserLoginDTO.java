package com.backend.app.dto.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginDTO {
	private Long userId;
	private String username;
	private String email;
	private Instant loginTime;
    private String ipAddress;
	private String userAgent;
}
