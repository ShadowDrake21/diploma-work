package com.backend.app.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.backend.app.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(name="users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	 @Column(nullable = false)
	    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column( nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role;
    
    @Column(nullable = true, name = "verification_code")
    private String verificationCode;
 
    @Column(nullable = false)
    private boolean verified = false;
    
    @Column(unique = true, name = "reset_token")
    private String resetToken;
    
    @Column(name = "token_expiration")
    private LocalDateTime tokenExpiration;
    
    @Column(name="avatar_url")
    private String avatarUrl;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "user_type")
    private String userType;
    
    @Column(name = "university_group")
    private String universityGroup;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "publication_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int publicationCount;
    
    @Column(name = "patent_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int patentCount;
    
    @Column(name = "research_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int researchCount;
    
    @Column(length = 255)
    private String affiliation = "Національний університет «Чернігівська Політехніка»";
    
    public User() {}

    public User(String username, String email, String password, Role role) {
    	this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

	public User(String email, Role role) {
		super();
		this.email = email;
		this.role = role;
	}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getResetToken() {
		return resetToken;
	}

	public void setResetToken(String resetToken) {
		this.resetToken = resetToken;
	}

	public LocalDateTime getTokenExpiration() {
		return tokenExpiration;
	}

	public void setTokenExpiration(LocalDateTime tokenExpiration) {
		this.tokenExpiration = tokenExpiration;
	}
	
	public String getAvatarUrl() {
	     return avatarUrl;
	}

	public void setAvatarUrl(String avatarUrl) {
	     this.avatarUrl = avatarUrl;
	}

	public LocalDate getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(LocalDate dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public String getUniversityGroup() {
		return universityGroup;
	}

	public void setUniversityGroup(String universityGroup) {
		this.universityGroup = universityGroup;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public int getPublicationCount() {
		return publicationCount;
	}

	public void setPublicationCount(int publicationCount) {
		this.publicationCount = publicationCount;
	}

	public int getPatentCount() {
		return patentCount;
	}

	public void setPatentCount(int patentCount) {
		this.patentCount = patentCount;
	}

	public int getResearchCount() {
		return researchCount;
	}

	public void setResearchCount(int researchCount) {
		this.researchCount = researchCount;
	}

	public String getAffiliation() {
		return affiliation;
	}

	public void setAffiliation(String affiliation) {
		this.affiliation = affiliation;
	}
	
	
}
