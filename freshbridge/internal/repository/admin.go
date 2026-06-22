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

// --- Admin Auth ---
func (r *AdminRepo) FindAdmin(username string) (*model.Admin, error) {
	var a model.Admin
	err := r.db.Where("username = ? AND status = 1", username).First(&a).Error
	return &a, err
}

// --- Dashboard v2 ---
func (r *AdminRepo) DashboardV2() (map[string]interface{}, error) {
	var users, posts, pendingPosts, pendingAuths, todayPosts int64
	r.db.Model(&model.User{}).Count(&users)
	r.db.Model(&model.SquarePost{}).Count(&posts)
	r.db.Model(&model.SquarePost{}).Where("status = 0").Count(&pendingPosts)
	r.db.Model(&model.User{}).Where("verified = 0").Count(&pendingAuths)
	r.db.Model(&model.SquarePost{}).Where("DATE(created_at) = CURDATE()").Count(&todayPosts)
	var marketCount, supplyCount, demandCount int64
	r.db.Model(&model.MarketPrice{}).Count(&marketCount)
	r.db.Model(&model.SupplyDemand{}).Where("type = 'supply'").Count(&supplyCount)
	r.db.Model(&model.SupplyDemand{}).Where("type = 'demand'").Count(&demandCount)
	return map[string]interface{}{
		"user_count": users, "post_count": posts,
		"pending_posts": pendingPosts, "pending_auths": pendingAuths,
		"today_posts": todayPosts, "market_count": marketCount,
		"supply_count": supplyCount, "demand_count": demandCount,
	}, nil
}

// --- Posts ---
func (r *AdminRepo) ListSquarePosts(status string, page, pageSize int) ([]model.SquarePost, int64, error) {
	var items []model.SquarePost
	var total int64
	q := r.db.Model(&model.SquarePost{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	q.Count(&total)
	err := q.Order("is_pinned DESC, created_at DESC").Offset((page-1)*pageSize).Limit(pageSize).Find(&items).Error
	// Fill user names
	for i := range items {
		var u model.User
		if r.db.Select("id").Where("id = ?", items[i].UserID).First(&u).Error == nil {
			items[i].UserName = u.Nickname
		}
	}
	return items, total, err
}

func (r *AdminRepo) ApprovePost(id int64) error {
	return r.db.Model(&model.SquarePost{}).Where("id = ?", id).Updates(map[string]interface{}{"status": 1, "review_msg": ""}).Error
}

func (r *AdminRepo) RejectPost(id int64, reason string) error {
	return r.db.Model(&model.SquarePost{}).Where("id = ?", id).Updates(map[string]interface{}{"status": 2, "review_msg": reason}).Error
}

func (r *AdminRepo) TogglePinPost(id int64) error {
	return r.db.Exec("UPDATE square_posts SET is_pinned = NOT is_pinned WHERE id = ?", id).Error
}

func (r *AdminRepo) DeletePost(id int64) error {
	return r.db.Delete(&model.SquarePost{}, id).Error
}

func (r *AdminRepo) UpdateUserVIP(userID int64, isVip bool) error {
	return r.db.Model(&model.User{}).Where("id = ?", userID).Update("verified", isVip).Error
}

// --- Market Prices ---
func (r *AdminRepo) ListMarketPrices(page, pageSize int) ([]model.MarketPrice, int64, error) {
	var items []model.MarketPrice
	var total int64
	r.db.Model(&model.MarketPrice{}).Count(&total)
	err := r.db.Order("record_date DESC, id DESC").Offset((page-1)*pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *AdminRepo) CreateMarketPrice(p *model.MarketPrice) error {
	return r.db.Create(p).Error
}

func (r *AdminRepo) UpdateMarketPrice(id int64, price float64, changePct float64) error {
	return r.db.Model(&model.MarketPrice{}).Where("id = ?", id).Updates(map[string]interface{}{
		"price": price, "change_pct": changePct,
	}).Error
}

// --- Banners ---
func (r *AdminRepo) ListBanners() ([]model.Banner, error) {
	var items []model.Banner
	err := r.db.Order("sort_order ASC").Find(&items).Error
	return items, err
}

func (r *AdminRepo) CreateBanner(b *model.Banner) error { return r.db.Create(b).Error }
func (r *AdminRepo) UpdateBanner(b *model.Banner) error { return r.db.Save(b).Error }
func (r *AdminRepo) DeleteBanner(id int64) error { return r.db.Delete(&model.Banner{}, id).Error }

// --- Announcements ---
func (r *AdminRepo) ListAnnouncements() ([]model.Announcement, error) {
	var items []model.Announcement
	err := r.db.Order("is_pinned DESC, created_at DESC").Find(&items).Error
	return items, err
}

func (r *AdminRepo) CreateAnnouncement(a *model.Announcement) error { return r.db.Create(a).Error }
func (r *AdminRepo) UpdateAnnouncement(a *model.Announcement) error { return r.db.Save(a).Error }
func (r *AdminRepo) DeleteAnnouncement(id int64) error { return r.db.Delete(&model.Announcement{}, id).Error }

// --- Site Config ---
func (r *AdminRepo) GetAllConfig() ([]model.SiteConfig, error) {
	var items []model.SiteConfig
	err := r.db.Order("id ASC").Find(&items).Error
	return items, err
}

func (r *AdminRepo) UpdateConfig(key, value string) error {
	return r.db.Model(&model.SiteConfig{}).Where("config_key = ?", key).Update("config_value", value).Error
}

func (r *AdminRepo) GetConfigMap() (map[string]string, error) {
	items, err := r.GetAllConfig()
	if err != nil {
		return nil, err
	}
	m := make(map[string]string)
	for _, it := range items {
		m[it.ConfigKey] = it.ConfigValue
	}
	return m, nil
}
