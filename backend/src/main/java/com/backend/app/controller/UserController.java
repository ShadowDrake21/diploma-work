package com.backend.app.controller;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.controller.codes.UserCodes;
import com.backend.app.controller.messages.UserMessages;
import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.miscellaneous.UserProfileUpdateDTO;
import com.backend.app.dto.model.ProjectDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.dto.model.UserLoginDTO;
import com.backend.app.dto.response.ApiResponse;
import com.backend.app.dto.response.PaginatedResponse;
import com.backend.app.enums.Role;
import com.backend.app.exception.BusinessRuleException;
import com.backend.app.exception.DuplicateResourceException;
import com.backend.app.exception.InvalidInputException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.exception.UnauthorizedAccessException;
import com.backend.app.mapper.ProjectMapper;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.model.UserLogin;
import com.backend.app.service.ProjectService;
import com.backend.app.service.UserLoginService;
import com.backend.app.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "User Management", description = "Endpoints for managing users")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
	private static final String DEFAULT_PAGE_SIZE = "10";
	private static final String DEFAULT_PAGE_NUMBER = "0";
	private static final String DEFAULT_SORT_BY = "id";

	private final UserService userService;
	private final ProjectService projectService;
	private final ProjectMapper projectMapper;
	private final UserMapper userMapper;

	@Operation(summary = "Get all users (paginated)")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved users")
	@GetMapping
	public ResponseEntity<PaginatedResponse<UserDTO>> getAllUsers(
			@Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER) int page,
			@Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
			@Parameter(description = "Sort by field") @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy) {
		  try {
	            Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
	            Page<UserDTO> usersPage = userService.getAllUsers(pageable);
	            return ResponseEntity.ok(PaginatedResponse.success(
	                    usersPage,
	                    UserMessages.getMessage(UserCodes.USERS_FETCHED),
	                    UserCodes.USERS_FETCHED));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized access attempt to get all users");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(PaginatedResponse.error(
	                            UserMessages.getMessage(UserCodes.ACCESS_DENIED),
	                            UserCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error fetching paginated users", e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(PaginatedResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Get all users (list)")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved users list")
	@GetMapping("/list")
	public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsersList() {
		 try {
	            List<UserDTO> users = userService.getAllUsersList();
	            return ResponseEntity.ok(ApiResponse.success(
	                    users,
	                    UserMessages.getMessage(UserCodes.USERS_FETCHED),
	                    UserCodes.USERS_FETCHED));
	        } catch (UnauthorizedAccessException e) {
	            log.warn("Unauthorized access attempt to get users list");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.ACCESS_DENIED),
	                            UserCodes.ACCESS_DENIED));
	        } catch (Exception e) {
	            log.error("Error fetching users list", e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Create a new user")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created successfully")
	@PostMapping
	public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody UserDTO userDTO) {
		try {
			User user = userMapper.mapToEntity(userDTO);
			UserDTO savedUser = userService.saveUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            savedUser,
                            UserMessages.getMessage(UserCodes.USER_CREATED),
                            UserCodes.USER_CREATED));
        } catch (DuplicateResourceException e) {
            log.warn("Attempt to create duplicate user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.USER_EXISTS),
                            UserCodes.USER_EXISTS));
        } catch (InvalidInputException e) {
            log.warn("Invalid input when creating user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            e.getMessage(),
                            UserCodes.INVALID_INPUT));
        } catch (Exception e) {
            log.error("Error creating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }
	}

	@Operation(summary = "Get basic user info by ID")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved user")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ResponseUserDTO>> getUserById(@PathVariable Long id) {
		 try {
	            ResponseUserDTO user = userService.getBasicUserInfo(id);
	            return ResponseEntity.ok(ApiResponse.success(
	                    user,
	                    UserMessages.getMessage(UserCodes.USER_FETCHED),
	                    UserCodes.USER_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("User not found with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching user by ID: {}", id, e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Get full user info by ID")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved user details")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@GetMapping("/{id}/info")
	public ResponseEntity<ApiResponse<UserDTO>> getFullUserById(@PathVariable Long id) {
		   try {
	            UserDTO user = userService.getUserById(id);
	            return ResponseEntity.ok(ApiResponse.success(
	                    user,
	                    UserMessages.getMessage(UserCodes.USER_FETCHED),
	                    UserCodes.USER_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("User not found with ID: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching full user details by ID: {}", id, e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Get user by email")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved user")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@GetMapping("/email/{email}")
	public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
		 try {
	            UserDTO user = userService.getCurrentUser(email);
	            return ResponseEntity.ok(ApiResponse.success(
	                    user,
	                    UserMessages.getMessage(UserCodes.USER_FETCHED),
	                    UserCodes.USER_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("User not found with email: {}", email);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching user by email: {}", email, e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Get users by role")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved users")
	@GetMapping("/role/{role}")
	public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable Role role) {
		 try {
	            List<UserDTO> users = userService.getUsersByRole(role);
	            return ResponseEntity.ok(ApiResponse.success(
	                    users,
	                    UserMessages.getMessage(UserCodes.USERS_FETCHED),
	                    UserCodes.USERS_FETCHED));
	        } catch (Exception e) {
	            log.error("Error fetching users by role: {}", role, e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));}
	}

	@Operation(summary = "Check if user exists by email")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Existence check completed")
	@GetMapping("/exists/{email}")
	public ResponseEntity<ApiResponse<Boolean>> userExistsByEmail(@PathVariable String email) {
		try {
            boolean exists = userService.userExistsByEmail(email);
            return ResponseEntity.ok(ApiResponse.success(
                    exists,
                    UserMessages.getMessage(UserCodes.USER_EXISTENCE_CHECKED),
                    UserCodes.USER_EXISTENCE_CHECKED));
        } catch (Exception e) {
            log.error("Error checking user existence for email: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }
	}

	@Operation(summary = "Get current authenticated user")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved current user")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@GetMapping("/me")
	public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication) {
		 try {
	            String email = authentication.getName();
	            UserDTO user = userService.getCurrentUser(email);
	            return ResponseEntity.ok(ApiResponse.success(
	                    user,
	                    UserMessages.getMessage(UserCodes.USER_FETCHED),
	                    UserCodes.USER_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Current user not found");
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching current user", e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Update current user's avatar")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Avatar updated successfully")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiResponse<UserDTO>> updateAvatar(
			@Parameter(description = "Avatar image file") @RequestParam("avatar") MultipartFile file,
			Authentication authentication) {
		 try {
	            String email = authentication.getName();
	            UserDTO user = userService.updateAvatar(email, file);
	            return ResponseEntity.ok(ApiResponse.success(
	                    user,
	                    UserMessages.getMessage(UserCodes.USER_FETCHED),
	                    UserCodes.USER_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("Current user not found");
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching current user", e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }

	}

	@Operation(summary = "Update current user's profile")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@PatchMapping("/me/profile")
	public ResponseEntity<ApiResponse<UserDTO>> updateUserProfile(@RequestBody UserProfileUpdateDTO updateDTO,
			Authentication authentication) {
		try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email)
					.orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));
            UserDTO updatedUser = userService.updateUserProfile(user.getId(), updateDTO);
            return ResponseEntity.ok(ApiResponse.success(
                    updatedUser,
                    UserMessages.getMessage(UserCodes.PROFILE_UPDATED),
                    UserCodes.PROFILE_UPDATED));
        } catch (ResourceNotFoundException e) {
            log.warn("User not found for profile update");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
                            UserCodes.USER_NOT_FOUND));
        } catch (InvalidInputException e) {
            log.warn("Invalid profile update data: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            e.getMessage(),
                            UserCodes.INVALID_INPUT));
        } catch (Exception e) {
            log.error("Error updating user profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }

	}

	@Operation(summary = "Get user's projects")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved projects")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@GetMapping("/{userId}/projects")
	public ResponseEntity<ApiResponse<List<ProjectDTO>>> getUserProjects(@PathVariable Long userId) {
		try {
            List<ProjectDTO> projects = projectService.findProjectsByUserId(userId)
                    .stream()
                    .map(projectMapper::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(
                    projects,
                    UserMessages.getMessage(UserCodes.PROJECTS_FETCHED),
                    UserCodes.PROJECTS_FETCHED));
        } catch (ResourceNotFoundException e) {
            log.warn("User not found when fetching projects: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
                            UserCodes.USER_NOT_FOUND));
        } catch (Exception e) {
            log.error("Error fetching projects for user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }
	}

	@Operation(summary = "Get current user's projects")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved projects")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
	@GetMapping("/me/projects")
	public ResponseEntity<ApiResponse<List<ProjectDTO>>> getCurrentUserProjects(Authentication authentication) {
		try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email)
					.orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));
            List<ProjectDTO> projects = projectService.findProjectsByUserId(user.getId())
                    .stream()
                    .map(projectMapper::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(
                    projects,
                    UserMessages.getMessage(UserCodes.PROJECTS_FETCHED),
                    UserCodes.PROJECTS_FETCHED));
        } catch (ResourceNotFoundException e) {
            log.warn("Current user not found when fetching projects");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
                            UserCodes.USER_NOT_FOUND));
        } catch (Exception e) {
            log.error("Error fetching current user's projects", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }
	}

	@Operation(summary = "Search users")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved matching users")
	@GetMapping("/search")
	public ResponseEntity<PaginatedResponse<UserDTO>> searchUsers(
			@Parameter(description = "Search query") @RequestParam String query,
			@Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER) int page,
			@Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
			@Parameter(description = "Sort by field") @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy) {
		try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
            Page<UserDTO> usersPage = userService.searchUsers(query, pageable);
            return ResponseEntity.ok(PaginatedResponse.success(
                    usersPage,
                    UserMessages.getMessage(UserCodes.USERS_SEARCHED),
                    UserCodes.USERS_SEARCHED));
        } catch (Exception e) {
            log.error("Error searching users with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaginatedResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }
	}

	@Operation(summary = "Get user's collaborators")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved collaborators")
	@GetMapping("/{userId}/collaborators")
	public ResponseEntity<PaginatedResponse<UserDTO>> getUserCollaborators(@PathVariable Long userId,
			@Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER) int page,
	        @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
	        @Parameter(description = "Sort by field") @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy) {
		 try {
	            Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
	            Page<UserDTO> collaboratorsPage = userService.getUserCollaborators(userId, pageable);
	            return ResponseEntity.ok(PaginatedResponse.success(
	                    collaboratorsPage,
	                    UserMessages.getMessage(UserCodes.COLLABORATORS_FETCHED),
	                    UserCodes.COLLABORATORS_FETCHED));
	        } catch (ResourceNotFoundException e) {
	            log.warn("User not found when fetching collaborators: {}", userId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(PaginatedResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (Exception e) {
	            log.error("Error fetching collaborators for user ID: {}", userId, e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(PaginatedResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}

	@Operation(summary = "Delete user")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User deleted successfully")
	@io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
		 try {
	            userService.deleteUser(id);
	            return ResponseEntity.noContent().build();
	        } catch (ResourceNotFoundException e) {
	            log.warn("User not found for deletion: {}", id);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.USER_NOT_FOUND),
	                            UserCodes.USER_NOT_FOUND));
	        } catch (BusinessRuleException e) {
	            log.warn("Business rule violation when deleting user: {}", e.getMessage());
	            return ResponseEntity.badRequest()
	                    .body(ApiResponse.error(
	                            e.getMessage(),
	                            UserCodes.DELETION_NOT_ALLOWED));
	        } catch (Exception e) {
	            log.error("Error deleting user with ID: {}", id, e);
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(ApiResponse.error(
	                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
	                            UserCodes.SERVER_ERROR));
	        }
	}
	
	
	@Operation(summary = "Get recently active users")
	@GetMapping("/recent-active-users")
	public ResponseEntity<ApiResponse<List<UserDTO>>> getRecentlyActiveUsers (
			@RequestParam(defaultValue = "15") int minutes, @RequestParam(defaultValue = "10") int count) {
		try {
            Instant cutoff = Instant.now().minus(minutes, ChronoUnit.MINUTES);
            List<UserDTO> activeUsers = userService.findRecentlyActiveUsers(cutoff, count)
                    .stream()
                    .map(userMapper::mapToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(
                    activeUsers,
                    UserMessages.getMessage(UserCodes.ACTIVE_USERS_FETCHED),
                    UserCodes.ACTIVE_USERS_FETCHED));
        } catch (Exception e) {
            log.error("Error fetching recently active users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(
                            UserMessages.getMessage(UserCodes.SERVER_ERROR),
                            UserCodes.SERVER_ERROR));
        }
	}
}
