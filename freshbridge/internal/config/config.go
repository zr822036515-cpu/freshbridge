package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port      string
	DB_DSN    string
	RedisAddr string
	JWTSecret string
	GinMode   string

	// WeChat
	WechatAppID     string
	WechatAppSecret string

	// Admin
	AdminToken string

	// JWT
	JWTExpiryHours int

	// DB Pool
	DBMaxOpenConns    int
	DBMaxIdleConns    int
	DBConnMaxLifetime int // seconds
}

func Load() *Config {
	return &Config{
		Port:              getEnv("PORT", "8080"),
		DB_DSN:            getEnv("DB_DSN", "root:@tcp(127.0.0.1:3306)/freshbridge?charset=utf8mb4&parseTime=True"),
		RedisAddr:         getEnv("REDIS_ADDR", "localhost:6379"),
		JWTSecret:         getEnv("JWT_SECRET", "freshbridge-secret-key-change-in-production"),
		GinMode:           getEnv("GIN_MODE", "release"),
		WechatAppID:       getEnv("WECHAT_APP_ID", ""),
		WechatAppSecret:   getEnv("WECHAT_APP_SECRET", ""),
		AdminToken:         getEnv("ADMIN_TOKEN", "freshbridge-admin-2024"),
			JWTExpiryHours:     getEnvInt("JWT_EXPIRY_HOURS", 72),
		DBMaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
		DBMaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 10),
		DBConnMaxLifetime: getEnvInt("DB_CONN_MAX_LIFETIME", 300),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
