# 🧾 System for Accounting of Scientific and Technical Products (SANTP)

A full-stack information system designed to centralize, manage, and analyze scientific and technical outputs — such as publications, patents, and research projects — for universities and research institutions.

Developed as part of the Bachelor’s qualification project at Chernihiv Polytechnic National University.

```bash

## 🚀 Project Overview

The system provides a centralized platform for storing and managing scientific and technical information.
It eliminates manual data entry and fragmented storage (Excel, paper archives, etc.), helping institutions:

Improve data accessibility and transparency

Analyze research productivity

Manage intellectual property and publications

Automate reporting and statistics

The project demonstrates modern web application design using Angular, Spring Boot, and PostgreSQL, ensuring scalability, security, and intuitive user experience.

# 🧩 Features
## 👥 User Management

Registration and authentication with role-based access:

User

Administrator

JWT-based authorization (Spring Security)

## 📚 Scientific Product Management

Record and manage:

Publications

Patents

Research projects

Attach and preview PDF documents

Store metadata and authorship info

## 📊 Analytics and Reporting

Dynamic charts and diagrams (@swimlane/ngx-charts)

Automatic statistics and activity tracking

## 🔐 Security

HTTPS data encryption

SQL injection protection via Hibernate ORM

Access control and user roles

AWS S3 secure file storage

## ☁️ Scalability

Docker-based deployment

AWS cloud integration for file storage

Ready for microservices architecture expansion

## 🛠️ Tech Stack
Layer	Technology
Frontend	Angular 17, Angular Material, TypeScript
Backend	Java 17, Spring Boot, Spring Security, Spring Data JPA
Database	PostgreSQL
Cloud	AWS S3 (for file storage)
Testing	JUnit, Mockito, Cypress
Build Tools	Maven, npm
Version Control	Git / GitHub
## 🧱 Architecture

The system follows a client–server architecture:

Frontend (Angular)
       │
       ▼
Backend API (Spring Boot + REST)
       │
       ▼
Database (PostgreSQL)
       │
       ▼
Cloud Storage (AWS S3)

## ⚙️ Installation & Setup
Prerequisites

Make sure you have installed:

Node.js 18+

Java 17+

Maven

PostgreSQL

Git

1️⃣ Clone the Repository
git clone https://github.com/ShadowDrake21/diploma-work.git
cd diploma-work

2️⃣ Backend Setup
cd backend
mvn clean install
mvn spring-boot:run


The backend will start on http://localhost:8080.

3️⃣ Frontend Setup
cd frontend
npm install
ng serve


The frontend will be available at http://localhost:4200.

4️⃣ Database Configuration

Edit the application.properties file:

spring.datasource.url=jdbc:postgresql://localhost:5432/santp
spring.datasource.username=your_username
spring.datasource.password=your_password

## 🧪 Testing

Unit tests: JUnit + Mockito for backend logic

Integration tests: Spring Boot test suite for API endpoints

UI tests: Cypress for frontend interaction testing

Run all backend tests:

mvn test

## 📄 Documentation

API documentation available via Swagger UI at:

http://localhost:8080/swagger-ui/


Database schema diagrams are located in /docs/db/.

UML diagrams for architecture, use cases, and components in /docs/uml/.

## 🧠 Future Improvements

Transition to microservice architecture

Add notifications and reminders

Integration with external scientific databases (Scopus, ORCID)

Advanced BI dashboards

Multilingual support (EN/UA)

## 👨‍💻 Author

Dmytro Krapyvianskyi
Bachelor of Software Engineering
National University “Chernihiv Polytechnic”
Supervised by Assoc. Prof. Mariia Voitsekhovska

📧 Contact: dimka670020040@gmail.com

📅 Year: 2025

🪪 License

This project is developed for educational and research purposes.
All rights reserved © 2025 Dmytro Krapyvianskyi.
