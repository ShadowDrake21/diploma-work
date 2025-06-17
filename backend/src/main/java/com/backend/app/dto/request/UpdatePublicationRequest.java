package com.backend.app.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePublicationRequest {
	@NotNull(message = "Project is required")
	private Project project;
	private List<Long> authors;
	private LocalDate publicationDate;
    private String publicationSource;
    private String doiIsbn;
    private int startPage;
    private int endPage;
    private int journalVolume;
    private int issueNumber;
    
    @Data
    public static class Project{ 
    	private UUID id;
    }
    
    @Data
    public static class PublicationAuthorRequest {
    	private User user;
    	
    	@Data
    	public static class User {
    		private Long id;
    	}
    }
}
