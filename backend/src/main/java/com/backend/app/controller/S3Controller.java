package com.backend.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.app.service.S3Service;

@RestController
@RequestMapping("/api/s3")
public class S3Controller {
	private final S3Service s3Service;
	
	public S3Controller(S3Service s3Service) {
		this.s3Service = s3Service;
	}
	
	@PostMapping("/upload")
	public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file) {
		try {
			String fileUrl = s3Service.uploadFile(file);
			return ResponseEntity.ok("File uploaded successfully: " + fileUrl);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
		}
	}
	
	
    @DeleteMapping("/delete/{fileName}")
	public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
		try {
			s3Service.deleteFile(fileName);
			return ResponseEntity.ok("File deleted successfully: " + fileName);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Failed to delete file: " + e.getMessage());
		}
	}
}

// TODO: Array of files
