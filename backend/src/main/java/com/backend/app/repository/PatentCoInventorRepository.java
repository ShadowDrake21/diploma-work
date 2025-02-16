package com.backend.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.app.model.PatentCoInventor;
import com.backend.app.model.PatentCoInventorId;

public interface PatentCoInventorRepository extends JpaRepository<PatentCoInventor, PatentCoInventorId> {

}
