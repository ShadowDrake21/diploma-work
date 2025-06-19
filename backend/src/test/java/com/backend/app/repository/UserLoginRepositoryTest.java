package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.backend.app.model.User;
import com.backend.app.model.UserLogin;

public class UserLoginRepositoryTest {
	 @Autowired
	    private UserLoginRepository repository;

	 @Test
	    void findByUserIdOrderByLoginTimeDesc_ShouldReturnPagedResults() {
	        Long userId = 1L;
	        User user = new User();
	        user.setId(userId);

	        UserLogin login1 = UserLogin.builder()
	            .user(user)
	            .loginTime(Instant.now().minusSeconds(3600))
	            .ipAddress("192.168.1.1")
	            .userAgent("Browser 1")
	            .build();
	            
	        UserLogin login2 = UserLogin.builder()
	            .user(user)
	            .loginTime(Instant.now())
	            .ipAddress("192.168.1.2")
	            .userAgent("Browser 2")
	            .build();
	            
	        repository.save(login1);
	        repository.save(login2);

	        Pageable pageable = PageRequest.of(0, 1);
	        Page<UserLogin> page = repository.findByUserIdOrderByLoginTimeDesc(userId, pageable);

	        assertEquals(1, page.getContent().size());
	        assertEquals(2, page.getTotalElements());
	        assertEquals(login2.getLoginTime(), page.getContent().get(0).getLoginTime());
	    }

	    @Test
	    void findTop10ByOrderByLoginTimeDesc_ShouldReturnLatestLogins() {
	        for (int i = 0; i < 15; i++) {
	            User user = new User();
	            user.setId((long) i);
	            repository.save(UserLogin.builder()
	                .user(user)
	                .loginTime(Instant.now().minusSeconds(i * 60))
	                .ipAddress("ip" + i)
	                .userAgent("agent" + i)
	                .build());
	        }

	        List<UserLogin> latest = repository.findTop10ByOrderByLoginTimeDesc();

	        assertEquals(10, latest.size());
	        assertTrue(latest.get(0).getLoginTime().isAfter(latest.get(9).getLoginTime()));
	    }

	    @Test
	    void countByLoginTimeAfter_ShouldCountRecentLogins() {
	        Instant cutoff = Instant.now().minusSeconds(3600);
	        repository.save(UserLogin.builder()
	            .user(new User())
	            .loginTime(cutoff.plusSeconds(60))
	            .ipAddress("ip1")
	            .userAgent("agent1")
	            .build());
	            
	        repository.save(UserLogin.builder()
	            .user(new User())
	            .loginTime(cutoff.minusSeconds(60))
	            .ipAddress("ip2")
	            .userAgent("agent2")
	            .build()); 

	        long count = repository.countByLoginTimeAfter(cutoff);

	        assertEquals(1, count);
	    }
}
