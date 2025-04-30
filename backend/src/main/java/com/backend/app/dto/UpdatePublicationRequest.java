package com.backend.app.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class UpdatePublicationRequest {
	private Project project;
	private List<PublicationAuthorRequest> publicationAuthors;
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
