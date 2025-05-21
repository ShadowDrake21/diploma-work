package com.backend.app.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
	private boolean success;
	private String message;
	private LocalDateTime timestamp;
	private T data;
	
	public static<T> ApiResponse<T> success(T data) {
		return new ApiResponse<>(true, "Success", LocalDateTime.now(), data);
	}
	
	public static<T> ApiResponse<T> error(String message) {
		return new ApiResponse<>(false, message, LocalDateTime.now(), null);
	}
}
