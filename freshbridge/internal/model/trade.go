package model

import "time"

type TradeOrder struct {
	ID             int64     `gorm:"primaryKey" json:"id"`
	ProductID      int64     `gorm:"column:product_id;index" json:"product_id"`
	FarmerID       int64     `gorm:"column:farmer_id;index" json:"farmer_id"`
	StallID        int64     `gorm:"column:stall_id;index" json:"stall_id"`
	CommissionRate int       `gorm:"column:commission_rate" json:"commission_rate"`
	PricingMode    string    `gorm:"column:pricing_mode" json:"pricing_mode"`
	FloorPrice     float64   `gorm:"column:floor_price" json:"floor_price"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (TradeOrder) TableName() string { return "trade_orders" }

type SalesRecord struct {
	ID           int64     `gorm:"primaryKey" json:"id"`
	TradeID      int64     `gorm:"column:trade_id;index" json:"trade_id"`
	ProductID    int64     `gorm:"column:product_id" json:"product_id"`
	StallID      int64     `gorm:"column:stall_id" json:"stall_id"`
	Quantity     float64   `json:"quantity"`
	Price        float64   `json:"price"`
	TotalAmount  float64   `gorm:"column:total_amount" json:"total_amount"`
	RecordMethod string    `gorm:"column:record_method" json:"record_method"`
	VoiceText    string    `gorm:"column:voice_text" json:"voice_text"`
	SaleTime     time.Time `gorm:"column:sale_time" json:"sale_time"`
	CreatedAt    time.Time `json:"created_at"`
}

func (SalesRecord) TableName() string { return "sales_records" }
