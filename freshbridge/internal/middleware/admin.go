package middleware

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

const (
	adminMaxFails   = 5
	adminFailWindow = 15 * time.Minute
	adminBanMinutes = 30
)

type adminFailEntry struct {
	count     int
	firstFail time.Time
	bannedAt  time.Time
}

var (
	adminFailMap   = make(map[string]*adminFailEntry)
	adminFailMu    sync.Mutex
	adminCleanOnce sync.Once
)

func adminFailCleanup() {
	for {
		time.Sleep(5 * time.Minute)
		adminFailMu.Lock()
		cutoff := time.Now().Add(-adminFailWindow * 2)
		for ip, e := range adminFailMap {
			if e.bannedAt.IsZero() && e.firstFail.Before(cutoff) {
				delete(adminFailMap, ip)
			}
			if !e.bannedAt.IsZero() && e.bannedAt.Add(adminBanMinutes*time.Minute).Before(time.Now()) {
				delete(adminFailMap, ip)
			}
		}
		adminFailMu.Unlock()
	}
}

func AdminAuth(adminToken string) gin.HandlerFunc {
	adminCleanOnce.Do(func() { go adminFailCleanup() })

	return func(c *gin.Context) {
		if adminToken == "" {
			c.Next()
			return
		}

		ip := c.ClientIP()

		// Check if this IP is banned
		adminFailMu.Lock()
		if e, ok := adminFailMap[ip]; ok && !e.bannedAt.IsZero() {
			if time.Since(e.bannedAt) < adminBanMinutes*time.Minute {
				adminFailMu.Unlock()
				c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
					"error":   "too many failed attempts, try again later",
					"retryIn": int(adminBanMinutes*time.Minute-time.Since(e.bannedAt)) / int(time.Second),
				})
				return
			}
			delete(adminFailMap, ip) // ban expired
		}
		adminFailMu.Unlock()

		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			recordAdminFail(ip)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")
		if token != adminToken {
			recordAdminFail(ip)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid admin token"})
			return
		}

		// Auth success — clear fail record
		adminFailMu.Lock()
		delete(adminFailMap, ip)
		adminFailMu.Unlock()

		c.Next()
	}
}

func recordAdminFail(ip string) {
	adminFailMu.Lock()
	defer adminFailMu.Unlock()

	e, ok := adminFailMap[ip]
	if !ok || e.firstFail.IsZero() || time.Since(e.firstFail) > adminFailWindow {
		adminFailMap[ip] = &adminFailEntry{count: 1, firstFail: time.Now()}
		return
	}
	e.count++
	if e.count >= adminMaxFails {
		e.bannedAt = time.Now()
	}
}

// AdminAudit logs admin API requests to the database.
func AdminAudit(repo *repository.GapsRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Build action from method + path segment
		method := c.Request.Method
		path := c.Request.URL.Path
		action := method + " " + strings.TrimPrefix(path, "/admin-api")

		// Mask token for privacy
		token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		masked := ""
		if len(token) > 4 {
			h := sha256.Sum256([]byte(token))
			masked = fmt.Sprintf("%x", h[:8]) // first 16 hex chars
		}

		entry := &model.AdminAuditLog{
			AdminToken: masked,
			Method:     method,
			Path:       path,
			Action:     action,
			IP:         c.ClientIP(),
			StatusCode: c.Writer.Status(),
		}

		// Fire and forget — don't block the response
		go func() {
			_ = repo.CreateAuditLog(entry)
		}()
	}
}
