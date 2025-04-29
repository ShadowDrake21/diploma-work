package com.backend.app.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import com.backend.app.util.DateFormat;

import lombok.Data;


/**
 * Request DTO for creating a new publication
 * */
@Data
public class CreatePublicationRequest {
    private UUID projectId;
    private LocalDate publicationDate;
    private String publicationSource;
    private String doiIsbn;
    private int startPage;
    private int endPage;
    private int journalVolume;
    private int issueNumber;
    private List<Long> authors;

    /**
     * Sets the publication date by parsing from string format
     * @param publicationDate String date to parse
     * */
	public void setPublicationDate(String publicationDate) {
		this.publicationDate = DateFormat.parseIncomeDate(publicationDate); 
	}
}