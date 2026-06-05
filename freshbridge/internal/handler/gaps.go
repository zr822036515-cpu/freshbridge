package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type GapsHandler struct{ repo *repository.GapsRepo }

func NewGapsHandler(repo *repository.GapsRepo) *GapsHandler { return &GapsHandler{repo} }

// --- Procurement (public list, auth write) ---

func (h *GapsHandler) ListProcurements(c *gin.Context) {
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListProcurements(category, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"procurements": items, "total": total})
}

func (h *GapsHandler) CreateProcurement(c *gin.Context) {
	var p model.Procurement
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.UserID = c.GetInt64("user_id")
	p.Status = "open"
	if err := h.repo.CreateProcurement(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *GapsHandler) ListMyProcurements(c *gin.Context) {
	userID := c.GetInt64("user_id")
	items, err := h.repo.ListMyProcurements(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"procurements": items})
}

// --- Notifications (auth) ---

func (h *GapsHandler) ListNotifications(c *gin.Context) {
	userID := c.GetInt64("user_id")
	items, err := h.repo.ListNotifications(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notifications": items})
}

func (h *GapsHandler) MarkNotificationRead(c *gin.Context) {
	userID := c.GetInt64("user_id")
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.MarkNotificationRead(userID, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// --- Logistics Timeline (auth) ---

func (h *GapsHandler) GetTimeline(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	items, err := h.repo.GetTimeline(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"timeline": items})
}

// --- Supply/Demand (public) ---

func (h *GapsHandler) ListSupplyDemand(c *gin.Context) {
	items, err := h.repo.ListSupplyDemand("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	supply := make([]model.SupplyDemand, 0)
	demand := make([]model.SupplyDemand, 0)
	for _, it := range items {
		if it.Type == "supply" {
			supply = append(supply, it)
		} else {
			demand = append(demand, it)
		}
	}
	c.JSON(http.StatusOK, gin.H{"supply": supply, "demand": demand})
}

// --- Admin: audit logs ---

func (h *GapsHandler) ListAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	if page < 1 {
		page = 1
	}
	items, total, err := h.repo.ListAuditLogs(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"audit_logs": items, "total": total})
}

// --- Admin: procurements list ---

func (h *GapsHandler) AdminListProcurements(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListAllProcurements(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"procurements": items, "total": total})
}
