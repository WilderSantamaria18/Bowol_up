.PHONY: help up down restart logs build test clean dev-backend dev-frontend

help:
	@echo "Comandos disponibles para BOWOL Platform:"
	@echo "  make up            - Levanta todos los servicios con docker compose"
	@echo "  make down          - Detiene los contenedores locales"
	@echo "  make restart       - Reinicia los servicios locales"
	@echo "  make logs          - Muestra los logs en vivo (backend y frontend)"
	@echo "  make build         - Compila backend y frontend localmente"
	@echo "  make test          - Ejecuta las suites de tests unitarios e integrados"
	@echo "  make clean         - Limpia artefactos generados (target/, dist/)"
	@echo "  make dev-backend   - Arranca el backend Spring Boot localmente"
	@echo "  make dev-frontend  - Arranca el frontend Vite en modo dev"

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

build:
	cd backend && ./mvnw clean package -DskipTests
	cd frontend && npm run build

test:
	cd backend && ./mvnw verify
	cd frontend && npm run test

clean:
	cd backend && ./mvnw clean
	cd frontend && rm -rf dist

dev-backend:
	cd backend && ./mvnw spring-boot:run

dev-frontend:
	cd frontend && npm run dev
