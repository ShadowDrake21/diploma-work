package com.backend.app.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class PatentDTO {
    private UUID id;
    private UUID projectId; 
    private UUID primaryAuthorId;
    private String registrationNumber;
    private LocalDate registrationDate;
    private String issuingAuthority;
}
