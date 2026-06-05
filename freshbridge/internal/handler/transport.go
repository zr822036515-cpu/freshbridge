package handler

import (
	"net/http"

	"freshbridge/internal/service"

	"github.com/gin-gonic/gin"
)

// GET /api/transport/driver-dashboard
func DriverDashboard(c *gin.Context) {
	userID := c.GetInt64("user_id")
	c.JSON(http.StatusOK, gin.H{
		"today_orders":  3,
		"active_orders": 2,
		"total_km":      1850,
		"total_earnings": 28600.00,
		"pending_count": 5,
		"user_id":       userID,
	})
}

// GET /api/transport/timeline/:id
func DeliveryTimeline(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"timeline": []gin.H{
			{"time": "2026-06-04 08:30", "status": "accepted", "desc": "司机已接单"},
			{"time": "2026-06-04 09:15", "status": "loading", "desc": "到达装货地，开始装车"},
			{"time": "2026-06-04 11:00", "status": "in_transit", "desc": "已发车，在途运输中"},
			{"time": "2026-06-04 14:30", "status": "update", "desc": "GPS更新：已行驶320km"},
			{"time": "2026-06-04 18:00", "status": "arrived", "desc": "预计18:00到达目的地"},
		},
		"current": gin.H{
			"lat": 30.5728, "lng": 104.0668, "speed": 85, "heading": "东南",
		},
	})
}

// GET /api/i18n/:locale
func I18nMessages(c *gin.Context) {
	locale := c.Param("locale")
	var msgs map[string]string
	switch locale {
	case "en", "en-US":
		msgs = service.LocaleEN
	default:
		msgs = service.LocaleZH
	}
	c.JSON(http.StatusOK, gin.H{"locale": locale, "messages": msgs})
}
