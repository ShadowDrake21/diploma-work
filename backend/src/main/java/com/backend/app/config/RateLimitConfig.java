package com.backend.app.config;


import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.backend.app.filter.RateLimitFilter;
import com.backend.app.service.RateLimitingService;


@Configuration
public class RateLimitConfig {
	@Bean
	RateLimitingService rateLimitingService() {
		return new RateLimitingService();
	}
	
	@Bean
	FilterRegistrationBean<RateLimitFilter> rateLimitFilter(
			RateLimitingService rateLimitingService){
		FilterRegistrationBean<RateLimitFilter> registrationBean = new FilterRegistrationBean<>();
		registrationBean.setFilter(new RateLimitFilter(rateLimitingService));
		registrationBean.addUrlPatterns("/api/auth/*");
		registrationBean.setOrder(1);
		return registrationBean;
	}
}
