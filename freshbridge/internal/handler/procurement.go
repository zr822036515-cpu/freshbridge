package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type procurementReq struct {
	Category     string  `json:"category"`
	Variety      string  `json:"variety"`
	Quantity     float64 `json:"quantity"`
	Price        float64 `json:"price"`
	Grade        string  `json:"grade"`
	DeliveryDate string  `json:"delivery_date"`
	DeliveryAddr string  `json:"delivery_addr"`
	Note         string  `json:"note"`
}

// POST /api/procurements
func CreateProcurement(c *gin.Context) {
	var req procurementReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetInt64("user_id")
	// TODO: persist to procurement table when ready
	_ = userID
	c.JSON(http.StatusCreated, gin.H{"ok": true, "message": "采购需求已发布"})
}
