package router

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/hugoquesada/invex/internal/config"
	"github.com/hugoquesada/invex/internal/handlers"
	"github.com/hugoquesada/invex/internal/middleware"
	"github.com/hugoquesada/invex/internal/models"
	"github.com/hugoquesada/invex/internal/services"
	ws "github.com/hugoquesada/invex/internal/websocket"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Setup(cfg *config.Config, db *gorm.DB, rdb *redis.Client, hub *ws.Hub,
	alertSvc *services.AlertService, autoPOSvc *services.AutoPOService) *gin.Engine {

	r := gin.Default()

	r.Use(middleware.CORS())

	// Services
	authSvc := services.NewAuthService(db, cfg)
	invSvc := services.NewInventoryService(db, hub, alertSvc)

	productCRUD := services.NewCRUDService[models.Product](db)
	supplierCRUD := services.NewCRUDService[models.Supplier](db)
	locationCRUD := services.NewCRUDService[models.Location](db)
	categoryCRUD := services.NewCRUDService[models.Category](db)

	// Handlers
	authH := handlers.NewAuthHandler(authSvc)
	productH := handlers.NewProductHandler(productCRUD)
	supplierH := handlers.NewSupplierHandler(supplierCRUD)
	locationH := handlers.NewLocationHandler(locationCRUD)
	categoryH := handlers.NewCategoryHandler(categoryCRUD)
	inventoryH := handlers.NewInventoryHandler(invSvc)
	dashboardH := handlers.NewDashboardHandler(db)
	inventoryListH := handlers.NewInventoryListHandler(db)
	movementListH := handlers.NewMovementListHandler(db)

	// Public routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	auth := r.Group("/api/auth")
	{
		auth.POST("/login", authH.Login)
	}

	// WebSocket
	r.GET("/ws", func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}
		userID := c.Query("user_id")
		if userID == "" {
			userID = "anonymous"
		}
		hub.HandleWebSocket(conn, userID, []string{})
	})

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))
	{
		api.GET("/auth/me", authH.Me)

		// Categories
		categories := api.Group("/categories")
		{
			categories.GET("", categoryH.List)
			categories.GET("/:id", categoryH.Get)
			categories.POST("", middleware.RequireRole("manager"), categoryH.Create)
			categories.PUT("/:id", middleware.RequireRole("manager"), categoryH.Update)
			categories.DELETE("/:id", middleware.RequireRole("admin"), categoryH.Delete)
		}

		// Suppliers
		suppliers := api.Group("/suppliers")
		{
			suppliers.GET("", supplierH.List)
			suppliers.GET("/:id", supplierH.Get)
			suppliers.POST("", middleware.RequireRole("manager"), supplierH.Create)
			suppliers.PUT("/:id", middleware.RequireRole("manager"), supplierH.Update)
			suppliers.DELETE("/:id", middleware.RequireRole("admin"), supplierH.Delete)
		}

		// Locations
		locations := api.Group("/locations")
		{
			locations.GET("", locationH.List)
			locations.GET("/:id", locationH.Get)
			locations.POST("", middleware.RequireRole("manager"), locationH.Create)
			locations.PUT("/:id", middleware.RequireRole("manager"), locationH.Update)
			locations.DELETE("/:id", middleware.RequireRole("admin"), locationH.Delete)
		}

		// Products
		products := api.Group("/products")
		{
			products.GET("", productH.List)
			products.GET("/:id", productH.Get)
			products.POST("", middleware.RequireRole("manager"), productH.Create)
			products.PUT("/:id", middleware.RequireRole("manager"), productH.Update)
			products.DELETE("/:id", middleware.RequireRole("admin"), productH.Delete)
		}

		// Dashboard
		api.GET("/dashboard", dashboardH.GetDashboard)

		// Inventory
		api.GET("/inventory", inventoryListH.List)

		// Movements
		movements := api.Group("/movements")
		{
			movements.GET("", movementListH.List)
			movements.POST("/in", middleware.RequireRole("operator"), inventoryH.StockIn)
			movements.POST("/out", middleware.RequireRole("operator"), inventoryH.StockOut)
			movements.POST("/transfer", middleware.RequireRole("operator"), inventoryH.Transfer)
			movements.POST("/adjust", middleware.RequireRole("manager"), inventoryH.Adjust)
		}
	}

	return r
}
