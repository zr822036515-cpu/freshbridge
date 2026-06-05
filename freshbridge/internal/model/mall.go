package model

import "time"

type MallProduct struct {
	ID            int64    `gorm:"primaryKey" json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Price         float64  `json:"price"`
	OriginalPrice float64  `gorm:"column:original_price" json:"original_price"`
	ImageURL      string   `gorm:"column:image_url" json:"image_url"`
	Images        []string `gorm:"serializer:json" json:"images"`
	Category      string   `json:"category"`
	Stock         int      `json:"stock"`
	Sales         int      `json:"sales"`
	Status        int      `json:"status"`
	SortOrder     int      `gorm:"column:sort_order" json:"sort_order"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (MallProduct) TableName() string { return "mall_products" }

type MallCartItem struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	UserID    int64     `gorm:"column:user_id;uniqueIndex:uk_user_product" json:"user_id"`
	ProductID int64     `gorm:"column:product_id;uniqueIndex:uk_user_product" json:"product_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
}

func (MallCartItem) TableName() string { return "mall_cart_items" }

type MallOrder struct {
	ID              int64     `gorm:"primaryKey" json:"id"`
	OrderNo         string    `gorm:"column:order_no;index" json:"order_no"`
	UserID          int64     `gorm:"column:user_id;index" json:"user_id"`
	TotalAmount     float64   `gorm:"column:total_amount" json:"total_amount"`
	Status          string    `json:"status"`
	ReceiverName    string    `gorm:"column:receiver_name" json:"receiver_name"`
	ReceiverPhone   string    `gorm:"column:receiver_phone" json:"receiver_phone"`
	ReceiverAddress string    `gorm:"column:receiver_address" json:"receiver_address"`
	Note            string    `json:"note"`
	PaidAt          *time.Time `gorm:"column:paid_at" json:"paid_at,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (MallOrder) TableName() string { return "mall_orders" }

type MallOrderItem struct {
	ID          int64     `gorm:"primaryKey" json:"id"`
	OrderID     int64     `gorm:"column:order_id;index" json:"order_id"`
	ProductID   int64     `gorm:"column:product_id" json:"product_id"`
	ProductName string    `gorm:"column:product_name" json:"product_name"`
	Price       float64   `json:"price"`
	Quantity    int       `json:"quantity"`
	CreatedAt   time.Time `json:"created_at"`
}

func (MallOrderItem) TableName() string { return "mall_order_items" }
