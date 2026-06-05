package service

import (
	"log"
	"math/rand"
	"time"

	"freshbridge/internal/model"

	"gorm.io/gorm"
)

// MarketUpdater periodically refreshes market price data.
type MarketUpdater struct {
	db       *gorm.DB
	interval time.Duration
	stopCh   chan struct{}
}

func NewMarketUpdater(db *gorm.DB, interval time.Duration) *MarketUpdater {
	return &MarketUpdater{db: db, interval: interval, stopCh: make(chan struct{})}
}

func (u *MarketUpdater) Start() {
	log.Printf("[market-updater] started, interval=%v", u.interval)
	go u.run()
}

func (u *MarketUpdater) Stop() { close(u.stopCh) }

func (u *MarketUpdater) run() {
	// Run once immediately on startup
	u.Update()
	ticker := time.NewTicker(u.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			u.Update()
		case <-u.stopCh:
			return
		}
	}
}

// Update generates new price data based on the latest records.
func (u *MarketUpdater) Update() {
	var latestDate string
	u.db.Model(&model.MarketPrice{}).Select("record_date").Order("record_date DESC").Limit(1).Scan(&latestDate)

	if latestDate == "" {
		log.Println("[market-updater] no existing data, skipping")
		return
	}

	today := time.Now().Format("2006-01-02")
	if latestDate >= today {
		log.Printf("[market-updater] data already up to date (%s)", latestDate)
		return
	}

	// Get latest date's prices
	var items []model.MarketPrice
	u.db.Where("record_date = ?", latestDate).Find(&items)
	if len(items) == 0 {
		log.Println("[market-updater] no prices found for latest date")
		return
	}

	// Generate today's prices with small variations
	newItems := make([]model.MarketPrice, 0, len(items))
	for _, it := range items {
		change := (rand.Float64()*5 - 2.5) // -2.5% ~ +2.5%
		newPrice := it.Price * (1 + change/100)
		newItems = append(newItems, model.MarketPrice{
			Category:   it.Category,
			Variety:    it.Variety,
			MarketName: it.MarketName,
			Price:      round2(newPrice),
			ChangePct:  round2(change),
			Volume:     it.Volume + rand.Float64()*5,
			RecordDate: today,
		})
	}

	if err := u.db.Create(&newItems).Error; err != nil {
		log.Printf("[market-updater] failed to create: %v", err)
		return
	}
	log.Printf("[market-updater] updated %d prices → %s", len(newItems), today)
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
