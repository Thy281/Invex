# ---- Development ----
FROM golang:1.22-alpine AS development

RUN apk add --no-cache git curl

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8080

CMD ["go", "run", "./cmd/server/main.go"]

# ---- Build ----
FROM golang:1.22-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /invex-server ./cmd/server/main.go

# ---- Production ----
FROM alpine:3.20 AS production

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=build /invex-server .
COPY migrations/ ./migrations/

EXPOSE 8080

CMD ["./invex-server"]
