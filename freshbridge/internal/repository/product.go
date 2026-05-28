package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type ProductRepo struct{ db *gorm.DB }

func NewProductRepo(db *gorm.DB) *ProductRepo { return &ProductRepo{db} }

func (r *ProductRepo) Create(p *model.Product) error { return r.db.Create(p).Error }

func (r *ProductRepo) FindByID(id int64) (*model.Product, error) {
	var p model.Product
	err := r.db.First(&p, id).Error
	return &p, err
}

func (r *ProductRepo) FindByFarmer(farmerID int64) ([]model.Product, error) {
	var products []model.Product
	err := r.db.Where("farmer_id = ?", farmerID).Order("created_at DESC").Find(&products).Error
	return products, err
}

func (r *ProductRepo) Search(category, keyword string, limit, offset int) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64
	q := r.db.Model(&model.Product{}).Where("status IN ?", []string{"published", "trading"})
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("variety LIKE ? OR origin_city LIKE ?", like, like)
	}
	q.Count(&total)
	err := q.Order("urgent DESC, created_at DESC").Limit(limit).Offset(offset).Find(&products).Error
	return products, total, err
}

func (r *ProductRepo) Update(p *model.Product) error { return r.db.Save(p).Error }
