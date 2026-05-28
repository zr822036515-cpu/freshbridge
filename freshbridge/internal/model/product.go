package model

import "time"

type Product struct {
	ID             int64     `gorm:"primaryKey" json:"id"`
	FarmerID       int64     `gorm:"column:farmer_id;index" json:"farmer_id"`
	Category       string    `json:"category"`
	Variety        string    `json:"variety"`
	Spec           string    `json:"spec"`
	Grade          string    `json:"grade"`
	TotalQuantity  float64   `gorm:"column:total_quantity" json:"total_quantity"`
	SoldQuantity   float64   `gorm:"column:sold_quantity" json:"sold_quantity"`
	WasteQuantity  float64   `gorm:"column:waste_quantity" json:"waste_quantity"`
	Price          float64   `json:"price"`
	PricingMode    string    `gorm:"column:pricing_mode" json:"pricing_mode"`
	CommissionRate int       `gorm:"column:commission_rate" json:"commission_rate"`
	Packaging      string    `json:"packaging"`
	MinOrder       float64   `gorm:"column:min_order" json:"min_order"`
	AvailableDate  string    `gorm:"column:available_date" json:"available_date"`
	OriginProvince string    `gorm:"column:origin_province" json:"origin_province"`
	OriginCity     string    `gorm:"column:origin_city" json:"origin_city"`
	OriginDistrict string    `gorm:"column:origin_district" json:"origin_district"`
	Images         string    `json:"images"`
	Urgent         int       `json:"urgent"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Product) TableName() string { return "products" }
