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
    
    public static <T> PaginatedResponse<T> success(Page<T> page) {
    	return new PaginatedResponse<>( true,
                "Success",
                LocalDateTime.now(),
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.hasNext());
    }
    
    public static <T> PaginatedResponse<T> error(String message) {
    	return new PaginatedResponse<>( 
    			false,
    			message,
    			LocalDateTime.now(),
    			null,
    			0,0,0,false);
             
    }
}
