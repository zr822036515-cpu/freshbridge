package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// UploadDir is the base directory for uploaded images on the server
const UploadDir = "/opt/freshbridge/uploads"

func init() { os.MkdirAll(UploadDir+"/banners", 0755); os.MkdirAll(UploadDir+"/categories", 0755); os.MkdirAll(UploadDir+"/mall", 0755) }

func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择文件"})
		return
	}
	defer file.Close()

	// Validate type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "仅支持 JPG/PNG/WebP 格式"})
		return
	}

	// Validate size (max 5MB)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件最大 5MB"})
		return
	}

	// Determine subdirectory
	sub := c.DefaultPostForm("category", "banners")
	if sub != "banners" && sub != "categories" && sub != "mall" {
		sub = "banners"
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), strings.TrimSuffix(header.Filename, ext), ext)
	filepath := filepath.Join(UploadDir, sub, filename)

	// Save file
	dst, err := os.Create(filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "文件保存失败"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "文件写入失败"})
		return
	}

	// Return URL
	url := fmt.Sprintf("/uploads/%s/%s", sub, filename)
	c.JSON(http.StatusOK, gin.H{"url": url, "filename": filename})
}
