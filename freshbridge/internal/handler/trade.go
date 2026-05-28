package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type TradeHandler struct{ repo *repository.TradeRepo }

func NewTradeHandler(repo *repository.TradeRepo) *TradeHandler { return &TradeHandler{repo} }

// POST /api/trades — stall initiates trade offer
func (h *TradeHandler) Create(c *gin.Context) {
	var t model.TradeOrder
	if err := c.ShouldBindJSON(&t); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	t.StallID = c.GetInt64("user_id")
	t.Status = "pending"
	if t.PricingMode == "" {
		t.PricingMode = "fixed"
	}
	if err := h.repo.Create(&t); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, t)
}

// PUT /api/trades/:id/accept — farmer accepts trade offer
func (h *TradeHandler) Accept(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	trade, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	trade.Status = "accepted"
	if err := h.repo.Update(trade); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, trade)
}

// POST /api/sales — stall records a sale entry
func (h *TradeHandler) RecordSale(c *gin.Context) {
	var sr model.SalesRecord
	if err := c.ShouldBindJSON(&sr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sr.StallID = c.GetInt64("user_id")
	sr.TotalAmount = sr.Quantity * sr.Price
	if sr.RecordMethod == "" {
		sr.RecordMethod = "manual"
	}
	if sr.SaleTime.IsZero() {
		sr.SaleTime = time.Now()
	}
	if err := h.repo.CreateSale(&sr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sr)
}

// GET /api/trades/my — list my trades with product info
func (h *TradeHandler) ListMy(c *gin.Context) {
	userID := c.GetInt64("user_id")
	farmerTrades, _ := h.repo.FindByFarmer(userID)
	stallTrades, _ := h.repo.FindByStall(userID)
	allTrades := append(farmerTrades, stallTrades...)
	if allTrades == nil {
		allTrades = []model.TradeOrder{}
	}

	// Collect product IDs and fetch product info
	productIDs := make([]int64, 0, len(allTrades))
	for _, t := range allTrades {
		productIDs = append(productIDs, t.ProductID)
	}
	products, _ := h.repo.FindProductsByIDs(productIDs)
	productMap := make(map[int64]model.Product)
	for _, p := range products {
		productMap[p.ID] = p
	}

	// Build response with product info merged into each trade
	type tradeWithProduct struct {
		model.TradeOrder
		Product *model.Product `json:"product,omitempty"`
	}
	result := make([]tradeWithProduct, 0, len(allTrades))
	for _, t := range allTrades {
		twp := tradeWithProduct{TradeOrder: t}
		if p, ok := productMap[t.ProductID]; ok {
			twp.Product = &p
		}
		result = append(result, twp)
	}

	c.JSON(http.StatusOK, gin.H{"trades": result})
}

// GET /api/trades/:id/sales — get sales records for a trade
func (h *TradeHandler) GetSales(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	records, err := h.repo.GetSalesByTrade(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sales": records})
}
