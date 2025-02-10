package com.backend.app.service;

import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	private final JavaMailSender mailSender;
	
	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}
	
	public void sendVerificationCode(String email, String code) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(email);
		message.setSubject("Email Verification Code");
		message.setText("Your verification code is: " + code);
		mailSender.send(message);
	}
	
	public String generateVerificationCode() {
		return String.format("%06d", new Random().nextInt(999999));
	}
	
	public void sendPasswordResetEmail(String email, String resetToken) {
		String resetLink = "http://localhost:4200/reset-password?token=" + resetToken;
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(email);
		message.setSubject("Password Reset Request");
		message.setText("Click the following link to reset your password: " + resetToken);
		mailSender.send(message);
	}
}
