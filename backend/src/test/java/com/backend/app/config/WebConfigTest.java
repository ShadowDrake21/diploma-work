package com.backend.app.config;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

public class WebConfigTest {
	  @Test
	    void addCorsMappings_ShouldConfigureCorsProperly() {
	        WebConfig webConfig = new WebConfig();
	        CorsRegistry registry = mock(CorsRegistry.class);
	        
	        CorsRegistration corsRegistration = mock(CorsRegistration.class);
	        when(registry.addMapping("/api/**")).thenReturn(corsRegistration);
	        
	        when(corsRegistration.allowedOrigins("http://localhost:4200")).thenReturn(corsRegistration);
	        when(corsRegistration.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")).thenReturn(corsRegistration);
	        when(corsRegistration.allowedHeaders("*")).thenReturn(corsRegistration);
	        when(corsRegistration.allowCredentials(true)).thenReturn(corsRegistration);
	        
	        webConfig.addCorsMappings(registry);
	        
	        verify(registry).addMapping("/api/**");
	        verify(corsRegistration).allowedOrigins("http://localhost:4200");
	        verify(corsRegistration).allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
	        verify(corsRegistration).allowedHeaders("*");
	        verify(corsRegistration).allowCredentials(true);
	    }
}
