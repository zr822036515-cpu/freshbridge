package middleware

import (
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SecurityHeaders adds common HTTP security headers.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Cache-Control", "no-store")
		c.Next()
	}
}

// Sensitive words for content moderation
var sensitiveWords = []string{
	"赌博", "色情", "违禁", "枪支", "毒品",
	"刷单", "兼职", "日赚",
}

func SanitizeContent(text string) (string, bool) {
	lower := strings.ToLower(text)
	for _, w := range sensitiveWords {
		if strings.Contains(lower, strings.ToLower(w)) {
			return w, false
		}
	}
	return "", true
}

// MaskPhone hides middle digits of a phone number
func MaskPhone(phone string) string {
	p := strings.TrimSpace(phone)
	if len(p) < 7 {
		return p
	}
	return p[:3] + strings.Repeat("*", len(p)-7) + p[len(p)-4:]
}

// --- Phone Reveal Rate Limiter ---
type phoneRateLimit struct {
	mu    sync.Mutex
	store map[int64]struct {
		count    int
		resetDay string
	}
}

var phoneLimiter = &phoneRateLimit{store: make(map[int64]struct {
	count    int
	resetDay string
})}

const maxFreePhoneReveals = 5

func CheckPhoneRevealLimit(userID int64) (bool, int) {
	phoneLimiter.mu.Lock()
	defer phoneLimiter.mu.Unlock()
	today := time.Now().Format("2006-01-02")
	e := phoneLimiter.store[userID]
	if e.resetDay != today {
		e.count = 0
		e.resetDay = today
	}
	remaining := maxFreePhoneReveals - e.count
	if remaining <= 0 {
		return false, 0
	}
	return true, remaining
}

func RecordPhoneReveal(userID int64) {
	phoneLimiter.mu.Lock()
	defer phoneLimiter.mu.Unlock()
	today := time.Now().Format("2006-01-02")
	e := phoneLimiter.store[userID]
	if e.resetDay != today {
		e.count = 0
		e.resetDay = today
	}
	e.count++
	phoneLimiter.store[userID] = e
}
