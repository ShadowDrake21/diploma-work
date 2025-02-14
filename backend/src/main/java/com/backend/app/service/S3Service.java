package com.backend.app.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3Service {
	private final S3Client s3Client;
	
	@Value("${aws.s3.bucket-name")
	private String bucketName;
	
	public S3Service(S3Client s3Client) {
		this.s3Client = s3Client;
	}
	
	public String uploadFile(MultipartFile file) {
		String fileName = file.getOriginalFilename();
		
		try {
			s3Client.putObject(PutObjectRequest.builder().bucket(bucketName).key(fileName).contentType(file.getContentType()).build(), RequestBody.fromBytes(file.getBytes()));
			
			return "File uploaded successfully: " + fileName;
		}
		catch (IOException e) {
			throw new RuntimeException("Error uploading file: " + e.getMessage());
		}
	}
	
	public byte[] downloadFile(String fileName) {
		try(ResponseInputStream<GetObjectResponse> response = s3Client.getObject(GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build())){
			return response.readAllBytes();
		}
		catch (IOException e) {
			throw new RuntimeException("Error downloading file: " + e.getMessage());
		}
		
	}
	
	public String deleteFile(String fileName) {
		s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(fileName).build());
		
		return "File deleted: " + fileName;
	}
}
