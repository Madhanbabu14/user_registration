# User Registration Service

## Overview
This project is a **User Management System** that includes URL shortening and analytics functionality. It leverages PostgreSQL for database management and Redis for real-time analytics. The project provides API endpoints for URL shortening, analytics, and more.

## Features Implemented
- **User Registration**: A user is automatically created if no users exist in the `users` table.
- **URL Shortening**: A service to shorten URLs with custom aliases.
- **URL Redirection**: Redirects users to the original URL based on a shortened alias.
- **Analytics**: Tracks analytics for shortened URLs, including user visits and topics.
  
## API Endpoints

- **POST /api/shorten**  
  Creates a shortened URL from a long URL. Optionally, a custom alias can be provided.
  - Body parameters: `longUrl`, `customAlias`, `topic`

- **GET /api/shorten/{alias}**  
  Redirects the user to the original URL associated with the given alias.

- **GET /api/analytics/{alias}**  
  Retrieves analytics (like user visits) for the given alias from Redis.

- **GET /api/analytics/topic/{topic}**  
  Fetches analytics by topic from Redis.

- **GET /api/analytics/overall**  
  Retrieves overall analytics (total visits, etc.) for all shortened URLs.

## Setup Instructions

1. **Install Dependencies**  
   Make sure you have the required packages:
   npm install --save