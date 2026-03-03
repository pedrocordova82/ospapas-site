# Project Specification
## Os Papas MC Website

Author: Pedro Cordova  
Project: Os Papas MC  
Type: Motorcycle Club Website (Institutional + Community)

---

# 1. Project Overview

This project is the official website for the Brazilian motorcycle club **Os Papas MC**.

The goal is to create a modern, visually striking website that presents:

- the motorcycle club
- its chapters (sedes)
- its members
- events and rides
- philanthropic actions
- galleries of rides and events

The site must be easy to maintain by a single developer.

---

# 2. Design Direction

The visual identity must reflect motorcycle culture and brotherhood.

Theme:

- dark
- cinematic
- high contrast
- gold accents

Visual inspiration:

- motorcycle brotherhood
- Harley Davidson aesthetic
- road trips and freedom

Club motto:

FRATRES IN VIA

---

# 3. Technology Stack

Frontend:

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS

Backend CMS:

- Strapi (Headless CMS)

Database:

- PostgreSQL

Storage:

- AWS S3 (images and media)

Infrastructure:

Frontend
- AWS S3 static hosting
- CloudFront CDN

Backend
- Strapi running on EC2 or container

Database
- PostgreSQL

---

# 4. Design System

## Colors

Gold: #F2B705  
Gold Light: #FFD447  
Black: #0B0B0B  
Dark Gray: #141414  
Red Accent: #C1121F  
White: #FFFFFF  
Gray Text: #A1A1A1  

## Typography

Headings:
Bebas Neue

Body:
Inter

## Style Guidelines

- dark background
- large photography
- gold highlights
- minimal animations

---

# 5. Website Pages

The site must include the following pages:

Home  
About the Club  
Chapters  
Single Chapter Page  
Events  
Single Event Page  
Gallery  
Philanthropy  
How to Join  
Contact  

---

# 6. Homepage Structure

Sections:

Hero  
About preview  
Chapters preview  
Upcoming events  
Philanthropy preview  
Road trips section ("Na Estrada")  
Gallery preview  
Call to action  

Hero must include:

Club name  
Motto: FRATRES IN VIA  

Buttons:

View Events  
How to Join  

---

# 7. Chapters (Sedes)

Each chapter page must include:

Hero image  
Chapter description  
Members section  
Chapter events  
Chapter gallery  
Contact section  

Contact section must include:

WhatsApp  
Instagram  

---

# 8. Data Models

## Chapter

Fields:

Name  
City  
State  
Description  
Hero image  
WhatsApp  
Instagram  

---

## Member

Fields:

Name  
Nickname  
Role  
Motorcycle  
Photo  
Chapter reference  

---

## Event

Fields:

Title  
Description  
Date  
City  
Cover image  
Gallery  
Chapter reference  

---

## Gallery Item

Fields:

Image  
Description  
Category  

Categories:

Ride  
Event  
Philanthropy  

---

# 9. UI Components

The project must include reusable UI components:

Header  
Footer  
Hero  
SectionTitle  
Button  
SedeCard  
EventCard  
MemberCard  
GalleryGrid  

---

# 10. Folder Structure

src

app
page.tsx
sobre
sedes
eventos
galeria
filantropia
entrar
contato

components
layout
hero
sedes
membros
eventos
galeria

services
api.ts

types
models.ts

lib
utils.ts

---

# 11. Development Guidelines

Use TypeScript everywhere.

Use TailwindCSS for styling.

Create reusable components.

Avoid unnecessary dependencies.

Keep architecture simple and maintainable.

---

# 12. Deployment

Frontend:

Next.js static build deployed to AWS S3.

CloudFront used as CDN.

Backend:

Strapi running on EC2 or container.

Database:

PostgreSQL.

Media storage:

AWS S3.

---

# 13. Future Enhancements

These features may be implemented later:

Interactive ride map  
Brotherhood member profiles  
Event registration  
Instagram feed integration  
Member portal  

---

# 14. Development Strategy

Development should follow phases.

Phase 1
Project setup  
Design system  
Layout  

Phase 2
Homepage  

Phase 3
Chapters pages  
Members  

Phase 4
Events and gallery  

Phase 5
CMS integration  

---

# 15. Target

The final result should be:

- visually strong
- fast
- responsive
- easy to maintain
- aligned with motorcycle culture
