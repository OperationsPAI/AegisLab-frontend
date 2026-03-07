set dotenv-load := true
set dotenv-filename := ".env.local"

npm_token := env_var_or_default("NPM_TOKEN", "")
registry := env_var_or_default("REGISTRY", "docker.io/opspai")
image := "rcabench-frontend"

default:
    @just --list

# Use short commit hash as version
version := `git rev-parse --short HEAD`

local-install:
    LOCAL_API=true pnpm install

local-debug:
    LOCAL_API=true pnpm run dev --host

build tag=version:
    @if [ -z "{{npm_token}}" ]; then \
        echo "Error: NPM_TOKEN is not defined in .env.local"; \
        exit 1; \
    fi
    export NPM_TOKEN="{{npm_token}}" && \
    docker build \
        --network=host \
        --secret id=NPM_TOKEN,env=NPM_TOKEN \
        -t {{registry}}/{{image}}:{{tag}} .

push tag=version: (build tag)
    docker tag {{registry}}/{{image}}:{{tag}} {{registry}}/{{image}}:latest
    docker push {{registry}}/{{image}}:{{tag}}
    docker push {{registry}}/{{image}}:latest

update-version version:
    @if command -v jq >/dev/null 2>&1; then \
        jq --arg v "{{version}}" '.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json; \
    else \
        sed -i 's/"version": "[^"]*"/"version": "{{version}}"/' package.json; \
    fi
    @if command -v yq >/dev/null 2>&1; then \
        yq -i '.appVersion = "{{version}}"' helm/Chart.yaml; \
    else \
        sed -i 's/^appVersion:.*/appVersion: {{version}}/' helm/Chart.yaml; \
    fi
    @echo "Updated version to {{version}} in package.json and helm/Chart.yaml"