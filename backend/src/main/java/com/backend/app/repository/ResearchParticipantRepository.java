package com.backend.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.ResearchParticipant;
import com.backend.app.model.ResearchParticipantId;

public interface ResearchParticipantRepository extends JpaRepository<ResearchParticipant, ResearchParticipantId>{

}
