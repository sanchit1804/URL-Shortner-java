# URL Shortener Microservice

A Spring Boot REST API that shortens long URLs into compact, shareable links using Base62 encoding and Redis for storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.3.4 |
| Storage | Redis (via Jedis client) |
| Encoding | Base62 (custom implementation) |
| Build | Gradle 8.9 |
| Testing | JUnit 5 |

---

## Project Structure

```
src/main/java/urlshortener/app/
├── URLShortenerApplication.java      # Entry point
├── common/
│   ├── IDConverter.java              # Base62 encoding/decoding
│   └── URLValidator.java             # URL validation via regex
├── controller/
│   └── URLController.java            # REST endpoints
├── service/
│   └── URLConverterService.java      # Business logic
├── repository/
│   └── URLRepository.java            # Redis data access
├── dto/
│   ├── ShortenRequest.java           # POST request body
│   └── ShortenResponse.java          # POST response body
└── exception/
    ├── GlobalExceptionHandler.java   # Maps exceptions to HTTP codes
    ├── InvalidURLException.java      # 400 Bad Request
    └── URLNotFoundException.java     # 404 Not Found
```

---

## How It Works

1. Client sends a `POST` request with a long URL
2. App validates the URL format
3. Redis `INCR` generates a unique numeric ID
4. ID is encoded to Base62 (e.g. `1` → `b`, `2` → `c`)
5. Short ID + long URL saved as a Redis hash field
6. Client receives the short URL
7. On `GET /{id}`, app looks up the original URL and redirects

---

## Prerequisites

- Java 17
- Gradle 8.9 (via wrapper — no global install needed)
- Redis (installed via Homebrew)

---

## Setup & Run

### 1. Install Redis
```bash
brew install redis
```

### 2. Start Redis
```bash
brew services start redis
```

### 3. Verify Redis is running
```bash
redis-cli ping
# Expected: PONG
```

### 4. Clone and navigate to project
```bash
cd "/Users/san/Documents/Url Shortner/URL-Shortner-java/URLShortener-master"
```

### 5. Start the application
```bash
./gradlew bootRun
```

Wait for:
```
Started URLShortenerApplication in X.XXX seconds
```

App runs on `http://localhost:8080`

---

## API Endpoints

### POST /shortener — Shorten a URL

**Request:**
```
POST http://localhost:8080/shortener
Content-Type: application/json
```

**Body:**
```json
{
    "url": "https://www.google.com"
}
```

**Response:**
```json
{
    "shortUrl": "http://localhost:8080/b"
}
```

---

### GET /{id} — Redirect to original URL

**Request:**
```
GET http://localhost:8080/b
```

**Response:**
```
302 Found
Location: https://www.google.com
```

---

## Example Walkthrough

### Example 1 — Google

**POST Request:**
```json
{"url": "https://www.google.com"}
```
**Response:**
```json
{"shortUrl": "http://localhost:8080/b"}
```
**GET `http://localhost:8080/b`** → redirects to `https://www.google.com`

---

### Example 2 — GitHub

**POST Request:**
```json
{"url": "https://www.github.com"}
```
**Response:**
```json
{"shortUrl": "http://localhost:8080/c"}
```
**GET `http://localhost:8080/c`** → redirects to `https://www.github.com`

---

### Example 3 — YouTube

**POST Request:**
```json
{"url": "https://www.youtube.com"}
```
**Response:**
```json
{"shortUrl": "http://localhost:8080/d"}
```
**GET `http://localhost:8080/d`** → redirects to `https://www.youtube.com`

---

## Error Responses

### Invalid URL — 400 Bad Request
```json
{"url": "not-a-valid-url"}
```
```json
{"error": "Please enter a valid URL: not-a-valid-url"}
```

### Empty URL — 400 Bad Request
```json
{"url": ""}
```
```json
{"error": "url must not be blank"}
```

### ID Not Found — 404 Not Found
```
GET http://localhost:8080/zzz
```
```json
{"error": "No URL found for id: zzz"}
```

---

## Postman Setup

| Field | Value |
|---|---|
| Method | POST |
| URL | `http://localhost:8080/shortener` |
| Body | raw → JSON |
| Content-Type | `application/json` (auto-set when Body is set to JSON) |

---

## Redis Commands

```bash
# Open Redis CLI
redis-cli

# See all stored short URLs
HGETALL url:

# Look up one specific short ID
HGET url: b

# Check total URLs shortened (ID counter)
GET id

# Delete one specific entry
HDEL url: b

# Wipe everything (use carefully)
FLUSHALL

# Exit CLI
exit
```

---

## Running Tests

Make sure Redis is running, then:

```bash
./gradlew test
```

Expected output:
```
URLRepositoryTest > getNextId_incrementsAndReturnsValue() PASSED
URLRepositoryTest > save_and_findByShortId_roundTrip() PASSED
URLRepositoryTest > findByShortId_returnsEmptyWhenNotFound() PASSED

BUILD SUCCESSFUL
```

---

## Stop Everything

```bash
# Stop the Spring Boot app
Ctrl + C

# Stop Redis
brew services stop redis

# Verify Redis stopped
brew services list
```

---

## Next Time — Start Order

Always start in this order:
```bash
brew services start redis
./gradlew bootRun
```

---

## Author

Sanchit Badyal
GitHub: [@sanchit1804](https://github.com/sanchit1804)