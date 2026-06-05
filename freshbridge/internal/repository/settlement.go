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

func (r *MarketPriceRepo) GetSummary() (map[string]interface{}, error) {
	var latestDate string
	r.db.Model(&model.MarketPrice{}).Select("record_date").Order("record_date DESC").Limit(1).Scan(&latestDate)
	if latestDate == "" {
		return map[string]interface{}{"total_varieties": 0, "up_count": 0, "down_count": 0}, nil
	}
	var items []model.MarketPrice
	r.db.Where("record_date = ?", latestDate).Find(&items)
	total := len(items)
	up, down := 0, 0
	for _, it := range items {
		if it.ChangePct > 0 {
			up++
		} else if it.ChangePct < 0 {
			down++
		}
	}
	return map[string]interface{}{
		"total_varieties": total,
		"up_count":        up,
		"down_count":      down,
		"record_date":     latestDate,
	}, nil
}

func (r *MarketPriceRepo) GetTrend(variety string) ([]map[string]interface{}, error) {
	var items []model.MarketPrice
	err := r.db.Where("variety = ?", variety).
		Order("record_date ASC").
		Limit(50).
		Find(&items).Error
	if err != nil {
		return nil, err
	}
	// Group by date, list prices per market
	type point struct {
		Date string  `json:"date"`
		Price float64 `json:"price"`
		Market string `json:"market"`
	}
	points := make([]point, 0, len(items))
	for _, it := range items {
		points = append(points, point{Date: it.RecordDate, Price: it.Price, Market: it.MarketName})
	}
	result := make([]map[string]interface{}, len(points))
	for i, p := range points {
		result[i] = map[string]interface{}{
			"date":   p.Date,
			"price":  p.Price,
			"market": p.Market,
		}
	}
	return result, nil
}
