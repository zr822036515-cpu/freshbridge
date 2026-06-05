package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"freshbridge/internal/model"
	"freshbridge/internal/service"
)

type ProductHandler struct{ svc *service.ProductService }

func NewProductHandler(svc *service.ProductService) *ProductHandler { return &ProductHandler{svc} }

func (h *ProductHandler) Create(c *gin.Context) {
	var p model.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.FarmerID = c.GetInt64("user_id")
	if err := h.svc.Create(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	p, err := h.svc.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProductHandler) ListMy(c *gin.Context) {
	products, _ := h.svc.ListByFarmer(c.GetInt64("user_id"))
	c.JSON(http.StatusOK, gin.H{"products": products})
}

func (h *ProductHandler) Search(c *gin.Context) {
	category := c.Query("category")
	keyword := c.Query("keyword")
	if keyword == "" {
		keyword = c.Query("q")
	}
	variety := c.Query("variety")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	products, total, _ := h.svc.Search(category, keyword, variety, page, pageSize)
	c.JSON(http.StatusOK, gin.H{"products": products, "total": total})
}
