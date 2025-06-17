package com.backend.app.service.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.app.dto.analytics.CommentActivityDTO;
import com.backend.app.repository.CommentRepository;

@ExtendWith(MockitoExtension.class)
public class CommentAnalyticsServiceTest {
@Mock private CommentRepository commentRepository;
    
    @InjectMocks private CommentAnalyticsService commentAnalyticsService;

    @Test
    void getCommentActivityAnalytics_ShouldReturnDailyCounts() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        Object[] day1 = {Date.valueOf(startDate.plusDays(1)), 5L, 10L}; 
        Object[] day2 = {Date.valueOf(startDate.plusDays(2)), 8L, 15L};
        
        when(commentRepository.countCommentsByDateRangeGroupedByDate(startDate))
            .thenReturn(List.of(day1, day2));
        
        List<CommentActivityDTO> result = commentAnalyticsService.getCommentActivityAnalytics(7);
        
        assertEquals(2, result.size());
        assertEquals(startDate.plusDays(1), result.get(0).getDate());
        assertEquals(5L, result.get(0).getNewComments());
        assertEquals(10L, result.get(0).getLikes());
        assertEquals(startDate.plusDays(2), result.get(1).getDate());
        assertEquals(8L, result.get(1).getNewComments());
        assertEquals(15L, result.get(1).getLikes());
    }

    @Test
    void getCommentActivityAnalytics_WithNoData_ShouldReturnEmptyList() {
        LocalDate startDate = LocalDate.now().minusDays(7);
        when(commentRepository.countCommentsByDateRangeGroupedByDate(startDate))
            .thenReturn(List.of());
        
        List<CommentActivityDTO> result = commentAnalyticsService.getCommentActivityAnalytics(7);
        
        assertTrue(result.isEmpty());
    }
}
