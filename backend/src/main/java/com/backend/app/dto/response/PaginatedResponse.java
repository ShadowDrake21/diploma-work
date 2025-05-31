package com.backend.app.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaginatedResponse<T> {
	private boolean success;
    private String message;
    private LocalDateTime timestamp;
    private List<T> data;
    private int page;
    private int totalPages;
    private long totalItems;
    private boolean hasNext;
    private String errorCode;
    
    public static <T> PaginatedResponse<T> success(Page<T> page) {
    	return new PaginatedResponse<>( true,
                "Success",
                LocalDateTime.now(),
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.hasNext(),
    			null);
    }
    
    // Success with custom message
    public static <T> PaginatedResponse<T> success(Page<T> page, String message) {
        return new PaginatedResponse<>(
            true,
            message,
            LocalDateTime.now(),
            page.getContent(),
            page.getNumber(),
            page.getTotalPages(),
            page.getTotalElements(),
            page.hasNext(),
            null
        );
    }

    // Success with custom message and code
    public static <T> PaginatedResponse<T> success(Page<T> page, String message, String code) {
        return new PaginatedResponse<>(
            true,
            message,
            LocalDateTime.now(),
            page.getContent(),
            page.getNumber(),
            page.getTotalPages(),
            page.getTotalElements(),
            page.hasNext(),
            code
        );
    }

    // Error with message only
    public static <T> PaginatedResponse<T> error(String message) {
        return new PaginatedResponse<>(
            false,
            message,
            LocalDateTime.now(),
            null,
            0,
            0,
            0,
            false,
            null
        );
    }

    // Error with message and error 
    public static <T> PaginatedResponse<T> error(String message, String errorCode) {
        return new PaginatedResponse<>(
            false,
            message,
            LocalDateTime.now(),
            null,
            0,
            0,
            0,
            false,
            errorCode
        );
    }

    // Error with error code only
    public static <T> PaginatedResponse<T> errorWithCode(String errorCode) {
        return new PaginatedResponse<>(
            false,
            null,
            LocalDateTime.now(),
            null,
            0,
            0,
            0,
            false,
            errorCode
        );
    }

}
