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

	// Init services
	authSvc := service.NewAuthService(cfg, userRepo)

	// Init handlers
	authH := handler.NewAuthHandler(authSvc)

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
	}

	r.Run(":" + cfg.Port)
}
