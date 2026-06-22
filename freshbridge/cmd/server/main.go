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
	"freshbridge/internal/static"

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
	mallRepo := repository.NewMallRepo(db)
	adminRepo := repository.NewAdminRepo(db)
	gapsRepo := repository.NewGapsRepo(db)
	squareRepo := repository.NewSquareRepo(db)

	// Init services
	authSvc := service.NewAuthService(cfg, userRepo)
	productSvc := service.NewProductService(productRepo)
	marketUpdater := service.NewMarketUpdater(db, 6*time.Hour)

	// Init handlers
	authH := handler.NewAuthHandler(authSvc)
	productH := handler.NewProductHandler(productSvc)
	tradeH := handler.NewTradeHandler(tradeRepo)
	settlementH := handler.NewSettlementHandler(settlementRepo)
	logisticsH := handler.NewLogisticsHandler(logisticsRepo)
	marketH := handler.NewMarketHandler(marketPriceRepo)
	mallH := handler.NewMallHandler(mallRepo)
	adminH := handler.NewAdminHandler(adminRepo, marketUpdater)
	gapsH := handler.NewGapsHandler(gapsRepo)
	squareH := handler.NewSquareHandler(squareRepo, gapsRepo)
	adminV2H := handler.NewAdminV2Handler(adminRepo, squareRepo, gapsRepo)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.MaxBodySize(1 << 20)) // 1MB

	// API group with rate limiting
	api := r.Group("/api")
	api.Use(middleware.RateLimit(200, time.Minute))

	// Public API routes (no auth)
	api.GET("/health", func(c *gin.Context) {
		if err := sqlDB.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "db": "disconnected"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	api.POST("/auth/wechat-login", authH.WechatLogin)
	api.GET("/market/prices", marketH.GetLatest)
	api.GET("/market/prices/date", marketH.GetByDate)
	api.GET("/market/summary", marketH.GetSummary)
	api.GET("/market/trend", marketH.GetTrend)

	// Public info pages
	api.GET("/finance/summary", handler.FinanceSummary)
	api.GET("/supply-demand/list", gapsH.ListSupplyDemand)
	api.GET("/i18n/:locale", handler.I18nMessages)
	api.GET("/procurements", gapsH.ListProcurements)

	// Public mall (browse products)
	api.GET("/mall/products", mallH.ListProducts)
	api.GET("/mall/products/:id", mallH.GetProduct)

	// Public site config
	api.GET("/site-config", func(c *gin.Context) {
		configs, err := adminRepo.GetConfigMap()
		if err != nil { c.JSON(http.StatusOK, gin.H{"configs": map[string]string{}}); return }
		c.JSON(http.StatusOK, gin.H{"configs": configs})
	})

	// Protected routes (auth required)
	auth := api.Group("")
	auth.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		auth.GET("/user/profile", authH.Profile)
		auth.POST("/products", productH.Create)
		auth.POST("/procurements", gapsH.CreateProcurement)
		auth.GET("/procurements/my", gapsH.ListMyProcurements)
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

			// Transport
			auth.GET("/transport/dashboard", handler.DriverDashboard)
			auth.GET("/transport/timeline/:id", gapsH.GetTimeline)

			// Notifications
			auth.GET("/notifications", gapsH.ListNotifications)
			auth.PUT("/notifications/:id/read", gapsH.MarkNotificationRead)

			// Square
			auth.GET("/square/posts", squareH.ListPosts)
			auth.POST("/square/posts", squareH.CreatePost)
			auth.GET("/square/posts/search", squareH.SearchPosts)
			auth.PUT("/square/posts/:id/like", squareH.Like)
			auth.DELETE("/square/posts/:id/like", squareH.Unlike)
			auth.POST("/square/posts/:id/comments", squareH.AddComment)
			auth.GET("/square/posts/:id/comments", squareH.ListComments)
			auth.POST("/square/follow/:user_id", squareH.Follow)
			auth.DELETE("/square/follow/:user_id", squareH.Unfollow)
			auth.GET("/square/posts/:id/phone", squareH.RevealPhone)

			// Mall
			auth.GET("/mall/cart", mallH.ListCart)
			auth.GET("/mall/cart/count", mallH.CartCount)
			auth.POST("/mall/cart", mallH.AddToCart)
			auth.PUT("/mall/cart/:id", mallH.UpdateCartItem)
			auth.DELETE("/mall/cart/:id", mallH.RemoveCartItem)
			auth.POST("/mall/orders", mallH.CreateOrder)
			auth.GET("/mall/orders", mallH.ListOrders)
			auth.GET("/mall/orders/:id", mallH.GetOrder)
			auth.PUT("/mall/orders/:id/cancel", mallH.CancelOrder)
	}

	// Admin login (no auth required)
	r.POST("/admin-api/login", adminV2H.Login)

	// Admin API (token auth)
	adminAPI := r.Group("/admin-api")
	adminAPI.Use(middleware.AdminAuth(cfg.AdminToken))
	adminAPI.Use(middleware.AdminAudit(gapsRepo))
	{
		adminAPI.GET("/dashboard", adminH.Dashboard)
		adminAPI.GET("/users", adminH.ListUsers)
		adminAPI.PUT("/users/:id", adminH.UpdateUser)
		adminAPI.GET("/orders", adminH.ListOrders)
		adminAPI.PUT("/orders/:id", adminH.UpdateOrder)
		adminAPI.GET("/products", adminH.ListProducts)
		adminAPI.POST("/products", adminH.CreateProduct)
		adminAPI.PUT("/products/:id", adminH.UpdateProduct)
		adminAPI.PUT("/products/:id/status", adminH.UpdateProductStatus)
		adminAPI.GET("/procurements", gapsH.AdminListProcurements)
		adminAPI.POST("/update-prices", adminH.TriggerPriceUpdate)
		// Admin v2
	adminAPI.GET("/dashboard-v2", adminV2H.DashboardV2)
	adminAPI.GET("/users-v2", adminV2H.ListUsersV2)
	adminAPI.PUT("/users-v2/:id", adminV2H.UpdateUser)
	adminAPI.GET("/square-posts", adminV2H.ListSquarePosts)
	adminAPI.PUT("/square-posts/:id/approve", adminV2H.ApprovePost)
	adminAPI.PUT("/square-posts/:id/reject", adminV2H.RejectPost)
	adminAPI.PUT("/square-posts/:id/pin", adminV2H.TogglePinPost)
	adminAPI.DELETE("/square-posts/:id", adminV2H.DeleteSquarePost)
	adminAPI.GET("/market-prices", adminV2H.ListMarketPrices)
	adminAPI.POST("/market-prices", adminV2H.CreateMarketPrice)
	adminAPI.PUT("/market-prices/:id", adminV2H.UpdateMarketPrice)
	adminAPI.GET("/banners", adminV2H.ListBanners)
	adminAPI.POST("/banners", adminV2H.CreateBanner)
	adminAPI.PUT("/banners/:id", adminV2H.UpdateBanner)
	adminAPI.DELETE("/banners/:id", adminV2H.DeleteBanner)
	adminAPI.GET("/announcements", adminV2H.ListAnnouncements)
	adminAPI.POST("/announcements", adminV2H.CreateAnnouncement)
	adminAPI.PUT("/announcements/:id", adminV2H.UpdateAnnouncement)
	adminAPI.DELETE("/announcements/:id", adminV2H.DeleteAnnouncement)
	// Upload
	adminAPI.POST("/upload", handler.UploadImage)
	// Site config
	adminAPI.GET("/site-config", adminV2H.ListSiteConfig)
	adminAPI.PUT("/site-config", adminV2H.UpdateSiteConfig)
	adminAPI.GET("/audit-logs", gapsH.ListAuditLogs)
	}

	// Start market price updater (runs every 6h)
	marketUpdater.Start()

	// Admin panel HTML (served at /admin)
	r.GET("/admin", func(c *gin.Context) { c.Redirect(http.StatusMovedPermanently, "/admin/") })
	r.StaticFS("/admin/", static.AdminFS())

	// SPA frontend (embedded H5 build)
	r.NoRoute(gin.WrapH(static.Handler()))

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
	marketUpdater.Stop()
	sqlDB.Close()
	log.Println("server stopped")
}
