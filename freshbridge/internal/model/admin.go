package model

import "time"

// Admin represents a backend admin user
type Admin struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	RealName     string    `json:"real_name"`
	Role         string    `json:"role"`
	Status       int8      `json:"status"`
	LastLogin    *time.Time `json:"last_login"`
	CreatedAt    time.Time `json:"created_at"`
}

func (Admin) TableName() string { return "admins" }

// Banner for home page carousel
type Banner struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	ImageURL  string    `json:"image_url"`
	LinkURL   string    `json:"link_url"`
	SortOrder int       `json:"sort_order"`
	Status    int8      `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func (Banner) TableName() string { return "banners" }

// Announcement for platform news
type Announcement struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Type      string    `json:"type"`
	IsPinned  int8      `json:"is_pinned"`
	Status    int8      `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Announcement) TableName() string { return "announcements" }

type SiteConfig struct {
	ID          int64  `json:"id"`
	ConfigKey   string `json:"config_key"`
	ConfigValue string `json:"config_value"`
	Description string `json:"description"`
}

func (SiteConfig) TableName() string { return "site_config" }
