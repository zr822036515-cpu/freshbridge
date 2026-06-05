package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type AdminRepo struct{ db *gorm.DB }

func NewAdminRepo(db *gorm.DB) *AdminRepo { return &AdminRepo{db} }

// Dashboard stats
func (r *AdminRepo) Dashboard() (map[string]interface{}, error) {
	var userCount, productCount, orderCount, marketCount int64
	r.db.Model(&model.User{}).Count(&userCount)
	r.db.Model(&model.Product{}).Count(&productCount)
	r.db.Model(&model.MallOrder{}).Count(&orderCount)
	r.db.Model(&model.MarketPrice{}).Count(&marketCount)

	var orderRevenue float64
	r.db.Model(&model.MallOrder{}).Where("status != 'cancelled'").Select("COALESCE(SUM(total_amount),0)").Scan(&orderRevenue)

	return map[string]interface{}{
		"user_count":    userCount,
		"product_count": productCount,
		"order_count":   orderCount,
		"market_count":  marketCount,
		"order_revenue": orderRevenue,
	}, nil
}

// Users
func (r *AdminRepo) ListUsers(page, pageSize int) ([]model.User, int64, error) {
	var items []model.User
	var total int64
	r.db.Model(&model.User{}).Count(&total)
	err := r.db.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *AdminRepo) UpdateUserStatus(userID int64, verified int) error {
	return r.db.Model(&model.User{}).Where("id = ?", userID).Update("verified", verified).Error
}

// Mall orders
func (r *AdminRepo) ListOrders(page, pageSize int, status string) ([]model.MallOrder, int64, error) {
	var items []model.MallOrder
	var total int64
	q := r.db.Model(&model.MallOrder{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	q.Count(&total)
	err := q.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *AdminRepo) UpdateOrderStatus(orderID int64, status string) error {
	updates := map[string]interface{}{"status": status}
	return r.db.Model(&model.MallOrder{}).Where("id = ?", orderID).Updates(updates).Error
}

// Mall products (include offline)
func (r *AdminRepo) ListAllProducts(page, pageSize int) ([]model.MallProduct, int64, error) {
	var items []model.MallProduct
	var total int64
	r.db.Model(&model.MallProduct{}).Count(&total)
	err := r.db.Order("sort_order ASC, id DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *AdminRepo) CreateProduct(p *model.MallProduct) error {
	return r.db.Create(p).Error
}

func (r *AdminRepo) UpdateProduct(p *model.MallProduct) error {
	return r.db.Save(p).Error
}

func (r *AdminRepo) UpdateProductStatus(productID int64, status int) error {
	return r.db.Model(&model.MallProduct{}).Where("id = ?", productID).Update("status", status).Error
}
