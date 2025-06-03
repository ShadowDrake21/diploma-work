package com.backend.app.filter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.backend.app.exception.RateLimitExceededException;
import com.backend.app.service.RateLimitingService;

import io.github.bucket4j.Bucket;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class RateLimitFilter implements Filter {
    private final RateLimitingService rateLimitingService;
    
    public RateLimitFilter(RateLimitingService rateLimitingService) {
        this.rateLimitingService = rateLimitingService;
    }

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		
		try {
			String clientId = httpRequest.getRemoteAddr();
			rateLimitingService.checkRateLimit("global_"+clientId);
			
			chain.doFilter(request, response);
		}catch (RateLimitExceededException e) {
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setHeader("Retry-After", String.valueOf(e.getRetryAfterSeconds()));
            httpResponse.getWriter().write(
                "{\"error\":\"Rate limit exceeded\",\"message\":\"" + e.getMessage() + "\"}");
            httpResponse.setContentType("application/json");
        }
		
	}
    
    
}
