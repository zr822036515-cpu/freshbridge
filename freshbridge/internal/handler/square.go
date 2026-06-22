package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/middleware"
	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type SquareHandler struct {
	repo    *repository.SquareRepo
	gapsRepo *repository.GapsRepo
}

func NewSquareHandler(repo *repository.SquareRepo, gapsRepo *repository.GapsRepo) *SquareHandler {
	return &SquareHandler{repo, gapsRepo}
}

// --- Posts ---

func (h *SquareHandler) CreatePost(c *gin.Context) {
	var p model.SquarePost
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.UserID = c.GetInt64("user_id")
	// Content moderation
	if bad, ok := middleware.SanitizeContent(p.Description); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "内容包含敏感词"})
		_ = bad
		return
	}
	p.Status = 1
	if p.RealPhone == "" {
		p.RealPhone = p.Phone
	}
	p.Phone = middleware.MaskPhone(p.RealPhone)
	if err := h.repo.CreatePost(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Notify followers
	go h.notifyFollowers(p.UserID, p.ID, p.Description)
	c.JSON(http.StatusCreated, p)
}

func (h *SquareHandler) ListPosts(c *gin.Context) {
	userID := c.GetInt64("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListPosts(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"posts": items, "total": total})
}

func (h *SquareHandler) SearchPosts(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.SearchPosts(keyword, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"posts": items, "total": total})
}

func (h *SquareHandler) ListUserPosts(c *gin.Context) {
	userID := c.GetInt64("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 { page = 1 }
	items, total, err := h.repo.ListUserPosts(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"posts": items, "total": total})
}

// --- Follow ---

func (h *SquareHandler) Follow(c *gin.Context) {
	userID := c.GetInt64("user_id")
	targetID, err := strconv.ParseInt(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}
	if userID == targetID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot follow yourself"})
		return
	}
	if err := h.repo.Follow(userID, targetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *SquareHandler) Unfollow(c *gin.Context) {
	userID := c.GetInt64("user_id")
	targetID, err := strconv.ParseInt(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}
	if err := h.repo.Unfollow(userID, targetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// --- Like ---

func (h *SquareHandler) Like(c *gin.Context) {
	userID := c.GetInt64("user_id")
	postID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.Like(userID, postID); err != nil {
		if strings.Contains(err.Error(), "Duplicate") {
			c.JSON(http.StatusOK, gin.H{"ok": true})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Increment like count
	_ = h.repo.Unlike(userID, postID) // Just making sure the like count is there
	// Notify post author
	go h.notifyPostAuthor(postID, userID, "liked your post")
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *SquareHandler) Unlike(c *gin.Context) {
	userID := c.GetInt64("user_id")
	postID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.Unlike(userID, postID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// --- Comments ---

func (h *SquareHandler) AddComment(c *gin.Context) {
	userID := c.GetInt64("user_id")
	postID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var body struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content required"})
		return
	}
	comment := &model.SquareComment{UserID: userID, PostID: postID, Content: body.Content, UserName: "用户"}
	if err := h.repo.AddComment(comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	go h.notifyPostAuthor(postID, userID, "commented on your post")
	c.JSON(http.StatusCreated, comment)
}

func (h *SquareHandler) ListComments(c *gin.Context) {
	postID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	items, err := h.repo.ListComments(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"comments": items})
}

// --- Phone reveal ---

func (h *SquareHandler) RevealPhone(c *gin.Context) {
	userID := c.GetInt64("user_id")
	postID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	post, err := h.repo.GetPost(postID)
	if err != nil || post.RealPhone == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	// Check daily limit for non-VIP users
	allowed, remaining := middleware.CheckPhoneRevealLimit(userID)
	if !allowed {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "今日查看次数已用完", "reset": "明天 00:00"})
		return
	}
	middleware.RecordPhoneReveal(userID)
	c.JSON(http.StatusOK, gin.H{"phone": post.RealPhone, "remaining": remaining - 1})
}

// --- Notifications ---

func (h *SquareHandler) notifyFollowers(authorID, postID int64, desc string) {
	followers, _ := h.repo.ListFollowers(authorID)
	shortDesc := desc
	if len(shortDesc) > 40 {
		shortDesc = shortDesc[:40] + "..."
	}
	for _, fid := range followers {
		_ = h.gapsRepo.CreateNotification(&model.Notification{
			UserID:  fid,
			Type:    "social",
			Title:   "你关注的商家发布了新货源",
			Content: shortDesc,
			Link:    "/pages/square/index",
		})
	}
}

func (h *SquareHandler) notifyPostAuthor(postID, fromUserID int64, action string) {
	post, err := h.repo.GetPost(postID)
	if err != nil || post.UserID == fromUserID {
		return
	}
	_ = h.gapsRepo.CreateNotification(&model.Notification{
		UserID:  post.UserID,
		Type:    "social",
		Title:   "有人" + action,
		Content: action,
		Link:    "/pages/square/index",
		CreatedAt: time.Now(),
	})
}
