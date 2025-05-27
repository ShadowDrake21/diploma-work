package com.backend.app.service.analytics;

import java.lang.management.ManagementFactory;
import java.util.concurrent.TimeUnit;

import javax.sql.DataSource;

import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

import com.backend.app.dto.analytics.SystemOverviewDTO;
import com.backend.app.dto.analytics.SystemPerformanceDTO;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.AdminInvitationRepository;
import com.backend.app.repository.ProjectRepository;
import com.backend.app.repository.UserRepository;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemAnalyticsService {
	private final UserRepository userRepository;
	 private final ProjectRepository projectRepository;
	    private final AdminInvitationRepository adminInvitationRepository;
	    private final ActiveTokenRepository activeTokenRepository;
	    
	    private final MeterRegistry meterRegistry;
	    private final ServletWebServerApplicationContext serverContext;
	    private final PlatformTransactionManager transactionManager;
	    private final DataSource dataSource;
	    
	    public SystemOverviewDTO getSystemOverview() {
	    	long totalUsers = userRepository.count();
	    	long activeUsers = userRepository.countByActiveTrue();
	    	 long totalProjects = projectRepository.count();
	         long activeSessions = activeTokenRepository.count();
	         
	    return SystemOverviewDTO.builder()
	    		.totalUsers(totalUsers)
	    		.activeUsers(activeUsers)
	    		.totalProjects(totalProjects)
	    		.activeSessions(activeSessions)
	    		.pendingAdminInvitations(adminInvitationRepository.countByCompletedFalseAndRevokedFalse())
	    		.build();
	    }
	    
	    public SystemPerformanceDTO getSystemPerformanceMetrics() {
	        Runtime runtime = Runtime.getRuntime();
	        long maxMemory = runtime.maxMemory();
	        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
	        double memoryUsagePercent = (usedMemory * 100.0) / maxMemory;
	        
	        int availableProcessors = runtime.availableProcessors();
	        double systemLoad = ManagementFactory.getOperatingSystemMXBean().getSystemLoadAverage();
	        
	        Timer httpRequestsTimer = meterRegistry.find("http.server.requests")
	                .timer();
	        double avgResponseTime = httpRequestsTimer != null ? 
	                httpRequestsTimer.mean(TimeUnit.MILLISECONDS) : 0.0;
	        
	        
	        
	        int activeConnections = 0;
	        int maxConnections = 0;
	        int idleConnections = 0;
	        if(dataSource instanceof HikariDataSource) {
	        	HikariPoolMXBean pool = ((HikariDataSource) dataSource).getHikariPoolMXBean();
	        	activeConnections = pool.getActiveConnections();
	        	idleConnections = pool.getIdleConnections();
	        	maxConnections = pool.getTotalConnections();
	        	}
	        
	        long uptime = ManagementFactory.getRuntimeMXBean().getUptime();
	        double uptimeHours = uptime / (1000.0 * 60 * 60);
	        
	        return SystemPerformanceDTO.builder()
	                .averageResponseTime(avgResponseTime)
	                .uptimePercentage(calculateUptimePercentage(uptimeHours))
	                .activeConnections(activeTokenRepository.count())
	                .memoryUsage(memoryUsagePercent)
	                .cpuUsage(systemLoad / availableProcessors * 100)
	                .activeDbConnections(activeConnections)
	                .idleDbConnections(idleConnections)
	                .maxDbConnections(maxConnections)
	               
	                .threadCount(ManagementFactory.getThreadMXBean().getThreadCount())
	                .build();
	                 }
	    
	    private double calculateUptimePercentage(double uptimeHours) {
	    	double totalHoursInPeriod = 30*24;
	    	return Math.min(100.0, (uptimeHours / totalHoursInPeriod) * 100);
	    }
}
