package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type TradeRepo struct{ db *gorm.DB }

func NewTradeRepo(db *gorm.DB) *TradeRepo { return &TradeRepo{db} }

func (r *TradeRepo) Create(t *model.TradeOrder) error { return r.db.Create(t).Error }

func (r *TradeRepo) FindByID(id int64) (*model.TradeOrder, error) {
	var t model.TradeOrder
	err := r.db.First(&t, id).Error
	return &t, err
}

func (r *TradeRepo) FindByFarmer(farmerID int64) ([]model.TradeOrder, error) {
	var trades []model.TradeOrder
	err := r.db.Where("farmer_id = ?", farmerID).Order("created_at DESC").Find(&trades).Error
	return trades, err
}

func (r *TradeRepo) FindByStall(stallID int64) ([]model.TradeOrder, error) {
	var trades []model.TradeOrder
	err := r.db.Where("stall_id = ?", stallID).Order("created_at DESC").Find(&trades).Error
	return trades, err
}

func (r *TradeRepo) Update(t *model.TradeOrder) error { return r.db.Save(t).Error }

func (r *TradeRepo) CreateSale(sr *model.SalesRecord) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(sr).Error; err != nil {
			return err
		}
		return tx.Model(&model.Product{}).Where("id = ?", sr.ProductID).
			UpdateColumn("sold_quantity", gorm.Expr("sold_quantity + ?", sr.Quantity)).Error
	})
}

func (r *TradeRepo) GetSalesByTrade(tradeID int64) ([]model.SalesRecord, error) {
	var records []model.SalesRecord
	err := r.db.Where("trade_id = ?", tradeID).Order("sale_time DESC").Find(&records).Error
	return records, err
}
