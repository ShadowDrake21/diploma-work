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
	
	public Optional<Patent> updatePatent(UUID id, Patent newPatent) {
		return patentRepository.findById(id).map(existingPatent -> {
			existingPatent.setProject(newPatent.getProject());
			existingPatent.setPrimaryAuthor(newPatent.getPrimaryAuthor());
			existingPatent.setRegistrationNumber(newPatent.getRegistrationNumber());
			existingPatent.setRegistrationDate(newPatent.getRegistrationDate());
			existingPatent.setIssuingAuthority(newPatent.getIssuingAuthority());
			
			return patentRepository.save(existingPatent);
		});
}
	
	public Patent savePatent(Patent patent) {
		return patentRepository.save(patent);
	}
	
	public void deletePatent(UUID id) {
		patentRepository.deleteById(id);
	}
}
