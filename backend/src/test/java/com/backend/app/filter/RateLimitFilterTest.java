package com.backend.app.filter;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.exception.RateLimitExceededException;
import com.backend.app.service.RateLimitingService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
public class RateLimitFilterTest {
	@Mock private RateLimitingService rateLimitingService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;
    
    @InjectMocks private RateLimitFilter filter;
    
    @Test
    void doFilter_WhenBelowRateLimit_ShouldContinueChain() throws Exception {
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        doNothing().when(rateLimitingService).checkRateLimit(anyString());
        
        filter.doFilter(request, response, filterChain);
        
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilter_WhenRateLimitExceeded_ShouldReturn429() throws Exception {
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        doThrow(new RateLimitExceededException("Too many requests", 60))
            .when(rateLimitingService).checkRateLimit(anyString());
            
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);
        
        filter.doFilter(request, response, filterChain);
        
        verify(response).setStatus(429);
        verify(response).setHeader("Retry-After", "60");
        assertTrue(stringWriter.toString().contains("Rate limit exceeded"));
    }
}
