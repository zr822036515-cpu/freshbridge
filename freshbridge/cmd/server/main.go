package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	// Production mode
	gin.SetMode(cfg.GinMode)

	db, err := gorm.Open(mysql.Open(cfg.DB_DSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Connection pool
	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(cfg.DBMaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.DBMaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Duration(cfg.DBConnMaxLifetime) * time.Second)

	// Database tables managed by migrations/001_init.sql
	// Run manually: mysql -u root < migrations/001_init.sql

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

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.RateLimit(100, time.Minute))
	r.Use(middleware.MaxBodySize(1 << 20)) // 1MB

	// Health with DB check
	r.GET("/api/health", func(c *gin.Context) {
		if err := sqlDB.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "db": "disconnected"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
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
		auth.GET("/logistics/:id", logisticsH.GetByID)
		auth.PUT("/logistics/:id/gps", logisticsH.UpdateGPS)
		auth.PUT("/logistics/:id/arrive", logisticsH.Arrive)
	}

	// Market data (no auth required)
	r.GET("/api/market/prices", marketH.GetLatest)
	r.GET("/api/market/prices/date", marketH.GetByDate)

	// Graceful shutdown
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("server starting on :%s (mode=%s)", cfg.Port, cfg.GinMode)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}
	sqlDB.Close()
	log.Println("server stopped")
}
