package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /api/finance/summary
func FinanceSummary(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"total_orders":    1286,
		"total_amount":    8563200.00,
		"active_users":    342,
		"today_orders":    47,
		"today_amount":    286500.00,
		"scrolling": []gin.H{
			{"id": 1001, "user": "张**", "amount": 125000, "product": "红富士苹果", "time": "2分钟前", "status": "completed"},
			{"id": 1002, "user": "李**", "amount": 88000, "product": "赣南脐橙", "time": "5分钟前", "status": "completed"},
			{"id": 1003, "user": "王**", "amount": 256000, "product": "车厘子", "time": "8分钟前", "status": "completed"},
			{"id": 1004, "user": "赵**", "amount": 163000, "product": "丹东草莓", "time": "12分钟前", "status": "completed"},
			{"id": 1005, "user": "陈**", "amount": 95000, "product": "琯溪蜜柚", "time": "15分钟前", "status": "pending"},
			{"id": 1006, "user": "刘**", "amount": 310000, "product": "精品礼盒", "time": "18分钟前", "status": "completed"},
		},
	})
}

// GET /api/supply-demand/list
func SupplyDemandList(c *gin.Context) {
	now := time.Now().Format("2006-01-02")
	c.JSON(http.StatusOK, gin.H{
		"supply": []gin.H{
			{"id": 1, "variety": "红富士苹果", "quantity": "50吨", "price": "4.2元/斤", "origin": "新疆阿克苏", "contact": "企业微信客服", "date": now},
			{"id": 2, "variety": "赣南脐橙", "quantity": "30吨", "price": "3.8元/斤", "origin": "江西赣州", "contact": "企业微信客服", "date": now},
			{"id": 3, "variety": "丹东草莓", "quantity": "5吨", "price": "28.0元/斤", "origin": "辽宁丹东", "contact": "企业微信客服", "date": now},
			{"id": 4, "variety": "琯溪蜜柚", "quantity": "40吨", "price": "2.5元/斤", "origin": "福建平和", "contact": "企业微信客服", "date": now},
			{"id": 5, "variety": "智利车厘子", "quantity": "8吨", "price": "45.0元/斤", "origin": "进口/广州港", "contact": "企业微信客服", "date": now},
		},
		"demand": []gin.H{
			{"id": 101, "variety": "红富士苹果", "quantity": "20吨", "price": "5.0元/斤", "buyer": "北京新发地", "contact": "企业微信客服", "date": now},
			{"id": 102, "variety": "云南蓝莓", "quantity": "3吨", "price": "45.0元/斤", "buyer": "上海辉展", "contact": "企业微信客服", "date": now},
			{"id": 103, "variety": "海南凤梨", "quantity": "15吨", "price": "6.5元/斤", "buyer": "广州江南", "contact": "企业微信客服", "date": now},
			{"id": 104, "variety": "突尼斯石榴", "quantity": "10吨", "price": "8.0元/斤", "buyer": "深圳海吉星", "contact": "企业微信客服", "date": now},
		},
	})
}
