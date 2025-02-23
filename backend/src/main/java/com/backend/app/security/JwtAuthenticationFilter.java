package com.backend.app.security;

import java.io.IOException;
import java.security.Key;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
	@Value("${jwt.secret}")
	private String jwtSecretKey;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authHeader = request.getHeader("Authorization");
		if(authHeader != null && authHeader.startsWith("Bearer ")) {
			String jwt = authHeader.substring(7);
			
			try {
				Key key = new SecretKeySpec(jwtSecretKey.getBytes(), "HMACSHA256");
			
				JwtParser jwtParser = Jwts.parserBuilder().setSigningKey(key).build();
				
				Claims claims = jwtParser.parseClaimsJws(jwt).getBody();
				
				String username = claims.getSubject();
				
				if(username != null) {
					UsernamePasswordAuthenticationToken authentication = 
							new UsernamePasswordAuthenticationToken(username, null, null);
					
					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			} catch (Exception e) {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
				return;
			}
		}
		
		filterChain.doFilter(request, response);
		
	}

}
