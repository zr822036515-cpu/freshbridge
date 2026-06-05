package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type MallHandler struct{ repo *repository.MallRepo }

func NewMallHandler(repo *repository.MallRepo) *MallHandler { return &MallHandler{repo} }

// GET /api/mall/products
func (h *MallHandler) ListProducts(c *gin.Context) {
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	items, total, err := h.repo.ListProducts(category, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"products": items, "total": total})
}

// GET /api/mall/products/:id
func (h *MallHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	p, err := h.repo.GetProduct(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

// GET /api/mall/cart
func (h *MallHandler) ListCart(c *gin.Context) {
	userID := c.GetInt64("user_id")
	items, err := h.repo.ListCart(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

// GET /api/mall/cart/count
func (h *MallHandler) CartCount(c *gin.Context) {
	userID := c.GetInt64("user_id")
	count, err := h.repo.CartCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// POST /api/mall/cart
func (h *MallHandler) AddToCart(c *gin.Context) {
	userID := c.GetInt64("user_id")
	var req struct {
		ProductID int64 `json:"product_id"`
		Quantity  int   `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Quantity < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid params"})
		return
	}
	if err := h.repo.AddToCart(userID, req.ProductID, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// PUT /api/mall/cart/:id
func (h *MallHandler) UpdateCartItem(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req struct {
		Quantity int `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.UpdateCartItem(userID, id, req.Quantity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// DELETE /api/mall/cart/:id
func (h *MallHandler) RemoveCartItem(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.RemoveCartItem(userID, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// POST /api/mall/orders
func (h *MallHandler) CreateOrder(c *gin.Context) {
	userID := c.GetInt64("user_id")
	var req struct {
		ReceiverName    string `json:"receiver_name"`
		ReceiverPhone   string `json:"receiver_phone"`
		ReceiverAddress string `json:"receiver_address"`
		Note            string `json:"note"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Get cart items
	cartItems, err := h.repo.ListCart(userID)
	if err != nil || len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cart is empty"})
		return
	}
	var totalAmount float64
	orderItems := make([]model.MallOrderItem, 0, len(cartItems))
	for _, ci := range cartItems {
		pid := ci["product_id"].(int64)
		name := ci["name"].(string)
		price := ci["price"].(float64)
		qty := ci["quantity"].(int)
		totalAmount += price * float64(qty)
		orderItems = append(orderItems, model.MallOrderItem{
			ProductID:   pid,
			ProductName: name,
			Price:       price,
			Quantity:    qty,
		})
	}
	order := &model.MallOrder{
		UserID:          userID,
		TotalAmount:     totalAmount,
		Status:          "pending",
		ReceiverName:    req.ReceiverName,
		ReceiverPhone:   req.ReceiverPhone,
		ReceiverAddress: req.ReceiverAddress,
		Note:            req.Note,
	}
	if err := h.repo.CreateOrder(order, orderItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Clear cart
	h.repo.ClearCart(userID)
	c.JSON(http.StatusCreated, gin.H{"order": order})
}

// GET /api/mall/orders
func (h *MallHandler) ListOrders(c *gin.Context) {
	userID := c.GetInt64("user_id")
	orders, err := h.repo.ListOrders(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

// GET /api/mall/orders/:id
func (h *MallHandler) GetOrder(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	order, items, err := h.repo.GetOrder(userID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"order": order, "items": items})
}

// PUT /api/mall/orders/:id/cancel
func (h *MallHandler) CancelOrder(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.CancelOrder(userID, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
