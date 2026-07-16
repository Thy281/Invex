package main

import (
	"log"

	"github.com/hugoquesada/invex/internal/background"
	"github.com/hugoquesada/invex/internal/config"
	"github.com/hugoquesada/invex/internal/database"
	"github.com/hugoquesada/invex/internal/migrations"
	"github.com/hugoquesada/invex/internal/router"
	"github.com/hugoquesada/invex/internal/services"
	"github.com/hugoquesada/invex/internal/websocket"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	rdb, err := database.NewRedis(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to redis: %v", err)
	}

	if err := migrations.Run(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	hub := websocket.NewHub()
	go hub.Run()

	bridge := websocket.NewRedisBridge(hub, rdb)
	bridge.Start()

	alertSvc := services.NewAlertService(db, rdb, hub)
	autoPOSvc := services.NewAutoPOService(db)

	worker := background.NewWorker(db, rdb, autoPOSvc, alertSvc)
	worker.Start()

	r := router.Setup(cfg, db, rdb, hub, alertSvc, autoPOSvc)

	log.Printf("Server starting on port %s", cfg.AppPort)
	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
