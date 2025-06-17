package com.backend.app.config;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

public class WebConfigTest {
	 @Test
	    void addCorsMappings_ShouldConfigureCorsProperly() {
	        WebConfig webConfig = new WebConfig();
	        CorsRegistry registry = mock(CorsRegistry.class);
	        
	        webConfig.addCorsMappings(registry);
	        
	        verify(registry).addMapping("/api/**")
	                       .allowedOrigins("http://localhost:4200")
	                       .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
	                       .allowedHeaders("*")
	                       .allowCredentials(true);
	    }
}
