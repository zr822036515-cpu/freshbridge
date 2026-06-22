package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type AdminV2Handler struct {
	repo     *repository.AdminRepo
	squareRepo *repository.SquareRepo
	gapsRepo *repository.GapsRepo
}

func NewAdminV2Handler(repo *repository.AdminRepo, squareRepo *repository.SquareRepo, gapsRepo *repository.GapsRepo) *AdminV2Handler {
	return &AdminV2Handler{repo, squareRepo, gapsRepo}
}

// ===== Auth =====
func (h *AdminV2Handler) Login(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	admin, err := h.repo.FindAdmin(body.Username)
	if err != nil || admin.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "账号或密码错误"})
		return
	}
	// Password validation (MVP: hardcoded check)
	if body.Password != "freshbridge@2026" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "账号或密码错误"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"token":   "admin-" + admin.Username,
		"role":    admin.Role,
		"name":    admin.RealName,
	})
}

// ===== Dashboard =====
func (h *AdminV2Handler) DashboardV2(c *gin.Context) {
	stats, err := h.repo.DashboardV2()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ===== Users =====
func (h *AdminV2Handler) ListUsersV2(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListUsers(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": items, "total": total})
}

func (h *AdminV2Handler) UpdateUser(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var body struct {
		Verified int  `json:"verified"`
		Role     string `json:"role"`
	}
	c.ShouldBindJSON(&body)
	if body.Verified >= 0 {
		h.repo.UpdateUserStatus(id, body.Verified)
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ===== Square Posts =====
func (h *AdminV2Handler) ListSquarePosts(c *gin.Context) {
	status := c.DefaultQuery("status", "")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListSquarePosts(status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"posts": items, "total": total})
}

func (h *AdminV2Handler) ApprovePost(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.repo.ApprovePost(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *AdminV2Handler) RejectPost(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var body struct{ Reason string `json:"reason"` }
	c.ShouldBindJSON(&body)
	if body.Reason == "" { body.Reason = "内容不符合平台规范" }
	if err := h.repo.RejectPost(id, body.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *AdminV2Handler) TogglePinPost(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.repo.TogglePinPost(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *AdminV2Handler) DeleteSquarePost(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if err := h.repo.DeletePost(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ===== Market Prices =====
func (h *AdminV2Handler) ListMarketPrices(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListMarketPrices(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"prices": items, "total": total})
}

func (h *AdminV2Handler) CreateMarketPrice(c *gin.Context) {
	var p model.MarketPrice
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.CreateMarketPrice(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *AdminV2Handler) UpdateMarketPrice(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	var body struct {
		Price     float64 `json:"price"`
		ChangePct float64 `json:"change_pct"`
	}
	c.ShouldBindJSON(&body)
	if err := h.repo.UpdateMarketPrice(id, body.Price, body.ChangePct); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ===== Banners =====
func (h *AdminV2Handler) ListBanners(c *gin.Context) {
	items, _ := h.repo.ListBanners()
	c.JSON(http.StatusOK, gin.H{"banners": items})
}
func (h *AdminV2Handler) CreateBanner(c *gin.Context) {
	var b model.Banner
	c.ShouldBindJSON(&b)
	h.repo.CreateBanner(&b)
	c.JSON(http.StatusCreated, b)
}
func (h *AdminV2Handler) UpdateBanner(c *gin.Context) {
	var b model.Banner
	c.ShouldBindJSON(&b)
	h.repo.UpdateBanner(&b)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (h *AdminV2Handler) DeleteBanner(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	h.repo.DeleteBanner(id)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ===== Site Config =====
func (h *AdminV2Handler) ListSiteConfig(c *gin.Context) {
	items, _ := h.repo.GetAllConfig()
	c.JSON(http.StatusOK, gin.H{"configs": items})
}

func (h *AdminV2Handler) UpdateSiteConfig(c *gin.Context) {
	var body struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.UpdateConfig(body.Key, body.Value); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ===== Announcements =====
func (h *AdminV2Handler) ListAnnouncements(c *gin.Context) {
	items, _ := h.repo.ListAnnouncements()
	c.JSON(http.StatusOK, gin.H{"announcements": items})
}
func (h *AdminV2Handler) CreateAnnouncement(c *gin.Context) {
	var a model.Announcement
	c.ShouldBindJSON(&a)
	h.repo.CreateAnnouncement(&a)
	c.JSON(http.StatusCreated, a)
}
func (h *AdminV2Handler) UpdateAnnouncement(c *gin.Context) {
	var a model.Announcement
	c.ShouldBindJSON(&a)
	h.repo.UpdateAnnouncement(&a)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (h *AdminV2Handler) DeleteAnnouncement(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	h.repo.DeleteAnnouncement(id)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
