package com.backend.app.service.analytics;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.app.dto.analytics.UserGrowthDTO;
import com.backend.app.enums.Role;
import com.backend.app.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAnalyticsService {
	private final UserRepository userRepository;
	
	public List<UserGrowthDTO> getUserGrowthAnalytics(LocalDate startDate, LocalDate endDate) {
		if(startDate == null) {
			startDate = LocalDate.now().minusMonths(6);
		}
		if (endDate == null) {
			endDate = LocalDate.now();
		}
		
		return userRepository.countUsersByRegistrationDateBetweenGroupedByDate(startDate.atStartOfDay(), endDate.atTime(23,59,59))
				.stream().map(result -> new UserGrowthDTO(
						  ((java.sql.Date) result[0]).toLocalDate(),
			                ((Number) result[1]).longValue(),
			                ((Number) result[2]).longValue()
			                )).collect(Collectors.toList());
	}
	
	 public Map<Role, Long> getUserRoleDistribution() {
	        return userRepository.countUsersByRole()
	                .stream()
	                .collect(Collectors.toMap(
	                        result -> (Role) result[0],
	                        result -> ((Number) result[1]).longValue()
	                ));
	    }
}
