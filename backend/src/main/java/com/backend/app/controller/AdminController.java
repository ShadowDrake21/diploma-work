package com.backend.app.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.app.controller.codes.AdminCodes;
import com.backend.app.controller.messages.AdminMessages;
import com.backend.app.dto.model.CommentDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.dto.model.UserLoginDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.dto.response.PaginatedResponse;
import com.backend.app.dto.response.ProjectResponse;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.mapper.CommentMapper;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.service.AdminService;
import com.backend.app.service.CommentService;
import com.backend.app.service.ProjectService;
import com.backend.app.service.UserLoginService;
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
	private final ProjectService projectService;
	private final ProjectMapper projectMapper;
	private final CommentService commentService;
	private final CommentMapper commentMapper;
	private final UserLoginService userLoginService;
	    
	    @Operation(summary = "Get all users (paginated)", 
	            description = "Admin-only endpoint to list all users with pagination")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved users")
	 @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @GetMapping("/users")
	    public ResponseEntity<PaginatedResponse<UserDTO>> getAllUsers(
				@Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER) int page,
				@Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
				@Parameter(description = "Sort by field") @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy,
				@Parameter(description = "Sort direction") @RequestParam(defaultValue = "ASC") Sort.Direction direction) {
	    	try {
				Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
				Page<UserDTO> usersPage = adminService.getAllUsers(pageable);
				return ResponseEntity.ok(PaginatedResponse.success(usersPage, AdminMessages.getMessage(AdminCodes.USERS_FETCHED), AdminCodes.USERS_FETCHED));
				} catch (UnauthorizedAccessException e) {
		            log.warn("Unauthorized access attempt to get all users");
		            return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                    .body(PaginatedResponse.error(
		                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
		                            AdminCodes.ACCESS_DENIED));
		        } catch (Exception e) {
		            log.error("Error fetching users: ", e);
		            return ResponseEntity.internalServerError()
		                    .body(PaginatedResponse.error(
		                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
		                            AdminCodes.SERVER_ERROR));
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
				return ResponseEntity.ok(ApiResponse.success(
	                    promotedUser, 
	                    AdminMessages.getMessage(AdminCodes.USER_PROMOTED),AdminCodes.USER_PROMOTED));
			} catch (ResourceNotFoundException e) {
	            log.warn("User not found for promotion: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.USER_NOT_FOUND),
	                            AdminCodes.USER_NOT_FOUND));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation during promotion: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            AdminCodes.ALREADY_ADMIN));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized promotion attempt by: {}", authentication.getName());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error promoting user to admin: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
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
				return ResponseEntity.ok(ApiResponse.success(demotedUser,  AdminMessages.getMessage(AdminCodes.USER_DEMOTED), AdminCodes.USER_DEMOTED));
			} catch (ResourceNotFoundException e) {
	            log.warn("User not found for demotion: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.USER_NOT_FOUND),
	                            AdminCodes.USER_NOT_FOUND));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation during demotion: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            AdminCodes.DEMOTE_SELF_OR_NON_ADMIN));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized demotion attempt by: {}", authentication.getName());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error demoting admin: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
	    }
	    
	    @Operation(summary = "Deactivate user account",
	            description = "Soft delete - marks user as inactive but preserves data")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User deactivated successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	    @PostMapping("/users/{userId}/deactivate")
	    public ResponseEntity<ApiResponse<Void>> deactivateUser(
	    		@PathVariable Long userId, Authentication authentication) {
	    	try {
	    		adminService.deactivateUser(userId, authentication.getName());
		    	return ResponseEntity.noContent().build();
			} catch (ResourceNotFoundException e) {
	            log.warn("User not found for deactivation: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.USER_NOT_FOUND),
	                            AdminCodes.USER_NOT_FOUND));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized deactivation attempt by: {}", authentication.getName());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error deactivating user: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
	    	
	    }
	    
	    @Operation(summary = "Permanently delete user account",
	            description = "Hard delete - removes user but marks projects as from deleted user")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User deleted successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	    @DeleteMapping("/users/{userId}")
	    public ResponseEntity<ApiResponse<Void>> deleteUser(
	            @PathVariable Long userId,
	            Authentication authentication) {
	    	try {
				
	    		adminService.deleteUser(userId, authentication.getName());
	    		return ResponseEntity.noContent().build();
			}catch (ResourceNotFoundException e) {
	            log.warn("User not found for deletion: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.USER_NOT_FOUND),
	                            AdminCodes.USER_NOT_FOUND));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized deletion attempt by: {}", authentication.getName());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error deleting user: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
	    }

	    @Operation(summary = "Reactivate user account",
	            description = "Restores a previously deactivated account")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User reactivated successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	    @PostMapping("/users/{userId}/reactivate")
	    public ResponseEntity<ApiResponse<Void>> reactivateUser(
	            @PathVariable Long userId,
	            Authentication authentication) {
	    	try {
	    		adminService.reactivateUser(userId, authentication.getName());
	    		return ResponseEntity.noContent().build();
			} catch (ResourceNotFoundException e) {
	            log.warn("User not found for reactivation: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.USER_NOT_FOUND),
	                            AdminCodes.USER_NOT_FOUND));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized reactivation attempt by: {}", authentication.getName());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error reactivating user: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
	    }
	    
	    @Operation(summary = "Get all projects for admin", description = "Get all projects with full details for admin review")
		@GetMapping("/projects")
		public ResponseEntity<PaginatedResponse<ProjectResponse>> getAllProjects(
				@ParameterObject Pageable pageable) {
	    	try {
	    		Page<ProjectResponse> projects = projectService.findAllProjects(pageable).map(projectMapper::toResponse);
	    		return ResponseEntity.ok(PaginatedResponse.success(
	                    projects,
	                    AdminMessages.getMessage(AdminCodes.PROJECTS_FETCHED),AdminCodes.PROJECTS_FETCHED));
			} catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized access attempt to get all projects");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(PaginatedResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error fetching projects: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(PaginatedResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
		}

		@Operation(summary = "Get all comments for admin")
		@GetMapping("/comments")
		public ResponseEntity<PaginatedResponse<CommentDTO>> getAllComments(@ParameterObject Pageable pageable) {
			try {
				Page<CommentDTO> comments = commentService.findAllComments(pageable).map(commentMapper::toDTO);
				 return ResponseEntity.ok(PaginatedResponse.success(
		                    comments,
		                    AdminMessages.getMessage(AdminCodes.COMMENTS_FETCHED),AdminCodes.COMMENTS_FETCHED));
			}  catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized access attempt to get all comments");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(PaginatedResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error fetching comments: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(PaginatedResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
		}
		
		@Operation(summary = "Delete comment (admin only)",
	            description = "Admin can delete any comment regardless of ownership")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Comment deleted successfully")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden, admin access required")
	    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
		@DeleteMapping("/comments/{commentId}")
		public ResponseEntity<ApiResponse<Void>> deleteComment(
				@PathVariable UUID commentId, Authentication authentication) {
			try {
				adminService.deleteComment(commentId, authentication.getName());
				return ResponseEntity.noContent().build();
			} catch (ResourceNotFoundException e) {
	            log.warn("Comment not found for deletion: {}", commentId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.COMMENT_NOT_FOUND),
	                            AdminCodes.COMMENT_NOT_FOUND));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized comment deletion attempt by: {}", authentication.getName());
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error deleting comment: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }
		}
		
		@Operation(summary = "Get recent user logins",
	            description = "Retrieve a list of recent user logins")
		@GetMapping("/recent-logins")
		public ResponseEntity<ApiResponse<List<UserLoginDTO>>> getRecentLogins(
	            @RequestParam(defaultValue = "10") int count) {
			try {
				 List<UserLoginDTO> recentLogins = userLoginService.getRecentLogins(count);
				 return ResponseEntity.ok(ApiResponse.success(
		                    recentLogins,
		                    AdminMessages.getMessage(AdminCodes.LOGINS_FETCHED),AdminCodes.LOGINS_FETCHED));
			 } catch (UnauthorizedAccessException e) {
		            log.warn("Unauthorized access attempt to get recent logins");
		            return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                    .body(ApiResponse.error(
		                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
		                            AdminCodes.ACCESS_DENIED));
		        } catch (Exception e) {
		            log.error("Error fetching recent logins: ", e);
		            return ResponseEntity.internalServerError()
		                    .body(ApiResponse.error(
		                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
		                            AdminCodes.SERVER_ERROR));
		        }
	       
	    }
		
		@Operation(summary = "Get login statistics",
	            description = "Retrieve count of logins within specified hours")
		@GetMapping("/login-stats")
		public ResponseEntity<ApiResponse<Long>> getRecentLoginCount(
	            @RequestParam(defaultValue = "24") int hours) {
			try {
				long loginCount = userLoginService.getRecentLoginCount(hours);
				return ResponseEntity.ok(ApiResponse.success(
	                    loginCount,
	                    AdminMessages.getMessage(AdminCodes.LOGIN_STATS_FETCHED),AdminCodes.LOGIN_STATS_FETCHED));
			} catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized access attempt to get login stats");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.ACCESS_DENIED),
	                            AdminCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error fetching login stats: ", e);
	            return ResponseEntity.internalServerError()
	                    .body(ApiResponse.error(
	                            AdminMessages.getMessage(AdminCodes.SERVER_ERROR),
	                            AdminCodes.SERVER_ERROR));
	        }

		}
		
		
}
