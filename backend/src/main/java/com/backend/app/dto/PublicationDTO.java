package com.backend.app.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO representing a publication with all its details
 * */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationDTO {
    private UUID id;
    private UUID projectId; 
    private LocalDate publicationDate;
    private String publicationSource;
    private String doiIsbn;
    private int startPage;
    private int endPage;
    private int journalVolume;
    private int issueNumber;
    private List<ResponseUserDTO> authors;
}