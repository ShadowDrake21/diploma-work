package com.backend.app.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.backend.app.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@ControllerAdvice
public class GlobalExceptioHandler {
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
		 log.error("Resource not found: {}", ex.getMessage());
	        return ResponseEntity
	                .status(HttpStatus.NOT_FOUND)
	                .body(ApiResponse.error(ex.getMessage()));
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        log.error("Unauthorized access: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(ex.getMessage()));
	}
	
	 @ExceptionHandler(BusinessRuleException.class)
	    public ResponseEntity<ApiResponse<Void>> handleBusinessRule(BusinessRuleException ex) {
	        log.error("Business rule violation: {}", ex.getMessage());
	        return ResponseEntity
	                .status(HttpStatus.BAD_REQUEST)
	                .body(ApiResponse.error(ex.getMessage()));
	    }
	 
	 @ExceptionHandler(MethodArgumentNotValidException.class)
	 public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
		 String errorMsg = ex.getBindingResult().getFieldErrors().stream()
				 .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
				 .collect(Collectors.joining("; "));
		 log.error("Validation error: {}", errorMsg);
		 return ResponseEntity
	                .status(HttpStatus.BAD_REQUEST)
	                .body(ApiResponse.error(errorMsg));
	 }
	
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
		 log.error("An error ocurred: {}", ex.getMessage(), ex);
		 
	        return ResponseEntity
	                .status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(ApiResponse.error("An unexpected error occurred"));
	}
}
