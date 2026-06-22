package repository

import (
	"freshbridge/internal/model"

	"gorm.io/gorm"
)

type SquareRepo struct{ db *gorm.DB }

func NewSquareRepo(db *gorm.DB) *SquareRepo { return &SquareRepo{db} }

// --- Posts ---

func (r *SquareRepo) CreatePost(p *model.SquarePost) error { return r.db.Create(p).Error }

func (r *SquareRepo) ListPosts(userID int64, page, pageSize int) ([]model.SquarePost, int64, error) {
	var items []model.SquarePost
	var total int64
	q := r.db.Model(&model.SquarePost{}).Where("status = 1")
	q.Count(&total)
	err := q.Order("is_pinned DESC, created_at DESC").
		Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	if err != nil {
		return nil, 0, err
	}
	// Fill liked/followed status for current user
	if userID > 0 {
		postIDs := make([]int64, len(items))
		authorIDs := make([]int64, len(items))
		authorSet := make(map[int64]bool)
		for i, it := range items {
			postIDs[i] = it.ID
			authorIDs[i] = it.UserID
			authorSet[it.UserID] = true
		}
		// Likes
		var likes []model.SquareLike
		r.db.Where("user_id = ? AND post_id IN ?", userID, postIDs).Find(&likes)
		likedSet := make(map[int64]bool)
		for _, l := range likes {
			likedSet[l.PostID] = true
		}
		// Follows
		var follows []model.SquareFollow
		authorList := make([]int64, 0, len(authorSet))
		for aid := range authorSet {
			authorList = append(authorList, aid)
		}
		r.db.Where("follower_id = ? AND followed_id IN ?", userID, authorList).Find(&follows)
		followSet := make(map[int64]bool)
		for _, f := range follows {
			followSet[f.FollowedID] = true
		}
		for i := range items {
			items[i].Liked = likedSet[items[i].ID]
			items[i].Followed = followSet[items[i].UserID]
		}
	}
	return items, total, nil
}

func (r *SquareRepo) GetPost(id int64) (*model.SquarePost, error) {
	var p model.SquarePost
	err := r.db.First(&p, id).Error
	return &p, err
}

func (r *SquareRepo) SearchPosts(keyword string, page, pageSize int) ([]model.SquarePost, int64, error) {
	var items []model.SquarePost
	var total int64
	q := r.db.Model(&model.SquarePost{}).Where("status = 1")
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("description LIKE ? OR category LIKE ? OR origin LIKE ?", like, like, like)
	}
	q.Count(&total)
	err := q.Order("is_pinned DESC, created_at DESC").
		Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func (r *SquareRepo) ListUserPosts(userID int64, page, pageSize int) ([]model.SquarePost, int64, error) {
	var items []model.SquarePost
	var total int64
	r.db.Model(&model.SquarePost{}).Where("user_id = ? AND status = 1", userID).Count(&total)
	err := r.db.Where("user_id = ? AND status = 1", userID).
		Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

// --- Follows ---

func (r *SquareRepo) Follow(followerID, followedID int64) error {
	return r.db.Create(&model.SquareFollow{FollowerID: followerID, FollowedID: followedID}).Error
}

func (r *SquareRepo) Unfollow(followerID, followedID int64) error {
	return r.db.Where("follower_id = ? AND followed_id = ?", followerID, followedID).Delete(&model.SquareFollow{}).Error
}

func (r *SquareRepo) IsFollowing(followerID, followedID int64) bool {
	var count int64
	r.db.Model(&model.SquareFollow{}).Where("follower_id = ? AND followed_id = ?", followerID, followedID).Count(&count)
	return count > 0
}

func (r *SquareRepo) ListFollowers(followedID int64) ([]int64, error) {
	var ids []int64
	err := r.db.Model(&model.SquareFollow{}).Where("followed_id = ?", followedID).Pluck("follower_id", &ids).Error
	return ids, err
}

// --- Likes ---

func (r *SquareRepo) Like(userID, postID int64) error {
	return r.db.Create(&model.SquareLike{UserID: userID, PostID: postID}).Error
}

func (r *SquareRepo) Unlike(userID, postID int64) error {
	return r.db.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&model.SquareLike{}).Error
}

func (r *SquareRepo) IsLiked(userID, postID int64) bool {
	var count int64
	r.db.Model(&model.SquareLike{}).Where("user_id = ? AND post_id = ?", userID, postID).Count(&count)
	return count > 0
}

// --- Comments ---

func (r *SquareRepo) AddComment(c *model.SquareComment) error {
	err := r.db.Create(c).Error
	if err == nil {
		r.db.Model(&model.SquarePost{}).Where("id = ?", c.PostID).UpdateColumn("comment_count", gorm.Expr("comment_count + 1"))
	}
	return err
}

func (r *SquareRepo) ListComments(postID int64) ([]model.SquareComment, error) {
	var items []model.SquareComment
	err := r.db.Where("post_id = ?", postID).Order("created_at ASC").Find(&items).Error
	return items, err
}
