package com.backend.app.dto.analytics;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor
public class CommentActivityDTO {
    private LocalDate date;
    private long newComments;
    private long likes;
}