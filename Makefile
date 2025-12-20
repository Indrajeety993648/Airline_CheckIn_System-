.PHONY: dev prod build test load-test clean

# Development
dev:
	cd docker && docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"

# Production
prod:
	cd docker && docker-compose up -d --build

# Build
build:
	cd backend && npm run build
	cd frontend && npm run build

# Install dependencies
install:
	cd backend && npm install
	cd frontend && npm install

# Run tests
test:
	cd backend && npm test

# Load testing
load-test:
	k6 run load-tests/check-in-load-test.js

load-test-spike:
	k6 run load-tests/spike-test.js

load-test-stress:
	k6 run load-tests/stress-test.js

# Database
db-migrate:
	cd backend && npm run migrate

db-seed:
	cd backend && npm run seed

# Logs
logs:
	cd docker && docker-compose logs -f

logs-api:
	cd docker && docker-compose logs -f api

# Clean up
clean:
	cd docker && docker-compose down -v
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf node_modules

# Stop services
stop:
	cd docker && docker-compose down

# Restart
restart: stop dev
