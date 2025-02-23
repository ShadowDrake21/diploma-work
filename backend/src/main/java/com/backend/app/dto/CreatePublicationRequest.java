package com.backend.app.dto;

import java.util.UUID;

public class CreatePublicationRequest {
    private UUID projectId;
    private String publicationSource;
    private String doiIsbn;
    private int startPage;
    private int endPage;
    private int journalVolume;
    private int issueNumber;

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getPublicationSource() {
        return publicationSource;
    }

    public void setPublicationSource(String publicationSource) {
        this.publicationSource = publicationSource;
    }

    public String getDoiIsbn() {
        return doiIsbn;
    }

    public void setDoiIsbn(String doiIsbn) {
        this.doiIsbn = doiIsbn;
    }

    public int getStartPage() {
        return startPage;
    }

    public void setStartPage(int startPage) {
        this.startPage = startPage;
    }

    public int getEndPage() {
        return endPage;
    }

    public void setEndPage(int endPage) {
        this.endPage = endPage;
    }

    public int getJournalVolume() {
        return journalVolume;
    }

    public void setJournalVolume(int journalVolume) {
        this.journalVolume = journalVolume;
    }

    public int getIssueNumber() {
        return issueNumber;
    }

    public void setIssueNumber(int issueNumber) {
        this.issueNumber = issueNumber;
    }
}