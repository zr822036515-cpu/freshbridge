-- 鲜桥 FreshBridge 测试数据 Seed v2

-- 1. Users (already fixed open_id/union_id)
INSERT INTO users (id, open_id, union_id, role, phone, verified, created_at) VALUES
(1, 'mock_openid_f1', 'mock_uid_1', 'farmer', '13800000001', 1, '2026-06-01 08:00:00'),
(2, 'mock_openid_f2', 'mock_uid_2', 'farmer', '13800000002', 1, '2026-06-02 09:00:00'),
(3, 'mock_openid_s1', 'mock_uid_3', 'stall', '13900000003', 1, '2026-06-01 10:00:00'),
(4, 'mock_openid_f3', 'mock_uid_4', 'farmer', '13800000004', 1, '2026-06-03 07:00:00'),
(5, 'mock_openid_f4', 'mock_uid_5', 'farmer', '13900000005', 0, '2026-06-04 08:00:00');

-- 2. Products
INSERT INTO products (id, farmer_id, category, variety, spec, grade, total_quantity, price, origin_province, origin_city, status, created_at) VALUES
(1, 1, '蔬菜', '黄瓜', '20-25cm', '一级果', 2000, 2.13, '山东', '寿光', 1, '2026-06-05 08:00:00'),
(2, 1, '蔬菜', '西红柿', '150g+', '特级果', 1500, 2.78, '山东', '寿光', 1, '2026-06-05 09:00:00'),
(3, 2, '水果', '红富士苹果', '80-85mm', '特级果', 3000, 5.80, '陕西', '洛川', 1, '2026-06-04 10:00:00'),
(4, 2, '水果', '赣南脐橙', '70-75mm', '一级果', 5000, 3.50, '江西', '赣州', 1, '2026-06-03 08:00:00'),
(5, 4, '水果', '阳光玫瑰', '15g+', '特级果', 800, 15.80, '云南', '建水', 1, '2026-06-06 07:00:00'),
(6, 4, '水果', '西瓜', '5kg+', '一级果', 10000, 1.20, '陕西', '安康', 1, '2026-06-06 08:00:00'),
(7, 1, '蔬菜', '土豆', '100g+', '一级果', 5000, 1.52, '河北', '张家口', 1, '2026-06-05 11:00:00');

-- 3. Trade Orders (stall_id is the buyer)
INSERT INTO trade_orders (id, product_id, farmer_id, stall_id, commission_rate, pricing_mode, status, created_at) VALUES
(1, 1, 1, 3, 25, 'fixed', 'accepted', '2026-06-05 10:00:00'),
(2, 3, 2, 3, 22, 'fixed', 'accepted', '2026-06-04 14:00:00'),
(3, 4, 2, 3, 20, 'fixed', 'done', '2026-06-03 12:00:00');

-- 4. Sales Records
INSERT INTO sales_records (id, trade_id, product_id, stall_id, quantity, price, total_amount, record_method, sale_time, created_at) VALUES
(1, 1, 1, 3, 200, 2.13, 426.00, 'manual', '2026-06-05 14:20:00', '2026-06-05 14:20:00'),
(2, 1, 1, 3, 350, 2.10, 735.00, 'manual', '2026-06-05 11:05:00', '2026-06-05 11:05:00'),
(3, 2, 3, 3, 500, 5.80, 2900.00, 'manual', '2026-06-04 17:45:00', '2026-06-04 17:45:00'),
(4, 2, 3, 3, 300, 5.60, 1680.00, 'ocr', '2026-06-04 09:15:00', '2026-06-04 09:15:00'),
(5, 3, 4, 3, 2000, 3.50, 7000.00, 'manual', '2026-06-03 16:00:00', '2026-06-03 16:00:00');

-- 5. Settlements
INSERT INTO settlements (id, trade_id, farmer_id, stall_id, total_sales, platform_fee, logistics_fee, waste_deduction, stall_commission, farmer_amount, status, created_at) VALUES
(1, 1, 1, 3, 1161.00, 40.64, 50.00, 30.00, 290.25, 750.11, 'pending', '2026-06-05 18:00:00'),
(2, 2, 2, 3, 4580.00, 137.40, 100.00, 80.00, 916.00, 3346.60, 'confirmed', '2026-06-04 20:00:00'),
(3, 3, 2, 3, 7000.00, 175.00, 200.00, 150.00, 1050.00, 5425.00, 'paid', '2026-06-03 22:00:00');

-- 6. Logistics
INSERT INTO logistics (id, trade_id, farmer_id, origin_addr, dest_addr, cargo_desc, cargo_weight, vehicle_type, price, status, created_at) VALUES
(1, 1, 1, '山东寿光', '北京新发地', '黄瓜/西红柿', 3500.00, '4.2m厢货', 800.00, 'in_transit', '2026-06-05 15:00:00'),
(2, 2, 2, '陕西洛川', '广州江南', '红富士苹果', 3000.00, '6.8m高栏', 1200.00, 'pending', '2026-06-04 16:00:00');

INSERT INTO logistics_timeline (id, logistics_id, status, description, created_at) VALUES
(1, 1, 'loading', '货物装车完成，从山东寿光出发', '2026-06-05 15:30:00'),
(2, 1, 'in_transit', '已到达济南服务区，预计明早到达北京', '2026-06-05 18:00:00');

-- 7. Supply/Demand
INSERT INTO supply_demand (id, type, variety, quantity, price, origin, contact, status, created_at) VALUES
(1, 'supply', '红富士苹果', '3000斤', '5.80元/斤', '陕西洛川', '张农户', 1, '2026-06-05 08:00:00'),
(2, 'supply', '赣南脐橙', '5000斤', '3.50元/斤', '江西赣州', '李果农', 1, '2026-06-04 09:00:00'),
(3, 'demand', '阳光玫瑰葡萄', '500斤', '面议', '云南建水', '王采购', 1, '2026-06-06 10:00:00'),
(4, 'supply', '西瓜', '10000斤', '1.20元/斤', '陕西安康', '赣南果园', 1, '2026-06-06 07:00:00');

-- 8. Square Posts
INSERT INTO square_posts (id, user_id, type, category, origin, description, images, phone, real_phone, is_vip, is_pinned, status, like_count, comment_count, created_at) VALUES
(1, 4, 'supply', '脐橙', '江西赣州信丰县', '【供货水果】赣南脐橙大量上市，产地直发，品质保证\n【品类】脐橙\n【产地】江西省赣州市信丰县\n【联系方式】赣南果园 138****5678', '["/static/images/mall/product-1.jpg"]', '138****5678', '13800000004', 1, 1, 1, 12, 2, '2026-06-06 08:00:00'),
(2, 5, 'supply', '西瓜', '陕西安康岚皋县', '【供货水果】甘蒂一号大量有货，毛毛钱走货\n【品类】西瓜\n【产地】陕西省安康市岚皋县\n【联系方式】侯书言 150****8389', '["/static/images/mall/product-4.jpg"]', '150****8389', '15000008389', 0, 0, 1, 5, 0, '2026-06-06 09:00:00'),
(3, 1, 'supply', '水蜜桃', '浙江奉化', '【供货】水蜜桃包装盒，有需求的老板可以联系我 1824661\n【联系方式】鲜果地 1824661', '["/static/images/mall/product-5.jpg"]', '182****4661', '18246610001', 1, 1, 1, 2, 0, '2026-06-06 10:00:00');

-- 9. Square Follows
INSERT INTO square_follows (follower_id, followed_id) VALUES (1, 4), (3, 4), (3, 1);

-- 10. Square Likes
INSERT INTO square_likes (user_id, post_id) VALUES (1, 1), (3, 1), (5, 2);

-- 11. Square Comments
INSERT INTO square_comments (user_id, post_id, content, created_at) VALUES
(3, 1, '老板，脐橙什么价位？能发物流吗？', '2026-06-06 09:30:00'),
(4, 1, '目前3.5元/斤，可以发冷链物流', '2026-06-06 09:45:00'),
(1, 3, '水蜜桃还有货吗？', '2026-06-06 10:30:00');

-- 12. Notifications
INSERT INTO notifications (user_id, type, title, content, link, is_read, created_at) VALUES
(1, 'trade', '订单已确认', '订单 #1 已被王采购确认', '/pages/consignment/index', 0, '2026-06-05 10:05:00'),
(2, 'trade', '结算到账通知', '本期结算 ¥3346.60 已到账', '/pages/settlement/index', 0, '2026-06-05 18:00:00'),
(3, 'system', '平台公告', '鲜桥平台实名认证功能已上线', '', 0, '2026-06-06 07:00:00'),
(4, 'system', '有人赞了你的帖子', '王采购赞了你的脐橙帖子', '/pages/square/index', 0, '2026-06-06 09:00:00'),
(1, 'system', '有人评论了你的帖子', '王采购评论了你的水蜜桃帖子', '/pages/square/index', 0, '2026-06-06 10:30:00');
