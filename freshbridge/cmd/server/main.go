package main

import (
	"freshbridge/internal/config"
	"freshbridge/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	r := gin.Default()
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.Run(":" + cfg.Port)
}
