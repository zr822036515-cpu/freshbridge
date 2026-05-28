package config

import "os"

type Config struct {
	Port      string
	DB_DSN    string
	RedisAddr string
	JWTSecret string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "8080"),
		DB_DSN:    getEnv("DB_DSN", "root:@tcp(127.0.0.1:3306)/freshbridge?charset=utf8mb4&parseTime=True"),
		RedisAddr: getEnv("REDIS_ADDR", "localhost:6379"),
		JWTSecret: getEnv("JWT_SECRET", "freshbridge-secret-key-change-in-production"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
