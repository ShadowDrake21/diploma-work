package com.backend.app.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.backend.app.model.ActiveToken;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class ActiveTokenRepositoryTest {
	@Autowired
    private ActiveTokenRepository repository;

    @Test
    void findByUserId_ShouldReturnTokensForUser() {
        Long userId = 1L;
        ActiveToken token1 = new ActiveToken("token1", userId, Instant.now().plusSeconds(3600));
        ActiveToken token2 = new ActiveToken("token2", userId, Instant.now().plusSeconds(7200));
        repository.save(token1);
        repository.save(token2);

        List<ActiveToken> tokens = repository.findByUserId(userId);

        assertEquals(2, tokens.size());
        assertTrue(tokens.stream().allMatch(t -> t.getUserId().equals(userId)));
    }

    @Test
    void findByExpiryBefore_ShouldReturnExpiredTokens() {
        Instant now = Instant.now();
        ActiveToken expiredToken = new ActiveToken("expired", 1L, now.minusSeconds(3600));
        ActiveToken validToken = new ActiveToken("valid", 2L, now.plusSeconds(3600));
        repository.save(expiredToken);
        repository.save(validToken);

        List<ActiveToken> expiredTokens = repository.findByExpiryBefore(now);

        assertEquals(1, expiredTokens.size());
        assertEquals("expired", expiredTokens.get(0).getToken());
    }

    @Test
    void deleteByToken_ShouldRemoveToken() {
        String token = "test-token";
        repository.save(new ActiveToken(token, 1L, Instant.now().plusSeconds(3600)));

        repository.deleteByToken(token);
        Optional<ActiveToken> found = repository.findById(token);

        assertFalse(found.isPresent());
    }
}
