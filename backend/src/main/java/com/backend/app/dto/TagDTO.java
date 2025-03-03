package com.backend.app.dto;

import java.util.UUID;

public class TagDTO {
	 private UUID id;
	 private String name;
	 
	 public TagDTO() {}
	 
	 
	 public TagDTO(UUID id, String name) {
		super();
		this.id = id;
		this.name = name;
	}
	 
	public UUID getId() {
		 return id;
	}
	public void setId(UUID id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}    
}
