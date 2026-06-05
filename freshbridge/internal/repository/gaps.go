package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type GapsRepo struct{ db *gorm.DB }

func NewGapsRepo(db *gorm.DB) *GapsRepo { return &GapsRepo{db} }

// --- Procurement ---

func (r *GapsRepo) CreateProcurement(p *model.Procurement) error { return r.db.Create(p).Error }

func (r *GapsRepo) ListProcurements(category string, page, pageSize int) ([]model.Procurement, int64, error) {
	var items []model.Procurement
	var total int64
	q := r.db.Model(&model.Procurement{}).Where("status = 'open'")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	q.Count(&total)
	err := q.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *GapsRepo) ListMyProcurements(userID int64) ([]model.Procurement, error) {
	var items []model.Procurement
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *GapsRepo) GetProcurement(id int64) (*model.Procurement, error) {
	var p model.Procurement
	err := r.db.First(&p, id).Error
	return &p, err
}

func (r *GapsRepo) ListAllProcurements(page, pageSize int) ([]model.Procurement, int64, error) {
	var items []model.Procurement
	var total int64
	r.db.Model(&model.Procurement{}).Count(&total)
	err := r.db.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

// --- Notification ---

func (r *GapsRepo) CreateNotification(n *model.Notification) error { return r.db.Create(n).Error }

func (r *GapsRepo) ListNotifications(userID int64) ([]model.Notification, error) {
	var items []model.Notification
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(50).Find(&items).Error
	return items, err
}

func (r *GapsRepo) MarkNotificationRead(userID, id int64) error {
	return r.db.Model(&model.Notification{}).Where("id = ? AND user_id = ?", id, userID).Update("is_read", 1).Error
}

func (r *GapsRepo) UnreadNotificationCount(userID int64) (int64, error) {
	var count int64
	err := r.db.Model(&model.Notification{}).Where("user_id = ? AND is_read = 0", userID).Count(&count).Error
	return count, err
}

// --- Logistics Timeline ---

func (r *GapsRepo) CreateTimelineEntry(t *model.LogisticsTimeline) error { return r.db.Create(t).Error }

func (r *GapsRepo) GetTimeline(logisticsID int64) ([]model.LogisticsTimeline, error) {
	var items []model.LogisticsTimeline
	err := r.db.Where("logistics_id = ?", logisticsID).Order("created_at ASC").Find(&items).Error
	return items, err
}

// --- Supply/Demand ---

func (r *GapsRepo) ListSupplyDemand(stype string) ([]model.SupplyDemand, error) {
	var items []model.SupplyDemand
	q := r.db.Where("status = 1")
	if stype != "" {
		q = q.Where("type = ?", stype)
	}
	err := q.Order("created_at DESC").Limit(20).Find(&items).Error
	return items, err
}

func (r *GapsRepo) CreateSupplyDemand(sd *model.SupplyDemand) error { return r.db.Create(sd).Error }

// --- Admin Audit Log ---

func (r *GapsRepo) CreateAuditLog(entry *model.AdminAuditLog) error {
	return r.db.Create(entry).Error
}

func (r *GapsRepo) ListAuditLogs(page, pageSize int) ([]model.AdminAuditLog, int64, error) {
	var items []model.AdminAuditLog
	var total int64
	r.db.Model(&model.AdminAuditLog{}).Count(&total)
	err := r.db.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}
