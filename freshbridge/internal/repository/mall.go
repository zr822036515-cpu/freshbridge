package repository

import (
	"fmt"
	"time"

	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type MallRepo struct{ db *gorm.DB }

func NewMallRepo(db *gorm.DB) *MallRepo { return &MallRepo{db} }

// Products

func (r *MallRepo) ListProducts(category string, page, pageSize int) ([]model.MallProduct, int64, error) {
	var items []model.MallProduct
	var total int64
	q := r.db.Model(&model.MallProduct{}).Where("status = 1")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	q.Count(&total)
	err := q.Order("sort_order ASC, id DESC").
		Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *MallRepo) GetProduct(id int64) (*model.MallProduct, error) {
	var p model.MallProduct
	err := r.db.First(&p, id).Error
	return &p, err
}

// Cart

func (r *MallRepo) ListCart(userID int64) ([]map[string]interface{}, error) {
	var rows []struct {
		ID        int64   `gorm:"column:id"`
		ProductID int64   `gorm:"column:product_id"`
		Quantity  int     `gorm:"column:quantity"`
		Name      string  `gorm:"column:name"`
		Price     float64 `gorm:"column:price"`
		ImageURL  string  `gorm:"column:image_url"`
		Stock     int     `gorm:"column:stock"`
	}
	err := r.db.Table("mall_cart_items c").
		Select("c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock").
		Joins("JOIN mall_products p ON p.id = c.product_id").
		Where("c.user_id = ?", userID).
		Order("c.created_at DESC").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]map[string]interface{}, len(rows))
	for i, row := range rows {
		result[i] = map[string]interface{}{
			"id":         row.ID,
			"product_id": row.ProductID,
			"quantity":   row.Quantity,
			"name":       row.Name,
			"price":      row.Price,
			"image_url":  row.ImageURL,
			"stock":      row.Stock,
		}
	}
	return result, nil
}

func (r *MallRepo) CartCount(userID int64) (int64, error) {
	var count int64
	err := r.db.Model(&model.MallCartItem{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

func (r *MallRepo) AddToCart(userID, productID int64, quantity int) error {
	existing := model.MallCartItem{}
	err := r.db.Where("user_id = ? AND product_id = ?", userID, productID).First(&existing).Error
	if err == nil {
		return r.db.Model(&existing).Update("quantity", existing.Quantity+quantity).Error
	}
	item := model.MallCartItem{UserID: userID, ProductID: productID, Quantity: quantity}
	return r.db.Create(&item).Error
}

func (r *MallRepo) UpdateCartItem(userID, itemID int64, quantity int) error {
	return r.db.Model(&model.MallCartItem{}).
		Where("id = ? AND user_id = ?", itemID, userID).
		Update("quantity", quantity).Error
}

func (r *MallRepo) RemoveCartItem(userID, itemID int64) error {
	return r.db.Where("id = ? AND user_id = ?", itemID, userID).Delete(&model.MallCartItem{}).Error
}

func (r *MallRepo) ClearCart(userID int64) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.MallCartItem{}).Error
}

// Orders

func (r *MallRepo) CreateOrder(order *model.MallOrder, items []model.MallOrderItem) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Generate order number
		order.OrderNo = fmt.Sprintf("FB%s%04d", time.Now().Format("20060102150405"), time.Now().UnixNano()%10000)
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		for i := range items {
			items[i].OrderID = order.ID
		}
		if err := tx.Create(&items).Error; err != nil {
			return err
		}
		// Update product sales
		for _, item := range items {
			tx.Model(&model.MallProduct{}).Where("id = ?", item.ProductID).
				Updates(map[string]interface{}{"sales": gorm.Expr("sales + ?", item.Quantity), "stock": gorm.Expr("stock - ?", item.Quantity)})
		}
		return nil
	})
}

func (r *MallRepo) ListOrders(userID int64) ([]model.MallOrder, error) {
	var orders []model.MallOrder
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (r *MallRepo) GetOrder(userID, orderID int64) (*model.MallOrder, []model.MallOrderItem, error) {
	var order model.MallOrder
	err := r.db.Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error
	if err != nil {
		return nil, nil, err
	}
	var items []model.MallOrderItem
	err = r.db.Where("order_id = ?", orderID).Find(&items).Error
	return &order, items, err
}

func (r *MallRepo) CancelOrder(userID, orderID int64) error {
	return r.db.Model(&model.MallOrder{}).
		Where("id = ? AND user_id = ? AND status = 'pending'", orderID, userID).
		Update("status", "cancelled").Error
}
