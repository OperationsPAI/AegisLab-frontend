set dotenv-load := true
set dotenv-filename := ".env.local"

npm_token := env_var_or_default("NPM_TOKEN", "")
registry := "10.10.10.240"
image := "library/rcabench-frontend"

default:
    @just --list

# Get version from latest git tag (strip leading 'v'), fallback to 'latest'
version := `git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || echo "latest"`

build tag=version:
    @if [ -z "{{npm_token}}" ]; then \
        echo "Error: NPM_TOKEN is not defined in .env.local"; \
        exit 1; \
    fi
    export NPM_TOKEN="{{npm_token}}" && \
    docker build \
        --network=host \
        --secret id=NPM_TOKEN,env=NPM_TOKEN \
        -t {{registry}}/{{image}}:latest .

run tag=version api_target="http://172.17.0.1:8082":
    docker run -itd -p 3090:80 \
        -e API_TARGET={{api_target}} \
        {{registry}}/{{image}}:{{tag}}

local-debug:
    LOCAL_API=true pnpm run dev

deploy tag=version: (build tag)
    docker push {{registry}}/{{image}}:{{tag}}

# Deploy with both version tag and latest
deploy-latest tag=version: (build tag)
    docker tag {{registry}}/{{image}}:{{tag}} {{registry}}/{{image}}:latest
    docker push {{registry}}/{{image}}:{{tag}}
    docker push {{registry}}/{{image}}:latest

# Helm install/upgrade
helm-install release="rcabench-frontend" namespace="default" api_target="http://rcabench-backend:8082" tag=version:
    helm upgrade --install {{release}} ./helm/rcabench-frontend \
        --namespace {{namespace}} \
        --set image.tag={{tag}} \
        --set apiTarget={{api_target}}