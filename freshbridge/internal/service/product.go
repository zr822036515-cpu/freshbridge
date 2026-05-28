package service

import (
	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type ProductService struct{ repo *repository.ProductRepo }

func NewProductService(repo *repository.ProductRepo) *ProductService {
	return &ProductService{repo}
}

func (s *ProductService) Create(p *model.Product) error {
	p.Status = "published"
	return s.repo.Create(p)
}

func (s *ProductService) GetByID(id int64) (*model.Product, error) {
	return s.repo.FindByID(id)
}

func (s *ProductService) ListByFarmer(farmerID int64) ([]model.Product, error) {
	return s.repo.FindByFarmer(farmerID)
}

func (s *ProductService) Search(category, keyword string, page, pageSize int) ([]model.Product, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	return s.repo.Search(category, keyword, pageSize, offset)
}
