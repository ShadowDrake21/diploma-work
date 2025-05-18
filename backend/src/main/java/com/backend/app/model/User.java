package com.backend.app.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.backend.app.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "token_expiration")
    private LocalDateTime tokenExpiration;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "user_type")
    private String userType;

    @Column(name = "university_group")
    private String universityGroup;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "publication_count", nullable = false)
    @Builder.Default
    private int publicationCount = 0;

    @Column(name = "patent_count", nullable = false)
    @Builder.Default
    private int patentCount = 0;

    @Column(name = "research_count", nullable = false)
    @Builder.Default
    private int researchCount = 0;

    @Column(length = 255)
    @Builder.Default
    private String affiliation = "Національний університет «Чернігівська Політехніка»";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @PrePersist
    @PreUpdate
    protected void validateRole() {
    	if(this.role == Role.SUPER_ADMIN) {
    		throw new SecurityException("Super admin accounts can only be created via database initialization");
    	}
    }
}