# STRAPI Content Model
## Os Papas MC

This document defines the content structure for the Strapi CMS.

The CMS will manage all dynamic content of the Os Papas MC website.

---

# 1. Collection: Chapter (Sede)

Represents each motorcycle club chapter.

Fields:

- name (string, required)
- slug (UID, required, unique)
- city (string, required)
- state (string, required)
- description (rich text)
- hero_image (media, single)
- whatsapp (string)
- instagram (string)
- created_at (datetime)
- updated_at (datetime)

Relations:

- has many Members
- has many Events
- has many Gallery Items

---

# 2. Collection: Member

Represents a club member.

Fields:

- name (string, required)
- nickname (string)
- role (string)
- motorcycle (string)
- photo (media, single)
- active (boolean, default: true)

Relations:

- belongs to one Chapter

---

# 3. Collection: Event

Represents events, rides, and philanthropic actions.

Fields:

- title (string, required)
- slug (UID, required, unique)
- description (rich text)
- date (date)
- city (string)
- cover_image (media, single)
- category (enumeration)

Category values:

- ride
- event
- philanthropy

Relations:

- belongs to one Chapter
- has many Gallery Items

---

# 4. Collection: Gallery Item

Represents images displayed in galleries.

Fields:

- image (media, required)
- description (string)
- category (enumeration)

Category values:

- ride
- event
- philanthropy

Relations:

- optional relation to Chapter
- optional relation to Event

---

# 5. Collection: Road Trip ("Na Estrada")

Optional but recommended for future expansion.

Fields:

- title (string)
- slug (UID)
- description (rich text)
- date (date)
- cover_image (media)
- route_description (rich text)

Relations:

- optional relation to Chapter
- has many Gallery Items

---

# 6. Single Type: Global Settings

Used for global site configuration.

Fields:

- site_name (string)
- motto (string)
- hero_home_image (media)
- contact_email (string)
- instagram_global (string)
- whatsapp_global (string)

---

# 7. Media Configuration

All media must be stored in AWS S3.

Recommended folder structure:

/chapters
/members
/events
/gallery
/roadtrips

---

# 8. Permissions

Public API:

- Chapters → read
- Members → read
- Events → read
- Gallery Items → read
- Road Trips → read
- Global Settings → read

Admin users:

- full CRUD access

---

# 9. API Strategy

The frontend (Next.js) will consume Strapi via REST API.

Example endpoints:

/api/chapters
/api/events
/api/members
/api/gallery-items
/api/road-trips
/api/global-setting