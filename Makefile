.PHONY: memory-up memory-down memory-logs guardrails-up guardrails-down guardrails-logs patterns-up patterns-down patterns-logs mcp-up mcp-down mcp-logs

DOCKER_COMPOSE := docker compose
DC_FILE := -f docker-compose.mcp.yml

memory-up:
	$(DOCKER_COMPOSE) $(DC_FILE) up memory --build -d

memory-down:
	$(DOCKER_COMPOSE) $(DC_FILE) stop memory

memory-logs:
	$(DOCKER_COMPOSE) $(DC_FILE) logs -f memory

guardrails-up:
	$(DOCKER_COMPOSE) $(DC_FILE) up guardrails --build -d

guardrails-down:
	$(DOCKER_COMPOSE) $(DC_FILE) stop guardrails

guardrails-logs:
	$(DOCKER_COMPOSE) $(DC_FILE) logs -f guardrails

patterns-up:
	$(DOCKER_COMPOSE) $(DC_FILE) up patterns --build -d

patterns-down:
	$(DOCKER_COMPOSE) $(DC_FILE) stop patterns

patterns-logs:
	$(DOCKER_COMPOSE) $(DC_FILE) logs -f patterns

mcp-up:
	$(DOCKER_COMPOSE) $(DC_FILE) up --build -d

mcp-down:
	$(DOCKER_COMPOSE) $(DC_FILE) down

mcp-logs:
	$(DOCKER_COMPOSE) $(DC_FILE) logs -f
