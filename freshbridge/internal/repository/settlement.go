package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

// --- Settlement ---

type SettlementRepo struct{ db *gorm.DB }

func NewSettlementRepo(db *gorm.DB) *SettlementRepo { return &SettlementRepo{db} }

func (r *SettlementRepo) Create(s *model.Settlement) error { return r.db.Create(s).Error }

func (r *SettlementRepo) FindByTrade(tradeID int64) (*model.Settlement, error) {
	var s model.Settlement
	err := r.db.Where("trade_id = ?", tradeID).First(&s).Error
	return &s, err
}

func (r *SettlementRepo) FindByFarmer(farmerID int64) ([]model.Settlement, error) {
	var items []model.Settlement
	err := r.db.Where("farmer_id = ?", farmerID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *SettlementRepo) Update(s *model.Settlement) error { return r.db.Save(s).Error }

// --- Logistics ---

type LogisticsRepo struct{ db *gorm.DB }

func NewLogisticsRepo(db *gorm.DB) *LogisticsRepo { return &LogisticsRepo{db} }

func (r *LogisticsRepo) Create(l *model.Logistics) error { return r.db.Create(l).Error }

func (r *LogisticsRepo) FindByID(id int64) (*model.Logistics, error) {
	var l model.Logistics
	err := r.db.First(&l, id).Error
	return &l, err
}

func (r *LogisticsRepo) FindByDriver(driverID int64) ([]model.Logistics, error) {
	var items []model.Logistics
	err := r.db.Where("driver_id = ?", driverID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *LogisticsRepo) FindPending() ([]model.Logistics, error) {
	var items []model.Logistics
	err := r.db.Where("status = ?", "pending").Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *LogisticsRepo) Update(l *model.Logistics) error { return r.db.Save(l).Error }

// --- MarketPrice ---

type MarketPriceRepo struct{ db *gorm.DB }

func NewMarketPriceRepo(db *gorm.DB) *MarketPriceRepo { return &MarketPriceRepo{db} }

func (r *MarketPriceRepo) GetLatest(category string, limit int) ([]model.MarketPrice, error) {
	var items []model.MarketPrice
	q := r.db.Order("record_date DESC, id DESC")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	err := q.Limit(limit).Find(&items).Error
	return items, err
}

func (r *MarketPriceRepo) GetByDate(date string) ([]model.MarketPrice, error) {
	var items []model.MarketPrice
	err := r.db.Where("record_date = ?", date).Order("category, variety").Find(&items).Error
	return items, err
}
