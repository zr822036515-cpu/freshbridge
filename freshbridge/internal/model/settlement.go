package model

import "time"

type Settlement struct {
	ID              int64     `gorm:"primaryKey" json:"id"`
	TradeID         int64     `gorm:"column:trade_id;index" json:"trade_id"`
	FarmerID        int64     `gorm:"column:farmer_id;index" json:"farmer_id"`
	StallID         int64     `gorm:"column:stall_id" json:"stall_id"`
	TotalSales      float64   `gorm:"column:total_sales" json:"total_sales"`
	PlatformFee     float64   `gorm:"column:platform_fee" json:"platform_fee"`
	LogisticsFee    float64   `gorm:"column:logistics_fee" json:"logistics_fee"`
	WasteDeduction  float64   `gorm:"column:waste_deduction" json:"waste_deduction"`
	FarmerAmount    float64   `gorm:"column:farmer_amount" json:"farmer_amount"`
	StallCommission float64   `gorm:"column:stall_commission" json:"stall_commission"`
	Status          string    `json:"status"`
	SettledAt       *time.Time `gorm:"column:settled_at" json:"settled_at"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (Settlement) TableName() string { return "settlements" }

type Logistics struct {
	ID          int64      `gorm:"primaryKey" json:"id"`
	TradeID     *int64     `gorm:"column:trade_id" json:"trade_id"`
	FarmerID    int64      `gorm:"column:farmer_id" json:"farmer_id"`
	DriverID    *int64     `gorm:"column:driver_id;index" json:"driver_id"`
	OriginAddr  string     `gorm:"column:origin_addr" json:"origin_addr"`
	DestAddr    string     `gorm:"column:dest_addr" json:"dest_addr"`
	CargoDesc   string     `gorm:"column:cargo_desc" json:"cargo_desc"`
	CargoWeight float64    `gorm:"column:cargo_weight" json:"cargo_weight"`
	VehicleType string     `gorm:"column:vehicle_type" json:"vehicle_type"`
	DistanceKm  int        `gorm:"column:distance_km" json:"distance_km"`
	Price       float64    `json:"price"`
	Status      string     `json:"status"`
	LoadTime    *time.Time `gorm:"column:load_time" json:"load_time"`
	ETA         *time.Time `json:"eta"`
	GPSLat      float64    `gorm:"column:gps_lat" json:"gps_lat"`
	GPSLng      float64    `gorm:"column:gps_lng" json:"gps_lng"`
	SignedAt    *time.Time `gorm:"column:signed_at" json:"signed_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (Logistics) TableName() string { return "logistics" }

type MarketPrice struct {
	ID         int64     `gorm:"primaryKey" json:"id"`
	Category   string    `json:"category"`
	Variety    string    `json:"variety"`
	MarketName string    `gorm:"column:market_name" json:"market_name"`
	Price      float64   `json:"price"`
	ChangePct  float64   `gorm:"column:change_pct" json:"change_pct"`
	Volume     float64   `json:"volume"`
	RecordDate string    `gorm:"column:record_date" json:"record_date"`
	CreatedAt  time.Time `json:"created_at"`
}

func (MarketPrice) TableName() string { return "market_prices" }
