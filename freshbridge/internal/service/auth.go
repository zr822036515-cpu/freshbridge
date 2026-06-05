package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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

type wechatResp struct {
	OpenID     string `json:"openid"`
	SessionKey string `json:"session_key"`
	UnionID    string `json:"unionid"`
	ErrCode    int    `json:"errcode"`
	ErrMsg     string `json:"errmsg"`
}

func (s *AuthService) WechatLogin(code string) (string, *model.User, error) {
	openID := ""
	unionID := ""

	if s.cfg.WechatAppID != "" && s.cfg.WechatAppSecret != "" {
		// Real WeChat login
		url := fmt.Sprintf(
			"https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
			s.cfg.WechatAppID, s.cfg.WechatAppSecret, code,
		)
		resp, err := http.Get(url)
		if err != nil {
			return "", nil, fmt.Errorf("wechat api error: %w", err)
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)

		var wr wechatResp
		if err := json.Unmarshal(body, &wr); err != nil {
			return "", nil, fmt.Errorf("wechat response parse error: %w", err)
		}
		if wr.ErrCode != 0 {
			return "", nil, fmt.Errorf("wechat error: %s (code=%d)", wr.ErrMsg, wr.ErrCode)
		}
		openID = wr.OpenID
		unionID = wr.UnionID
	} else {
		// MVP mock: no WeChat credentials configured
		openID = "mock_openid_" + code[:min(8, len(code))]
		unionID = "mock_unionid_" + code[:min(8, len(code))]
	}

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
		"exp":     time.Now().Add(time.Duration(s.cfg.JWTExpiryHours) * time.Hour).Unix(),
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
