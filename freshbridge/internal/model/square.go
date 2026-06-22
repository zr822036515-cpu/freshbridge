package model

import "time"

type SquarePost struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	Type         string    `json:"type"`
	Category     string    `json:"category"`
	Origin       string    `json:"origin"`
	Description  string    `json:"description"`
	Images       string    `json:"images"`
	Phone        string    `json:"phone"`
	RealPhone    string    `json:"-"`
	IsVip        bool      `json:"is_vip"`
	IsPinned     bool      `json:"is_pinned"`
	Status       int8      `json:"status"`
	ReviewMsg    string    `json:"review_msg"`
	LikeCount    int       `json:"like_count"`
	CommentCount int       `json:"comment_count"`
	CreatedAt    time.Time `json:"created_at"`

	// Joined fields
	UserName   string `gorm:"-" json:"user_name,omitempty"`
	UserAvatar string `gorm:"-" json:"user_avatar,omitempty"`
	Liked      bool   `gorm:"-" json:"liked"`
	Followed   bool   `gorm:"-" json:"followed"`
}

func (SquarePost) TableName() string { return "square_posts" }

type SquareFollow struct {
	ID         int64     `json:"id"`
	FollowerID int64     `json:"follower_id"`
	FollowedID int64     `json:"followed_id"`
	CreatedAt  time.Time `json:"created_at"`
}

func (SquareFollow) TableName() string { return "square_follows" }

type SquareLike struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	PostID    int64     `json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
}

func (SquareLike) TableName() string { return "square_likes" }

type SquareComment struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	PostID    int64     `json:"post_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UserName  string    `gorm:"-" json:"user_name,omitempty"`
}

func (SquareComment) TableName() string { return "square_comments" }
