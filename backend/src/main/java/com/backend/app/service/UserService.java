package com.backend.app.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.dto.miscellaneous.ResponseUserDTO;
import com.backend.app.dto.miscellaneous.UserProfileUpdateDTO;
import com.backend.app.dto.model.UserDTO;
import com.backend.app.enums.Role;
import com.backend.app.exception.ResourceAlreadyExistsException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.mapper.UserMapper;
import com.backend.app.model.ActiveToken;
import com.backend.app.model.Project;
import com.backend.app.model.User;
import com.backend.app.repository.ActiveTokenRepository;
import com.backend.app.repository.UserRepository;
import com.backend.app.util.CreationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final S3Service s3Service;
	private final UserMapper userMapper;
	private final ProjectService projectService;
	private final PublicationService publicationService;
	private final PatentService patentService;
	private final ResearchService researchService;
	private final PasswordEncoder passwordEncoder;
	private final ActiveTokenRepository activeTokenRepository;

	@Transactional
	public void savePendingUser(String username, String email, String password, Role role) {
		if (userRepository.existsByEmail(email)) {
			throw new ResourceAlreadyExistsException("Email already in use");
		}

		User user = User.builder().username(username).email(email).password(passwordEncoder.encode(password)).role(role)
				.verificationCode(emailService.generateVerificationCode())
				.avatarUrl(CreationUtils.getDefaultAvatarUrl()).build();
		userRepository.save(user);

		emailService.sendVerificationCode(email, user.getVerificationCode());

	}

	@Transactional
	public boolean verifyUser(String email, String code) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (!code.equals(user.getVerificationCode())) {
			return false;
		}

		user.setVerified(true);
		user.setVerificationCode(null);
		userRepository.save(user);
		return true;
	}

	@Transactional(readOnly = true)
	public UserDTO getCurrentUser(String email) {
		return userRepository.findByEmail(email).map(userMapper::mapToDTO)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	@Transactional(readOnly = true)
	public UserDTO getUserById(Long id) {
		return userRepository.findById(id).map(userMapper::mapToDTO)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

	}

	@Transactional(readOnly = true)
	public ResponseUserDTO getBasicUserInfo(Long id) {
		return userRepository.findById(id).map(userMapper::mapToResponseDTO)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	@Transactional(readOnly = true)
	public Optional<User> getUserByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Transactional(readOnly = true)
	public boolean userExistsByEmail(String email) {
		return userRepository.existsByEmail(email);
	}

	@Transactional(readOnly = true)
	public List<UserDTO> getUsersByRole(Role role) {
		return userRepository.findByRole(role).stream().map(userMapper::mapToDTO).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public Page<UserDTO> getAllUsers(Pageable pageable) {
		return userRepository.findAll(pageable).map(userMapper::mapToDTO);
	}

	@Transactional(readOnly = true)
	public List<UserDTO> getAllUsersList() {
		return userRepository.findAll().stream().map(userMapper::mapToDTO).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public Page<UserDTO> getUserCollaborators(Long userId, Pageable pageable) {
		Set<User> collaborators = new HashSet<User>();

		List<Project> projects = projectService.findProjectsByUserId(userId);

		for (Project project : projects) {
			switch (project.getType()) {
			case PUBLICATION:
				publicationService.findPublicationByProjectId(project.getId()).forEach(pub -> {
					pub.getPublicationAuthors().forEach(author -> {
						if (!author.getUser().getId().equals(userId)) {
							collaborators.add(author.getUser());
						}
					});
				});
				break;
			case PATENT:
				patentService.findPatentByProjectId(project.getId()).forEach(patent -> {
					patent.getCoInventors().forEach(coInventor -> {
						if (!coInventor.getUser().getId().equals(userId)) {
							collaborators.add(coInventor.getUser());
						}
					});

					if (!patent.getPrimaryAuthor().getId().equals(userId)) {
						collaborators.add(patent.getPrimaryAuthor());
					}
				});
				break;

			case RESEARCH:
				researchService.findResearchByProjectId(project.getId()).forEach(research -> {
					research.getResearchParticipants().forEach(participant -> {
						if (!participant.getUser().getId().equals(userId)) {
							collaborators.add(participant.getUser());
						}
					});
				});
				break;
			}
		}

		List<User> collaboratorList = new ArrayList<>(collaborators);

		if (collaboratorList.isEmpty()) {
			return Page.empty(pageable);
		}

		int start = (int) pageable.getOffset();
		int end = Math.min((start + pageable.getPageSize()), collaboratorList.size());

		if (start > end) {
			start = 0;
			end = Math.min(pageable.getPageSize(), collaboratorList.size());
		}

		List<User> pageContent = collaboratorList.subList(start, end);

		return new PageImpl<>(pageContent.stream().map(userMapper::mapToDTO).collect(Collectors.toList()), pageable,
				collaboratorList.size());
	}

	@Transactional(readOnly = true)
	public Page<UserDTO> searchUsers(String query, Pageable pageable) {
		if (query == null || query.trim().isEmpty()) {
			return userRepository.findAll(pageable).map(userMapper::mapToDTO);
		}

		String[] terms = query.trim().toLowerCase().split("\\s+");

		if (terms.length > 1) {
			Optional<User> exactEmailMatch = userRepository.findByEmail(query.trim());
			if (exactEmailMatch.isPresent()) {
				return new PageImpl<>(List.of(exactEmailMatch.get()), pageable, 1).map(userMapper::mapToDTO);
			}
		}
		return userRepository.searchUsers(query.trim(), pageable).map(userMapper::mapToDTO);
	}

	@Transactional
	public UserDTO saveUser(User user) {
		return userMapper.mapToDTO(userRepository.save(user));
	}

	@Transactional
	public void deleteUser(Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		userRepository.delete(user);
	}

	@Transactional
	public UserDTO updateAvatar(String email, MultipartFile file) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (user.getAvatarUrl() != null && !user.getAvatarUrl().equals(CreationUtils.getDefaultAvatarUrl())) {
			s3Service.deleteFile(extractFileNameFromUrl(user.getAvatarUrl()));
		}

		String fileName = "avatars/" + user.getId()+ "/" + file.getOriginalFilename();
		String fileUrl = s3Service.uploadIndependentFile(file, fileName);

		user.setAvatarUrl(fileUrl);
		User savedUser = userRepository.save(user);
		return userMapper.mapToDTO(savedUser);
	}

	@Transactional
	public UserDTO updateUserProfile(Long id, UserProfileUpdateDTO updateDTO) {
		User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (updateDTO.getDateOfBirth() != null) {
			user.setDateOfBirth(updateDTO.getDateOfBirth());
		}
		if (updateDTO.getUserType() != null) {
			user.setUserType(updateDTO.getUserType());
		}
		if (updateDTO.getUniversityGroup() != null) {
			user.setUniversityGroup(updateDTO.getUniversityGroup());
		}
		if (updateDTO.getPhoneNumber() != null) {
			user.setPhoneNumber(updateDTO.getPhoneNumber());
		}
		if (updateDTO.getSocialLinks() != null) {
			user.setSocialLinks(userMapper.mapSocialLinksToEntity(updateDTO.getSocialLinks()));
		}

		return userMapper.mapToDTO(userRepository.save(user));
	}

	@Transactional(readOnly = true)
	public List<User> findExpiredResetTokens() {
		return userRepository.findExpiredResetTokens();
	}

	@Transactional
	public void updateLastActive(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		user.setLastActive(LocalDateTime.now());
		userRepository.save(user);
	}

	@Transactional
	public void clearExpiredResetTokens() {
		List<User> users = findExpiredResetTokens();
		users.forEach(user -> {
			user.setResetToken(null);
			user.setTokenExpiration(null);
		});
		userRepository.saveAll(users);
	}

	@Transactional(readOnly = true)
	public List<User> findRecentlyActiveUsers(Instant cutoff, int count) {
		List<Long> activeUserIds = activeTokenRepository.findByExpiryAfter(cutoff).stream().map(ActiveToken::getUserId)
				.distinct().limit(count).collect(Collectors.toList());

		return userRepository.findAllById(activeUserIds);
	}

	private String extractFileNameFromUrl(String url) {
		return url.substring(url.lastIndexOf("/") + 1);
	}

}
