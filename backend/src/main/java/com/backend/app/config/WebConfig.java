package com.backend.app.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ComponentScan(basePackages = "com.backend.app") 
public class WebConfig implements WebMvcConfigurer{
	private static final String[] ALLOWED_METHODS = {
			"GET", "POST", "PUT", "DELETE",  "OPTIONS"
	};
	private static final String FRONTEND_ORIGIN = "http://localhost:4200";
	private static final String API_PATH_PATTERN = "/api/**";
	
	@Override
	public void addCorsMappings(@NonNull CorsRegistry registry) {
		registry.addMapping(API_PATH_PATTERN)
		.allowedOrigins(FRONTEND_ORIGIN)
		.allowedMethods(ALLOWED_METHODS)
		.allowedHeaders("*")
		.allowCredentials(true);
				
	}
}
