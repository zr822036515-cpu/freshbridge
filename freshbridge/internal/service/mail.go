package service

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
)

// MailConfig holds SMTP settings.
type MailConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string
}

// MailService sends transactional emails.
type MailService struct {
	cfg *MailConfig
}

func NewMailService(cfg *MailConfig) *MailService {
	if cfg == nil || cfg.Host == "" {
		return nil
	}
	return &MailService{cfg: cfg}
}

// Send sends a plain-text email.
func (s *MailService) Send(to, subject, body string) error {
	if s == nil {
		return fmt.Errorf("mail service not configured")
	}

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s",
		s.cfg.From, to, subject, body)

	addr := fmt.Sprintf("%s:%s", s.cfg.Host, s.cfg.Port)
	auth := smtp.PlainAuth("", s.cfg.User, s.cfg.Password, s.cfg.Host)

	// Try TLS first, fall back to plain
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("smtp dial: %w", err)
	}
	defer client.Close()

	if err := client.Hello("freshbridge.net.cn"); err != nil {
		return fmt.Errorf("smtp hello: %w", err)
	}

	if ok, _ := client.Extension("STARTTLS"); ok {
		tlsCfg := &tls.Config{ServerName: s.cfg.Host}
		if err := client.StartTLS(tlsCfg); err != nil {
			return fmt.Errorf("smtp starttls: %w", err)
		}
	}

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth: %w", err)
	}
	if err := client.Mail(s.cfg.From); err != nil {
		return fmt.Errorf("smtp mail: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp rcpt: %w", err)
	}
	wc, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	_, err = fmt.Fprint(wc, msg)
	if err != nil {
		return fmt.Errorf("smtp write: %w", err)
	}
	return wc.Close()
}

// SendOrderConfirmation sends an order confirmation email.
func (s *MailService) SendOrderConfirmation(to, orderNo string, amount float64) error {
	subject := fmt.Sprintf("订单确认 #%s - 鲜桥 FreshBridge", orderNo)
	body := fmt.Sprintf("您的订单 %s 已确认，金额 ¥%.2f。\n\n感谢您在鲜桥购物！\n\n如有疑问请联系客服。\n鲜桥 FreshBridge", orderNo, amount)
	return s.Send(to, subject, body)
}

// SendDeliveryUpdate sends a logistics update email.
func (s *MailService) SendDeliveryUpdate(to, orderNo, status string) error {
	statusCN := map[string]string{
		"loading": "已装车", "in_transit": "运输中", "arrived": "已到达", "signed": "已签收",
	}
	label := statusCN[status]
	if label == "" {
		label = status
	}
	subject := fmt.Sprintf("物流更新 #%s - 鲜桥 FreshBridge", orderNo)
	body := fmt.Sprintf("您的货物 %s 状态已更新为：%s。\n\n鲜桥 FreshBridge", orderNo, label)
	return s.Send(to, subject, body)
}

// IsConfigured returns true if mail service is ready.
func (s *MailService) IsConfigured() bool {
	return s != nil && s.cfg.Host != ""
}

// I18n helper: simple key-value locale map
var LocaleZH = map[string]string{
	"app.name":               "鲜桥",
	"app.slogan":             "水果代卖 · 鲜达天下",
	"order.pending":          "待支付",
	"order.paid":             "已支付",
	"order.shipped":          "已发货",
	"order.completed":        "已完成",
	"order.cancelled":        "已取消",
	"logistics.pending":      "待接单",
	"logistics.accepted":     "已接单",
	"logistics.loading":      "装车中",
	"logistics.in_transit":   "运输中",
	"logistics.arrived":      "已到达",
	"logistics.signed":       "已签收",
	"contact.wechat_work":    "企业微信客服",
	"contact.email":          "support@freshbridge.net.cn",
}

var LocaleEN = map[string]string{
	"app.name":               "FreshBridge",
	"app.slogan":             "Fresh Fruit Consignment",
	"order.pending":          "Pending",
	"order.paid":             "Paid",
	"order.shipped":          "Shipped",
	"order.completed":        "Completed",
	"order.cancelled":        "Cancelled",
	"logistics.pending":      "Pending",
	"logistics.accepted":     "Accepted",
	"logistics.loading":      "Loading",
	"logistics.in_transit":   "In Transit",
	"logistics.arrived":      "Arrived",
	"logistics.signed":       "Signed",
	"contact.wechat_work":    "WeCom Support",
	"contact.email":          "support@freshbridge.net.cn",
}

// T returns a translated string for the given locale and key.
func T(locale, key string) string {
	var m map[string]string
	switch strings.ToLower(locale) {
	case "en", "en-us":
		m = LocaleEN
	default:
		m = LocaleZH
	}
	if v, ok := m[key]; ok {
		return v
	}
	return key
}
