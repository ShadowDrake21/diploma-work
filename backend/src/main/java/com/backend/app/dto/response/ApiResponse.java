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
	private String errorCode;

	public static <T> ApiResponse<T> success(T data) {
		return new ApiResponse<>(true, "Success", LocalDateTime.now(), data, null);
	}

	public static <T> ApiResponse<T> success(T data, String message) {
		return new ApiResponse<>(true, message, LocalDateTime.now(), data, null);
	}

	public static <T> ApiResponse<T> success(T data, String message, String code) {
		return new ApiResponse<>(true, message, LocalDateTime.now(), data, code);
	}

	public static <T> ApiResponse<T> error(String message) {
		return new ApiResponse<>(false, message, LocalDateTime.now(), null, null);
	}

	public static <T> ApiResponse<T> error(String message, String errorCode) {
		return new ApiResponse<>(false, message, LocalDateTime.now(), null, errorCode);
	}

	public static <T> ApiResponse<T> errorWithCode(String errorCode) {
		return new ApiResponse<>(true, null, LocalDateTime.now(), null, errorCode);
	}
}
