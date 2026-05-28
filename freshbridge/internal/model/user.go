package model

import "time"

type User struct {
	ID             int64     `gorm:"primaryKey" json:"id"`
	OpenID         string    `gorm:"column:open_id;uniqueIndex" json:"open_id"`
	UnionID        string    `gorm:"column:union_id" json:"union_id"`
	Nickname       string    `json:"nickname"`
	AvatarURL      string    `gorm:"column:avatar_url" json:"avatar_url"`
	Phone          string    `json:"phone"`
	Role           string    `json:"role"`
	RealName       string    `gorm:"column:real_name" json:"real_name"`
	IDCard         string    `gorm:"column:id_card" json:"id_card"`
	Verified       int       `json:"verified"`
	OriginProvince string    `gorm:"column:origin_province" json:"origin_province"`
	OriginCity     string    `gorm:"column:origin_city" json:"origin_city"`
	CreditScore    int       `gorm:"column:credit_score" json:"credit_score"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (User) TableName() string { return "users" }
