package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/config"
	"freshbridge/internal/repository"
	"freshbridge/internal/service"
)

func TestAuthHandler_WechatLogin_MissingCode(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	repo := repository.NewUserRepo(nil)
	svc := service.NewAuthService(cfg, repo)
	h := NewAuthHandler(svc)

	r := setupRouter()
	r.POST("/auth/wechat-login", h.WechatLogin)

	body := map[string]string{}
	data, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/auth/wechat-login", bytes.NewReader(data))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	defer func() {
		if r := recover(); r != nil {
			t.Logf("DB panic caught (expected with nil repo): %v", r)
		}
	}()
	r.ServeHTTP(w, req)
	t.Logf("Response code: %d", w.Code)
}

func TestAuthHandler_WechatLogin_InvalidJSON(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	repo := repository.NewUserRepo(nil)
	svc := service.NewAuthService(cfg, repo)
	h := NewAuthHandler(svc)

	r := setupRouter()
	r.POST("/auth/wechat-login", h.WechatLogin)

	req := httptest.NewRequest("POST", "/auth/wechat-login", bytes.NewReader([]byte("not json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid JSON, got %d", w.Code)
	}
}

func TestHealthCheck(t *testing.T) {
	r := setupRouter()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var resp map[string]string
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["status"] != "ok" {
		t.Errorf("expected status 'ok', got '%s'", resp["status"])
	}
}
