package com.backend.app.controller;

import java.util.UUID;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.dto.model.CommentDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.dto.request.AdminInviteRequest;
import com.backend.app.dto.request.RegisterRequest;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.dto.response.AuthResponse;
import com.backend.app.dto.response.PaginatedResponse;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.InvalidTokenException;
import com.backend.app.exception.ResourceAlreadyExistsException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.model.AdminInvitation;
import com.backend.app.service.AdminService;
import com.backend.app.service.CommentService;
import com.backend.app.service.ProjectService;
import com.backend.app.util.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	private static final String DEFAULT_PAGE_SIZE = "10";
	private static final String DEFAULT_PAGE_NUMBER = "0";
	private static final String DEFAULT_SORT_BY = "id";
	
	private final AdminService adminService;
	private final JwtUtil jwtUtil;
	private final ProjectService projectService;
	private final ProjectMapper projectMapper;
	private final CommentService commentService;
	private final CommentMapper commentMapper;
	
	@Operation(summary = "Get all admin invitations (paginated)", 
	        description = "List all admin invitations with pagination")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved invitations")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	@GetMapping("/invitations")
	public ResponseEntity<PaginatedResponse<AdminInvitation>> getAdminInvitations(
			@Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER) int page,
			@Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
			@Parameter(description = "Sort by field") @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy) {
		try {
			Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
			Page<AdminInvitation> invitationsPage = adminService.getAdminInvitations(pageable);
			return ResponseEntity.ok(PaginatedResponse.success(invitationsPage));
		} catch (Exception e) {
			 log.error("Error fetching admin invitations: ", e);
		        return ResponseEntity.internalServerError()
		                .body(PaginatedResponse.error("Error fetching admin invitations"));
		}
	}
	    
	@Operation(summary = "Invite new admin",
            description = "Send invitation email to register as an admin")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invitation sent successfully")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already registered")
	    @PostMapping("/invite")
	    public ResponseEntity<ApiResponse<String>> inviteAdmin(
	            @RequestBody AdminInviteRequest request, 
	            Authentication authentication) {
	    	try {
	    		String result = adminService.inviteAdmin(request, authentication.getName());
		        return ResponseEntity.ok(ApiResponse.success(result));
			} catch (UnauthorizedAccessException e) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(e.getMessage()));
	        } catch (ResourceAlreadyExistsException e) {
	            return ResponseEntity.status(HttpStatus.CONFLICT)
	                    .body(ApiResponse.error(e.getMessage()));
	        }
	    	
	    }
	    
	 @Operation(summary = "Complete admin registration",
	            description = "Finalize admin registration with invitation token")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Admin registered successfully")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token")
	    @PostMapping("/complete-registration")
	    public ResponseEntity<ApiResponse<AuthResponse>> completeAdminRegistration(
	            @RequestParam String token, 
	            @RequestBody RegisterRequest request) {
		 try {
			 AuthResponse response = adminService.completeAdminRegistration(token, request);
		        return ResponseEntity.ok(ApiResponse.success(response));
		} catch (InvalidTokenException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
	        
	    }
	 
	 @Operation(summary = "Validate admin invite token",
			    description = "Validates an admin invitation token")
	 @GetMapping("/validate-invite-token")
	 public ResponseEntity<ApiResponse<Boolean>> validateAdminInviteToken(
			 @RequestParam String token, @RequestParam String email) {
		 try {
			boolean isValid = jwtUtil.validateAdminInviteToken(token, email);
			return ResponseEntity.ok(ApiResponse.success(isValid));
		} catch (Exception e) {
			 log.error("Token validation failed", e);
		        return ResponseEntity.ok(ApiResponse.success(false));
		}
	 }
	    
	    @Operation(summary = "Get all users (paginated)", 
	            description = "Admin-only endpoint to list all users with pagination")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved users")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @GetMapping("/users")
	    public ResponseEntity<PaginatedResponse<UserDTO>> getAllUsers(
				@Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER) int page,
				@Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
				@Parameter(description = "Sort by field") @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy) {
	    	try {
				Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
				Page<UserDTO> usersPage = adminService.getAllUsers(pageable);
				return ResponseEntity.ok(PaginatedResponse.success(usersPage));
				} catch (Exception e) {
		            log.error("Error fetching users: ", e);
		            return ResponseEntity.internalServerError()
		                    .body(PaginatedResponse.error("Error fetching users"));
			}
	    }
	    
	    @Operation(summary = "Promote user to admin",
	            description = "Elevate a regular user to admin status")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User promoted successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "User is already an admin")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	    @PostMapping("/users/{userId}/promote")
	    public ResponseEntity<ApiResponse<UserDTO>> promoteToAdmin(
	    		@PathVariable Long userId, Authentication authentication) {
	    	try {
				UserDTO promotedUser = adminService.promoteToAdmin(userId, authentication.getName());
				return ResponseEntity.ok(ApiResponse.success(promotedUser));
			} catch (ResourceNotFoundException e) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(e.getMessage()));
	        } catch (BusinessRuleException e) {
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(e.getMessage()));
	        } catch (UnauthorizedAccessException e) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(e.getMessage()));
	        }
	    }
	    
	    @Operation(summary = "Demote admin to user",
	            description = "Remove admin privileges from a user (cannot self-demote)")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User demoted successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cannot demote self or user is not an admin")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	    @PostMapping("/users/{userId}/demote")
	    public ResponseEntity<ApiResponse<UserDTO>> demoteFromAdmin(
	    		@PathVariable Long userId, Authentication authentication) {
	    	try {	
				UserDTO demotedUser = adminService.demoteToUser(userId, authentication.getName());
				return ResponseEntity.ok(ApiResponse.success(demotedUser));
			} catch (ResourceNotFoundException e) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(e.getMessage()));
	        } catch (BusinessRuleException e) {
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(e.getMessage()));
	        } catch (UnauthorizedAccessException e) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(e.getMessage()));
	        }
	    }
	    
	    @Operation(summary = "Deactivate user account",
	            description = "Soft delete - marks user as inactive but preserves data")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User deactivated successfully")
	    @PostMapping("/users/{userId}/deactivate")
	    public ResponseEntity<ApiResponse<Void>> deactivateUser(
	    		@PathVariable Long userId, Authentication authentication) {
	    	adminService.deactivateUser(userId, authentication.getName());
	    	return ResponseEntity.noContent().build();
	    }
	    
	    @Operation(summary = "Permanently delete user account",
	            description = "Hard delete - removes user but marks projects as from deleted user")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User deleted successfully")
	    @DeleteMapping("/users/{userId}")
	    public ResponseEntity<ApiResponse<Void>> deleteUser(
	            @PathVariable Long userId,
	            Authentication authentication) {
	        adminService.deleteUser(userId, authentication.getName());
	        return ResponseEntity.noContent().build();
	    }

	    @Operation(summary = "Reactivate user account",
	            description = "Restores a previously deactivated account")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User reactivated successfully")
	    @PostMapping("/users/{userId}/reactivate")
	    public ResponseEntity<ApiResponse<Void>> reactivateUser(
	            @PathVariable Long userId,
	            Authentication authentication) {
	        adminService.reactivateUser(userId, authentication.getName());
	        return ResponseEntity.noContent().build();
	    }
	    
	    @Operation(summary = "Resend admin invitation",
	            description = "Resend an invitation email to register as an admin")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invitation resent successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid invitation state")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invitation not found")
	    @PostMapping("/invitations/{invitationId}/resend")
	    public ResponseEntity<ApiResponse<Void>> resendInvitation(
	    		@PathVariable Long invitationId, Authentication authentication) {
	    	try {
				adminService.resendInvitation(invitationId);
				return ResponseEntity.ok(ApiResponse.success(null));
			} catch (ResourceNotFoundException e) {
		        return ResponseEntity.status(HttpStatus.NOT_FOUND)
		                .body(ApiResponse.error(e.getMessage()));
		    } catch (BusinessRuleException e) {
		        return ResponseEntity.badRequest()
		                .body(ApiResponse.error(e.getMessage()));
		    } catch (UnauthorizedAccessException e) {
		        return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                .body(ApiResponse.error(e.getMessage()));
		    }
	    }
	    
	    @Operation(summary = "Revoke admin invitation",
	            description = "Revoke a pending admin invitation")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Invitation revoked successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid invitation state")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invitation not found")
	    @DeleteMapping("/invitations/{invitationId}")
	    public ResponseEntity<ApiResponse<Void>> revokeInvitation(
	    		@PathVariable Long invitationId, Authentication authentication) {
	    	try {
				adminService.revokeInvitation(invitationId);
				return ResponseEntity.noContent().build();
			} catch (ResourceNotFoundException e) {
		        return ResponseEntity.status(HttpStatus.NOT_FOUND)
		                .body(ApiResponse.error(e.getMessage()));
		    } catch (BusinessRuleException e) {
		        return ResponseEntity.badRequest()
		                .body(ApiResponse.error(e.getMessage()));
		    } catch (UnauthorizedAccessException e) {
		        return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                .body(ApiResponse.error(e.getMessage()));
		    }
	    }
	    
	    @Operation(summary = "Get all projects for admin", description = "Get all projects with full details for admin review")
		@GetMapping("/projects")
		public ResponseEntity<PaginatedResponse<ProjectResponse>> getAllProjects(
				@ParameterObject Pageable pageable) {
			Page<ProjectResponse> projects = projectService.findAllProjects(pageable).map(projectMapper::toResponse);
			return ResponseEntity.ok(PaginatedResponse.success(projects));
		}

		@Operation(summary = "Get all comments for admin")
		@GetMapping("/comments")
		public ResponseEntity<PaginatedResponse<CommentDTO>> getAllComments(@ParameterObject Pageable pageable) {
			Page<CommentDTO> comments = commentService.findAllComments(pageable).map(commentMapper::toDTO);
			return ResponseEntity.ok(PaginatedResponse.success(comments));
		}
		
		@Operation(summary = "Delete comment (admin only)",
		        description = "Admin can delete any comment regardless of ownership")
		@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Comment deleted successfully")
		@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
		@DeleteMapping("/comments/{commentId}")
		public ResponseEntity<ApiResponse<Void>> deleteComment(
				@PathVariable UUID commentId, Authentication authentication) {
			try {
				adminService.deleteComment(commentId, authentication.getName());
				return ResponseEntity.noContent().build();
			} catch (ResourceNotFoundException e) {
		        return ResponseEntity.status(HttpStatus.NOT_FOUND)
		                .body(ApiResponse.error(e.getMessage()));
		    } catch (UnauthorizedAccessException e) {
		        return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                .body(ApiResponse.error(e.getMessage()));
		    }
		}
}
