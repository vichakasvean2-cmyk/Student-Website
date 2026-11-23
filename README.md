# EventHub — Event Posting Website

A full-stack event-posting app built with Vue 3, Node.js/Express, MongoDB, Docker, and AWS-ready configuration.

## Features
- Browse upcoming events
- Search events by title, category, or location
- Create, edit, and delete events
- Event details with date, time, location, category, description, and organizer
- Responsive Vue 3 interface
- REST API with input validation and centralized error handling
- MongoDB persistence
- Docker Compose for local development
- Dockerfiles and AWS deployment notes

## Requirements
- Docker Desktop (recommended), or Node.js 20+ and MongoDB 7+

## Run with Docker
From the project root:

```bash
docker compose up --build
```

Open:
- Frontend: http://localhost:8080
- API health: http://localhost:5000/api/health

The API container connects to MongoDB using the `MONGO_URI` in `docker-compose.yml`.
To stop:

```bash
docker compose down
```

To remove the local database volume too:

```bash
docker compose down -v
```

## Run without Docker

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000`.

## API endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/events` | List events; supports `?search=` and `?category=` |
| GET | `/api/events/:id` | Get one event |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

Example event body:
```json
{
  "title": "Community Tech Meetup",
  "category": "Technology",
  "date": "2027-02-20",
  "time": "09:00",
  "location": "Phnom Penh, Cambodia",
  "organizer": "EventHub Team",
  "description": "Meet local developers and share ideas."
}
```

## AWS deployment outline
This project is containerized and can be deployed to AWS:
1. Create an Amazon ECR repository for `eventhub-api` and `eventhub-web`.
2. Build and push each Docker image to ECR.
3. Create an Amazon DocumentDB cluster (MongoDB-compatible) or use MongoDB Atlas.
4. Deploy the containers with Amazon ECS Fargate behind an Application Load Balancer.
5. Set `MONGO_URI`, `PORT`, and `CORS_ORIGIN` as ECS task environment variables/secrets.
6. Configure HTTPS with AWS Certificate Manager and DNS with Route 53.

For production, use a managed database, private networking, HTTPS, secure secrets, and backups. Do not commit real credentials.
