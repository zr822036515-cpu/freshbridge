package service

import (
	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type ProductService struct{ repo *repository.ProductRepo }

func NewProductService(repo *repository.ProductRepo) *ProductService {
	return &ProductService{repo}
}

func ApplyProductDefaults(p *model.Product) {
	p.Status = "published"
	if p.PricingMode == "" {
		p.PricingMode = "fixed"
	}
	if p.CommissionRate == 0 {
		p.CommissionRate = 25
	}
	if p.Packaging == "" {
		p.Packaging = "纸箱"
	}
	if p.MinOrder == 0 {
		p.MinOrder = 500
	}
	if p.Grade == "" {
		p.Grade = "一级果"
	}
}

func (s *ProductService) Create(p *model.Product) error {
	ApplyProductDefaults(p)
	return s.repo.Create(p)
}

func (s *ProductService) GetByID(id int64) (*model.Product, error) {
	return s.repo.FindByID(id)
}

func (s *ProductService) ListByFarmer(farmerID int64) ([]model.Product, error) {
	return s.repo.FindByFarmer(farmerID)
}

func (s *ProductService) Search(category, keyword, variety string, page, pageSize int) ([]model.Product, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	return s.repo.Search(category, keyword, variety, pageSize, offset)
}
