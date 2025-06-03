package com.backend.app.service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.backend.app.exception.RateLimitExceededException;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;



@Service
public class RateLimitingService {
	private final Map<String, Bucket> cache = new ConcurrentHashMap<String, Bucket>();
	
	public Bucket resolveBucket(String key) {
		return cache.computeIfAbsent(key, k -> {
			Bandwidth limit = Bandwidth.builder()
	                .capacity(10)
	                .refillIntervally(10, Duration.ofMinutes(1))
	                .build();
			
			return Bucket.builder().addLimit(limit).build();
		});
	}
	
	 public void checkRateLimit(String key) {
	        Bucket bucket = resolveBucket(key);
	        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
	        
	        if (!probe.isConsumed()) {
	            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
	            throw new RateLimitExceededException(
	                "Too many requests. Please try again after " + waitSeconds + " seconds", 
	                waitSeconds);
	        }
	    }
}
