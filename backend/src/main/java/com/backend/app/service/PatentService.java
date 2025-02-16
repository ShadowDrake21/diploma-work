package com.backend.app.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.app.model.Patent;
import com.backend.app.repository.PatentRepository;

@Service
public class PatentService {
	@Autowired
	private PatentRepository patentRepository;
	
	public List<Patent> findAllPatents(){
		return patentRepository.findAll();
	}
	
	public Optional<Patent> findPatentById(UUID id) {
		return patentRepository.findById(id);
	}
	
	public Patent savePatent(Patent patent) {
		return patentRepository.save(patent);
	}
	
	public void deletePatent(UUID id) {
		patentRepository.deleteById(id);
	}
}
