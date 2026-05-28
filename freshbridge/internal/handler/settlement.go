package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

// --- Settlement ---

type SettlementHandler struct{ repo *repository.SettlementRepo }

func NewSettlementHandler(repo *repository.SettlementRepo) *SettlementHandler {
	return &SettlementHandler{repo}
}

func (h *SettlementHandler) ListMy(c *gin.Context) {
	userID := c.GetInt64("user_id")
	items, err := h.repo.FindByFarmer(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"settlements": items})
}

func (h *SettlementHandler) GetByTrade(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("tradeId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	s, err := h.repo.FindByTrade(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, s)
}

// --- Logistics ---

type LogisticsHandler struct{ repo *repository.LogisticsRepo }

func NewLogisticsHandler(repo *repository.LogisticsRepo) *LogisticsHandler {
	return &LogisticsHandler{repo}
}

func (h *LogisticsHandler) Create(c *gin.Context) {
	var l model.Logistics
	if err := c.ShouldBindJSON(&l); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	l.FarmerID = c.GetInt64("user_id")
	l.Status = "pending"
	if err := h.repo.Create(&l); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, l)
}

func (h *LogisticsHandler) ListAvailable(c *gin.Context) {
	items, err := h.repo.FindPending()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"logistics": items})
}

func (h *LogisticsHandler) ListMy(c *gin.Context) {
	userID := c.GetInt64("user_id")
	items, err := h.repo.FindByDriver(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"logistics": items})
}

func (h *LogisticsHandler) Accept(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	l, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	driverID := c.GetInt64("user_id")
	l.DriverID = &driverID
	l.Status = "accepted"
	if err := h.repo.Update(l); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, l)
}

func (h *LogisticsHandler) UpdateGPS(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	l, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var req struct {
		Lat float64 `json:"lat"`
		Lng float64 `json:"lng"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	l.GPSLat = req.Lat
	l.GPSLng = req.Lng
	if err := h.repo.Update(l); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, l)
}

// --- MarketPrice ---

type MarketHandler struct{ repo *repository.MarketPriceRepo }

func NewMarketHandler(repo *repository.MarketPriceRepo) *MarketHandler {
	return &MarketHandler{repo}
}

func (h *MarketHandler) GetLatest(c *gin.Context) {
	category := c.Query("category")
	items, err := h.repo.GetLatest(category, 30)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"prices": items})
}

func (h *MarketHandler) GetByDate(c *gin.Context) {
	date := c.Query("date")
	items, err := h.repo.GetByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"prices": items})
}
