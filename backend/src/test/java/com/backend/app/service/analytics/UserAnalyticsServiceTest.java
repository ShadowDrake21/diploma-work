package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.UserGrowthDTO;
import com.backend.app.enums.Role;
import com.backend.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserAnalyticsServiceTest {
@Mock private UserRepository userRepository;
    
    @InjectMocks private UserAnalyticsService userAnalyticsService;
    
    @Test
    void getUserGrowthAnalytics_WithDates_ShouldReturnCorrectData() {
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 1, 31);
        
        Object[] result1 = {Date.valueOf("2023-01-15"), 10L};
        Object[] result2 = {Date.valueOf("2023-01-20"), 5L};
        List<Object[]> repoResults = List.of(result1, result2);
        
        when(userRepository.getRegistrationCountsByDate(any(), any()))
            .thenReturn(repoResults);
        when(userRepository.countActiveUsersOnDate(LocalDate.of(2023, 1, 15)))
            .thenReturn(8L);
        when(userRepository.countActiveUsersOnDate(LocalDate.of(2023, 1, 20)))
            .thenReturn(3L);
        
        List<UserGrowthDTO> result = userAnalyticsService.getUserGrowthAnalytics(startDate, endDate);
        
        assertEquals(2, result.size());
        assertEquals(LocalDate.of(2023, 1, 15), result.get(0).getDate());
        assertEquals(10L, result.get(0).getNewUsers());
        assertEquals(8L, result.get(0).getActiveUsers());
    }

    @Test
    void getUserGrowthAnalytics_WithNullDates_ShouldUseDefaultDates() {
        // Arrange
        LocalDate expectedStart = LocalDate.now().minusMonths(6);
        LocalDate expectedEnd = LocalDate.now();
        
        when(userRepository.getRegistrationCountsByDate(any(), any()))
            .thenReturn(List.of());
        
        // Act
        userAnalyticsService.getUserGrowthAnalytics(null, null);
        
        // Verify
        verify(userRepository).getRegistrationCountsByDate(
            expectedStart.atStartOfDay(),
            expectedEnd.atTime(23, 59, 59));
    }

    @Test
    void getUserRoleDistribution_ShouldReturnCorrectMap() {
        Object[] adminResult = {Role.ADMIN, 5L};
        Object[] userResult = {Role.USER, 95L};
        when(userRepository.countUsersByRole())
            .thenReturn(List.of(adminResult, userResult));
        
        Map<Role, Long> result = userAnalyticsService.getUserRoleDistribution();
        
        assertEquals(2, result.size());
        assertEquals(5L, result.get(Role.ADMIN));
        assertEquals(95L, result.get(Role.USER));
    }
}
