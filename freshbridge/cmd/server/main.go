package main

import (
	"log"

	"freshbridge/internal/config"
	"freshbridge/internal/handler"
	"freshbridge/internal/middleware"
	"freshbridge/internal/repository"
	"freshbridge/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(mysql.Open(cfg.DB_DSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Init repos
	userRepo := repository.NewUserRepo(db)
	productRepo := repository.NewProductRepo(db)
	tradeRepo := repository.NewTradeRepo(db)
	settlementRepo := repository.NewSettlementRepo(db)
	logisticsRepo := repository.NewLogisticsRepo(db)
	marketPriceRepo := repository.NewMarketPriceRepo(db)

	// Init services
	authSvc := service.NewAuthService(cfg, userRepo)
	productSvc := service.NewProductService(productRepo)

	// Init handlers
	authH := handler.NewAuthHandler(authSvc)
	productH := handler.NewProductHandler(productSvc)
	tradeH := handler.NewTradeHandler(tradeRepo)
	settlementH := handler.NewSettlementHandler(settlementRepo)
	logisticsH := handler.NewLogisticsHandler(logisticsRepo)
	marketH := handler.NewMarketHandler(marketPriceRepo)

	r := gin.Default()
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// Health
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth (no token required)
	r.POST("/api/auth/wechat-login", authH.WechatLogin)

	// Protected routes
	auth := r.Group("/api")
	auth.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		auth.GET("/user/profile", authH.Profile)
		auth.POST("/products", productH.Create)
		auth.GET("/products", productH.Search)
		auth.GET("/products/my", productH.ListMy)
		auth.GET("/products/:id", productH.GetByID)
		auth.POST("/trades", tradeH.Create)
		auth.PUT("/trades/:id/accept", tradeH.Accept)
		auth.GET("/trades/my", tradeH.ListMy)
		auth.GET("/trades/:id/sales", tradeH.GetSales)
		auth.POST("/sales", tradeH.RecordSale)
		auth.GET("/settlements", settlementH.ListMy)
		auth.GET("/settlements/:tradeId", settlementH.GetByTrade)
		auth.POST("/logistics", logisticsH.Create)
		auth.GET("/logistics/available", logisticsH.ListAvailable)
		auth.GET("/logistics/my", logisticsH.ListMy)
		auth.PUT("/logistics/:id/accept", logisticsH.Accept)
		auth.PUT("/logistics/:id/gps", logisticsH.UpdateGPS)
	}

	// Market data (no auth required)
	r.GET("/api/market/prices", marketH.GetLatest)
	r.GET("/api/market/prices/date", marketH.GetByDate)

	r.Run(":" + cfg.Port)
}
