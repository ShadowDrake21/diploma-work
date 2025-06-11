package com.backend.app.controller;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.controller.codes.AuthCodes;
import com.backend.app.controller.messages.AuthMessages;
import com.backend.app.dto.request.LoginRequest;
import com.backend.app.dto.request.RegisterRequest;
import com.backend.app.dto.request.RequestPasswordResetRequest;
import com.backend.app.dto.request.ResetPasswordRequest;
import com.backend.app.dto.request.VerifyRequest;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.dto.response.AuthResponse;
import com.backend.app.enums.Role;
import com.backend.app.exception.RateLimitExceededException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.ActiveToken;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.security.TokenBlacklist;
import com.backend.app.service.AuthService;
import com.backend.app.service.PasswordResetService;
import com.backend.app.service.RateLimitingService;
import com.backend.app.service.UserLoginService;
import com.backend.app.service.UserService;
import com.backend.app.util.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	private final PasswordResetService passwordResetService;
	private final TokenBlacklist tokenBlacklist;
	private final ActiveTokenRepository activeTokenRepository;
	private final AuthService authService;
	private final UserLoginService userLoginService;
	private final RateLimitingService rateLimitingService;

	@PostMapping("/login")
	public ResponseEntity<com.backend.app.dto.response.ApiResponse<AuthResponse>> login(
			@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		

		try {
			rateLimitingService.checkRateLimit("login_" + httpRequest.getRemoteAddr());
			
			if (request.getEmail() == null || request.getEmail().isEmpty()) {
				return ResponseEntity.badRequest().body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.EMAIL_REQUIRED), AuthCodes.EMAIL_REQUIRED));
			}
			if (request.getPassword() == null || request.getPassword().isEmpty()) {
				return ResponseEntity.badRequest().body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.PASSWORD_REQUIRED), AuthCodes.PASSWORD_REQUIRED));
			}
			log.info("Login attempt for email: {}", request.getEmail());
	        
	        Optional<User> optionalUser = userService.getUserByEmail(request.getEmail());
	        
	        if (optionalUser.isEmpty()) {
	            log.warn("User not found for email: {}", request.getEmail());
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.INVALID_CREDENTIALS), "INVALID_CREDENTIALS"));
	        }

	        User user = optionalUser.get();
	        log.info("User found: {}", user);
	        
	        if (!user.isVerified()) {
	            log.warn("Account not verified for email: {}", request.getEmail());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.ACCOUNT_NOT_VERIFIED), "ACCOUNT_NOT_VERIFIED"));
	        }
	        
	        log.info("Password comparison - input: {}, stored hash: {}", request.getPassword(), user.getPassword());
	        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
	        log.info("Password matches: {}", passwordMatches);
	        
	        String testEncoded = passwordEncoder.encode("Drake21");
	        log.info("Test encoding of 'Drake21': {}", testEncoded);
	        boolean testMatch = passwordEncoder.matches("Drake21", testEncoded);
	        log.info("Test match result: {}", testMatch);
	        
	        if (!passwordMatches) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.INVALID_CREDENTIALS), "INVALID_CREDENTIALS"));
	        }
	        
			String token = jwtUtil.generateToken(user.getEmail(), user.getId(), request.isRememberMe());

			userLoginService.recordUserLogin(user, httpRequest);
			ActiveToken activeToken = ActiveToken.builder().token(token).userId(user.getId())
					.expiry(Instant.now().plusMillis(request.isRememberMe() ? jwtUtil.getRememberMeExpirationTime()
							: jwtUtil.getExpirationTime()))
					.build();
			activeTokenRepository.save(activeToken);


			userService.updateLastActive(user.getId());

			return ResponseEntity.ok(ApiResponse.success(new AuthResponse(AuthMessages.getMessage(AuthCodes.LOGIN_SUCCESS), token), AuthCodes.LOGIN_SUCCESS));
		}catch (RateLimitExceededException e) {
	        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
	                .header("Retry-After", String.valueOf(e.getRetryAfterSeconds()))
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.RATE_LIMIT_EXCEEDED),
	                		AuthCodes.RATE_LIMIT_EXCEEDED));
	        }
		catch (Exception e) {
			 log.error("Login error for email: {}", request.getEmail(), e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.SERVER_ERROR),
	                		AuthCodes.SERVER_ERROR));
		}
	}

	@PostMapping("/register")
	public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request) {
		try {
			// Validation
            if (request.getUsername() == null || request.getUsername().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.USERNAME_REQUIRED),
	                		AuthCodes.USERNAME_REQUIRED));
            }
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.EMAIL_REQUIRED),
	                		AuthCodes.EMAIL_REQUIRED));
            }
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.PASSWORD_REQUIRED),
	                		AuthCodes.PASSWORD_REQUIRED));
            }

            if (!isValidEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.INVALID_EMAIL_FORMAT),
	                		AuthCodes.INVALID_EMAIL_FORMAT));
            }


            if (!isPasswordStrong(request.getPassword())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.WEAK_PASSWORD),
	                		AuthCodes.WEAK_PASSWORD));
            }
            
    		if (userService.userExistsByEmail(request.getEmail())) {
    			return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error
    					(AuthMessages.getMessage(AuthCodes.EMAIL_IN_USE),
    	                		AuthCodes.EMAIL_IN_USE));
    		}
    		
    		userService.savePendingUser(request.getUsername(), request.getEmail(), request.getPassword(), Role.USER);

    		return ResponseEntity.ok(ApiResponse.success(AuthMessages.getMessage(AuthCodes.VERIFICATION_SENT),
            		AuthCodes.VERIFICATION_SENT));
		} catch (Exception e) {
			 log.error("Registration error for email: {}", request.getEmail(), e);
	            return ResponseEntity.internalServerError()
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.SERVER_ERROR),
	                		AuthCodes.SERVER_ERROR));
		}		
	}

	@PostMapping("/verify")
	public ResponseEntity<ApiResponse<AuthResponse>> verify(@RequestBody VerifyRequest request) {
		try {
			if(request.getEmail() == null || request.getEmail().isEmpty()) {
				return ResponseEntity.badRequest().body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.EMAIL_REQUIRED),
	            		AuthCodes.EMAIL_REQUIRED));
			}
			 if (request.getCode() == null || request.getCode().isEmpty()) {
		            return ResponseEntity.badRequest()
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.VERIFICATION_CODE_REQUIRED),
		                		AuthCodes.VERIFICATION_CODE_REQUIRED));
		        }
			 
			 if (!userService.verifyUser(request.getEmail(), request.getCode())) {
					return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error
							(AuthMessages.getMessage(AuthCodes.INVALID_VERIFICATION_CODE),
				            		AuthCodes.INVALID_VERIFICATION_CODE));
				}
			 User user = userService.getUserByEmail(request.getEmail())
						.orElseThrow(() -> new ResourceNotFoundException("User not found after verification"));
			 
				String token = jwtUtil.generateToken(user.getEmail(), user.getId());
				ActiveToken activeToken = ActiveToken.builder().token(token).userId(user.getId())
						.expiry(Instant.now().plusMillis(jwtUtil.getExpirationTime())).build();
				activeTokenRepository.save(activeToken);
				
				 return ResponseEntity.ok(ApiResponse.success(
				            new AuthResponse(AuthMessages.getMessage(AuthCodes.VERIFICATION_SUCCESS),
				            		AuthCodes.VERIFICATION_SUCCESS)));
		} catch (ResourceNotFoundException e) {
			 log.error("Verification error - user not found: {}", request.getEmail(), e);
			 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error
					 (AuthMessages.getMessage(AuthCodes.USER_NOT_FOUND),
			            		AuthCodes.USER_NOT_FOUND));
			 }
		catch (Exception e) {
	        log.error("Verification error for email: {}", request.getEmail(), e);
	        return ResponseEntity.internalServerError()
	            .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.VERIFICATION_ERROR),
	            		AuthCodes.VERIFICATION_ERROR));
	    }
	}

	@PostMapping("/request-password-reset")
	public ResponseEntity<ApiResponse<String>> requestPasswordReset(@RequestBody RequestPasswordResetRequest request, 
			HttpServletRequest httpRequest) {
		try {
			rateLimitingService.checkRateLimit("pwd_reset_" + request.getEmail());
			rateLimitingService.checkRateLimit("pwd_reset_ip_" + httpRequest.getRemoteAddr());
			if (request.getEmail() == null || request.getEmail().isEmpty()) {
				return ResponseEntity.badRequest().body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.EMAIL_REQUIRED),
	            		AuthCodes.EMAIL_REQUIRED));
			}
			boolean resetLinkSent = passwordResetService.sendResetLink(request.getEmail());
			
			if(!resetLinkSent) {
				log.info("Password reset requested for non-existent email: {}", request.getEmail());
				
				return ResponseEntity.ok(ApiResponse.success
						(AuthMessages.getMessage(AuthCodes.PASSWORD_RESET_REQUESTED),
			            		AuthCodes.PASSWORD_RESET_REQUESTED));
			}
			return ResponseEntity.ok(ApiResponse.success(AuthMessages.getMessage(AuthCodes.PASSWORD_RESET_REQUESTED),
            		AuthCodes.PASSWORD_RESET_REQUESTED));
		} catch (RateLimitExceededException e) {
	        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
	                .header("Retry-After", String.valueOf(e.getRetryAfterSeconds()))
	                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.RATE_LIMIT_EXCEEDED),
		            		AuthCodes.RATE_LIMIT_EXCEEDED));
	        }catch (Exception e) {
	        log.error("Password reset request error for email: {}", request.getEmail(), e);
	        return ResponseEntity.internalServerError()
	            .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.SERVER_ERROR),
	            		AuthCodes.SERVER_ERROR));
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody ResetPasswordRequest request) {
		try {
			 if (request.getToken() == null || request.getToken().isEmpty()) {
		            return ResponseEntity.badRequest()
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.RESET_TOKEN_REQUIRED),
			            		AuthCodes.RESET_TOKEN_REQUIRED));
		        }
		        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
		            return ResponseEntity.badRequest()
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.NEW_PASSWORD_REQUIRED),
			            		AuthCodes.NEW_PASSWORD_REQUIRED));
		        }
		        
		        if(!isPasswordStrong(request.getNewPassword())) {
		        	return ResponseEntity.badRequest().body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.WEAK_PASSWORD),
		            		AuthCodes.WEAK_PASSWORD));
		        }
		        
		        boolean resetSuccessful = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());	
		        if (!resetSuccessful) {
		            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.INVALID_RESET_TOKEN),
			            		AuthCodes.INVALID_RESET_TOKEN));
		        }
		        
		        return ResponseEntity.ok(ApiResponse.success(AuthMessages.getMessage(AuthCodes.PASSWORD_RESET_SUCCESS),
	            		AuthCodes.PASSWORD_RESET_SUCCESS));
		        } catch (RateLimitExceededException e) {
		            log.warn("Password reset attempt rate limit exceeded");
		            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.RATE_LIMIT_EXCEEDED),
			            		AuthCodes.RATE_LIMIT_EXCEEDED));
		        } catch (Exception e) {
		            log.error("Password reset error", e);
		            return ResponseEntity.internalServerError()
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.PASSWORD_RESET_ERROR),
			            		AuthCodes.PASSWORD_RESET_ERROR));
		        }
	
	}

	@PostMapping("/refresh-token")
	public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(HttpServletRequest request, @RequestBody Map<String, Boolean> requestBody) {
		 
		try {boolean rememberMe = requestBody != null ? 
		        requestBody.getOrDefault("rememberMe", false) : false;
			String token = jwtUtil.extractJwtFromRequest(request);

			if (token == null ) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.TOKEN_REQUIRED),
			            		AuthCodes.TOKEN_REQUIRED));
			}
			
			 if (tokenBlacklist.isBlacklisted(token)) {
		            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		                .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.TOKEN_REVOKED),
			            		AuthCodes.TOKEN_REVOKED));
		        }

			Claims claims = jwtUtil.parseToken(token).getBody();
			
			boolean isAutoProlonged = request.getHeader("X-Auto-Prolong") != null;
	        if (isAutoProlonged) {
	            rememberMe = jwtUtil.isRememberMeToken(claims);
	        }
	        
			Long userId = claims.get("userId", Long.class);
			String email = claims.getSubject();

			tokenBlacklist.addToBlacklist(token);
			authService.revokeToken(token);

			String newToken = jwtUtil.generateToken(email, userId, rememberMe);

			ActiveToken activeToken = ActiveToken.builder().token(newToken).userId(userId)
					.expiry(Instant.now().plusMillis(rememberMe ? jwtUtil.getRememberMeExpirationTime() : jwtUtil.getExpirationTime())).build();
			activeTokenRepository.save(activeToken);

			AuthResponse authResponse = new AuthResponse(
		            isAutoProlonged ? "Session prolonged" : AuthMessages.getMessage(AuthCodes.TOKEN_REFRESHED), 
		            newToken
		        );
			return ResponseEntity.ok(ApiResponse.success(authResponse,
            		AuthCodes.TOKEN_REFRESHED));
		}  catch (ExpiredJwtException e) {
	        log.warn("Refresh attempt with expired token");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	            .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.TOKEN_EXPIRED),
	            		AuthCodes.TOKEN_EXPIRED));
	    } catch (JwtException e) {
	        log.warn("Invalid JWT during refresh: {}", e.getMessage());
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	            .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.INVALID_TOKEN),
	            		AuthCodes.INVALID_TOKEN));
	    } catch (Exception e) {
	        log.error("Token refresh error", e);
	        return ResponseEntity.internalServerError()
	            .body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.TOKEN_REFRESH_ERROR),
	            		AuthCodes.TOKEN_REFRESH_ERROR));
	    }
	}

	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
		try {
			String token = jwtUtil.extractJwtFromRequest(request);

			if (token != null) {
				tokenBlacklist.addToBlacklist(token);
				authService.revokeToken(token);
				
				log.info("User logged out successfully. Token revoked.");
			} else {
				log.warn("Logout attempt without token.");
			}
			
			return ResponseEntity.ok(ApiResponse.success(AuthMessages.getMessage(AuthCodes.LOGOUT_SUCCESS),
            		AuthCodes.LOGOUT_SUCCESS));
		} catch (Exception e) {
			log.error("Logout error: ", e);
			return ResponseEntity.internalServerError().body(ApiResponse.error(AuthMessages.getMessage(AuthCodes.LOGOUT_ERROR),
            		AuthCodes.LOGOUT_ERROR));
		}
	}
	
	private boolean isValidEmail(String email) {
		return email != null && email.contains("@") && email.contains(".");
	}
	
	   private boolean isPasswordStrong(String password) {
	        return password != null && password.length() >= 6 && 
	               password.matches(".*[A-Z].*") && 
	               password.matches(".*[a-z].*") && 
	               password.matches(".*\\d.*");
	    }
}
