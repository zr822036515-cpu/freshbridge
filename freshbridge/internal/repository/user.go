package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type UserRepo struct{ db *gorm.DB }

func NewUserRepo(db *gorm.DB) *UserRepo { return &UserRepo{db} }

func (r *UserRepo) FindByOpenID(openID string) (*model.User, error) {
	var u model.User
	err := r.db.Where("open_id = ?", openID).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) Create(u *model.User) error { return r.db.Create(u).Error }

func (r *UserRepo) Update(u *model.User) error { return r.db.Save(u).Error }
