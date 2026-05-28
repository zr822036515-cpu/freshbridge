package service

import (
	"testing"

	"freshbridge/internal/model"
)

func TestApplyProductDefaults_WhenEmpty(t *testing.T) {
	p := &model.Product{Category: "苹果"}
	ApplyProductDefaults(p)

	if p.Status != "published" {
		t.Errorf("status: expected 'published', got '%s'", p.Status)
	}
	if p.PricingMode != "fixed" {
		t.Errorf("pricing_mode: expected 'fixed', got '%s'", p.PricingMode)
	}
	if p.CommissionRate != 25 {
		t.Errorf("commission_rate: expected 25, got %d", p.CommissionRate)
	}
	if p.Packaging != "纸箱" {
		t.Errorf("packaging: expected '纸箱', got '%s'", p.Packaging)
	}
	if p.MinOrder != 500 {
		t.Errorf("min_order: expected 500, got %.0f", p.MinOrder)
	}
	if p.Grade != "一级果" {
		t.Errorf("grade: expected '一级果', got '%s'", p.Grade)
	}
}

func TestApplyProductDefaults_RespectsProvidedValues(t *testing.T) {
	p := &model.Product{
		Category:       "葡萄",
		PricingMode:    "floor_share",
		CommissionRate: 30,
		Packaging:      "泡沫箱",
		MinOrder:       100,
		Grade:          "特级果",
	}
	ApplyProductDefaults(p)

	if p.PricingMode != "floor_share" {
		t.Errorf("pricing_mode: expected 'floor_share', got '%s'", p.PricingMode)
	}
	if p.CommissionRate != 30 {
		t.Errorf("commission_rate: expected 30, got %d", p.CommissionRate)
	}
	if p.Packaging != "泡沫箱" {
		t.Errorf("packaging: expected '泡沫箱', got '%s'", p.Packaging)
	}
	if p.MinOrder != 100 {
		t.Errorf("min_order: expected 100, got %.0f", p.MinOrder)
	}
	if p.Grade != "特级果" {
		t.Errorf("grade: expected '特级果', got '%s'", p.Grade)
	}
}

func TestApplyProductDefaults_StatusAlwaysPublished(t *testing.T) {
	p := &model.Product{Status: "draft"}
	ApplyProductDefaults(p)
	if p.Status != "published" {
		t.Errorf("status should always be 'published', got '%s'", p.Status)
	}
}

func TestApplyProductDefaults_ZeroValuesReset(t *testing.T) {
	// commission_rate=0 should be replaced with 25
	p := &model.Product{CommissionRate: 0}
	ApplyProductDefaults(p)
	if p.CommissionRate != 25 {
		t.Errorf("commission_rate 0 should default to 25, got %d", p.CommissionRate)
	}

	// min_order=0 should be replaced with 500
	p2 := &model.Product{MinOrder: 0}
	ApplyProductDefaults(p2)
	if p2.MinOrder != 500 {
		t.Errorf("min_order 0 should default to 500, got %.0f", p2.MinOrder)
	}
}
