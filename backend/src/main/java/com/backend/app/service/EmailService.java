package com.backend.app.service;

import java.security.SecureRandom;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	private static final String VERIFICATION_SUBJECT = "Email Verification Code";
	private static final String PASSWORD_RESET_SUBJECT = "Password Reset Request";
	private static final int VERIFICATION_CODE_LENGTH = 6;
	
	private final JavaMailSender mailSender;
	private final SecureRandom secureRandom;
	
	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
		this.secureRandom = new SecureRandom();
	}
	
	public void sendVerificationCode(String email, String code) {
		SimpleMailMessage message = createEmailMessage(email, VERIFICATION_SUBJECT, "Your verification code is: " + code);
		mailSender.send(message);
	}
	
	public String generateVerificationCode() {
		return String.format("%0" + VERIFICATION_CODE_LENGTH + "d", 
	            secureRandom.nextInt((int) Math.pow(10, VERIFICATION_CODE_LENGTH)));
	}
	
	public void sendPasswordResetEmail(String email, String resetToken) {
		String resetLink =String.format("http://localhost:4200/authentication/recover-password/reset-password?token=%s", resetToken);
		SimpleMailMessage message = createEmailMessage(email, PASSWORD_RESET_SUBJECT, "Click the following link to reset your password: " + resetLink);
		mailSender.send(message);
	}
	
	private SimpleMailMessage createEmailMessage(String to, String subjct, String text) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(to);
		message.setSubject(subjct);
		message.setText(text);
		return message;
	}
}
