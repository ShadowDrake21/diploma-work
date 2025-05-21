package com.backend.app.service.analytics;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.CommentActivityDTO;
import com.backend.app.repository.CommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentAnalyticsService {
	private final CommentRepository commentRepository;
	
	public List<CommentActivityDTO> getCommentActivityAnalytics(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        return commentRepository.countCommentsByDateRangeGroupedByDate(startDate)
                .stream()
                .map(result -> new CommentActivityDTO(
                        ((java.sql.Date) result[0]).toLocalDate(),
                        ((Number) result[1]).longValue(),
                        ((Number) result[2]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
