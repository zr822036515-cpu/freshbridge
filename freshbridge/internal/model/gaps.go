package model

import "time"

type Procurement struct {
	ID           int64     `gorm:"primaryKey" json:"id"`
	UserID       int64     `gorm:"column:user_id;index" json:"user_id"`
	Category     string    `json:"category"`
	Variety      string    `json:"variety"`
	Quantity     float64   `json:"quantity"`
	Price        float64   `json:"price"`
	Grade        string    `json:"grade"`
	DeliveryDate *string   `gorm:"column:delivery_date" json:"delivery_date,omitempty"`
	DeliveryAddr string    `gorm:"column:delivery_addr" json:"delivery_addr"`
	Note         string    `json:"note"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Procurement) TableName() string { return "procurements" }

type Notification struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	UserID    int64     `gorm:"column:user_id;index" json:"user_id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Link      string    `json:"link"`
	IsRead    int       `gorm:"column:is_read" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

func (Notification) TableName() string { return "notifications" }

type LogisticsTimeline struct {
	ID          int64     `gorm:"primaryKey" json:"id"`
	LogisticsID int64     `gorm:"column:logistics_id;index" json:"logistics_id"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
	Lat         float64   `json:"lat"`
	Lng         float64   `json:"lng"`
	CreatedAt   time.Time `json:"created_at"`
}

func (LogisticsTimeline) TableName() string { return "logistics_timeline" }

type SupplyDemand struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Type      string    `json:"type"`
	Variety   string    `json:"variety"`
	Quantity  string    `json:"quantity"`
	Price     string    `json:"price"`
	Origin    string    `json:"origin"`
	Contact   string    `json:"contact"`
	Status    int       `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func (SupplyDemand) TableName() string { return "supply_demand" }

type AdminAuditLog struct {
	ID         int64     `gorm:"primaryKey" json:"id"`
	AdminToken string    `gorm:"column:admin_token;size:64" json:"-"`
	Method     string    `gorm:"size:10" json:"method"`
	Path       string    `gorm:"size:255" json:"path"`
	Action     string    `gorm:"size:100" json:"action"`
	IP         string    `gorm:"size:45" json:"ip"`
	StatusCode int       `gorm:"column:status_code" json:"status_code"`
	CreatedAt  time.Time `json:"created_at"`
}

func (AdminAuditLog) TableName() string { return "admin_audit_logs" }
