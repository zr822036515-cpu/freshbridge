package service

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"freshbridge/internal/config"
	"freshbridge/internal/model"
	"freshbridge/internal/repository"
)

type AuthService struct {
	cfg  *config.Config
	repo *repository.UserRepo
}

func NewAuthService(cfg *config.Config, repo *repository.UserRepo) *AuthService {
	return &AuthService{cfg, repo}
}

func (s *AuthService) WechatLogin(code string) (string, *model.User, error) {
	// MVP: mock WeChat code → openid
	// TODO: call https://api.weixin.qq.com/sns/jscode2session
	openID := "mock_openid_" + code[:min(8, len(code))]
	unionID := "mock_unionid_" + code[:min(8, len(code))]

	user, err := s.repo.FindByOpenID(openID)
	if err != nil {
		user = &model.User{
			OpenID:  openID,
			UnionID: unionID,
			Role:    "farmer",
		}
		if err := s.repo.Create(user); err != nil {
			return "", nil, err
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})
	tokenStr, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", nil, err
	}

	return tokenStr, user, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
