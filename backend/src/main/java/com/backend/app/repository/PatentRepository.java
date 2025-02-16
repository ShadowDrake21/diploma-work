package com.backend.app.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.app.model.Patent;


@Repository
public interface PatentRepository extends JpaRepository<Patent, UUID>{

}
