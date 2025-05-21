package com.backend.app.dto.create;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import com.backend.app.util.DateFormat;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Request DTO for creating a new publication
 * */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePublicationRequest {
	@NotNull(message = "Project ID is required")
    private UUID projectId;
	 @NotNull(message = "Publication date is required")
    private LocalDate publicationDate;
	 @NotBlank(message = "Publication source is required")
    private String publicationSource;
	 @NotBlank(message = "DOI/ISBN is required")
    private String doiIsbn;
	 @Min(value = 0, message = "Start page must be positive")
    private int startPage;
	 @Min(value = 0, message = "End page must be positive")
    private int endPage;
	 @Min(value = 0, message = "Journal volume must be positive")
    private int journalVolume;
	 @Min(value = 0, message = "Issue number must be positive")
    private int issueNumber;
    private List<Long> authors;

    /**
     * Sets the publication date by parsing from string format
     * @param publicationDate String date to parse
     * */
	public void setPublicationDate(String publicationDate) {
		try {
			this.publicationDate = DateFormat.parseIncomeDate(publicationDate); 
		} catch (Exception e) {
			throw new IllegalArgumentException("Invalid date format.");		}
	}
}