package com.backend.app.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class PublicationDTO {
    private UUID id;
    private UUID projectId; 
    private String publicationSource;
    private String doiIsbn;
    private int startPage;
    private int endPage;
    private int journalVolume;
    private int issueNumber;
}