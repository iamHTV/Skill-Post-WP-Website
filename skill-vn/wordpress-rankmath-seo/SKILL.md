---
name: wordpress-rankmath-seo
description: Tối ưu và cập nhật metadata Rank Math trên bài WordPress đã chọn, gồm tiêu đề SEO, mô tả, từ khóa chính; canonical, robots, mạng xã hội và schema chỉ khi được yêu cầu và hỗ trợ. Dùng cho SEO Rank Math, setup/thêm website hoặc chọn credentials; không kích hoạt chỉ vì upload nguyên bài.
---

# SEO Rank Math cho WordPress

Đọc [setup website](references/site-setup.md) và hồ sơ riêng qua [danh mục hồ sơ](references/sites/index.md). Tài nguyên bắt buộc nằm trong skill này, không phụ thuộc skill bên cạnh.

## Phạm vi và khả năng website

Xác định website, bài chính xác, tối ưu hay gán giá trị nguyên văn, và trường cần xử lý. Đọc bài thật và SEO hiện có nếu truy cập được. Giữ đúng giá trị thử nghiệm người dùng yêu cầu. Tiêu đề SEO khác tiêu đề bài WordPress: không đổi tiêu đề bài khi chưa được yêu cầu/thống nhất. “Title” mơ hồ cần suy xét ngữ cảnh hoặc hỏi nếu ảnh hưởng kết quả.

Kiểm tra route và plugin đang hoạt động, không chỉ tin ghi chú lịch sử. Không có Rank Math thì báo thiếu khả năng; yêu cầu SEO thông thường không cho phép tự cài/bật plugin, chuyển từ plugin SEO khác hoặc sửa cấu hình toàn site.

## Tối ưu trường hiển thị

Viết tiêu đề SEO riêng và mô tả chính xác theo chủ đề, ý định tìm kiếm. Dùng từ khóa tự nhiên; không hứa thứ hạng hoặc bịa dữ kiện để qua checklist plugin. Số ký tự là gợi ý, không phải điều kiện đạt/trượt. Có thể đề xuất sửa bài nhưng chỉ thực hiện trong phạm vi biên tập đã cho.

Thông thường xử lý `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword`. Canonical, robots, social hoặc schema cần kiểm tra kiểu dữ liệu và cấu hình trước. Không ghi đè hành vi tự động canonical/robots nếu không có lý do cụ thể. Schema Rank Math là dữ liệu có cấu trúc; không nhét JSON-LD tùy ý vào meta key phỏng đoán hay tạo schema trùng.

## Ghi qua route được hỗ trợ

Dùng [API helper](references/api-helper.md).

- Nếu `/rankmath/v1/updateMeta` tồn tại và có quyền, POST `{ "objectID": POST_ID, "objectType": "post", "meta": { "rank_math_title": "...", "rank_math_description": "...", "rank_math_focus_keyword": "..." } }`. Khám phá lại route cho từng website; khả năng tương thích tùy phiên bản.
- Chỉ dùng payload `meta` của REST WordPress thông thường nếu các trường đã đăng ký trong schema và có quyền ghi. HTTP thành công của bài không chứng minh meta không rõ đã được lưu.
- Nếu không có cách nào, giải thích cần đăng ký metadata/bridge có phạm vi hẹp. Không tự cài snippet, mở toàn bộ meta hoặc sửa theme để né báo thiếu phụ thuộc.

Chỉ gửi key được yêu cầu. Giá trị rỗng có thể xóa metadata; bỏ qua key không đổi. Không đặt `rank_math_seo_score` bằng số tự tạo. Lưu từ khóa không tự tính lại điểm.

## Xác minh và báo cáo

Với schema, làm theo [ghi schema và xử lý bảo mật](references/schema-and-security.md): dùng `/rankmath/v1/updateSchemas`, phân biệt key tạo new- với ID sửa schema-, tránh trùng và đọc lại bản ghi mà không xuất bản nháp.

REST API Rank Math có thể bị plugin bảo mật hoặc firewall hosting/CDN chặn nhầm. Khi request lỗi, kiểm tra status/nội dung và log bảo mật trước khi kết luận API không hỗ trợ. Tài liệu trên có hướng dẫn Wordfence cho người dùng và cách thử lại an toàn; không tự tắt bảo mật hoặc mở toàn bộ REST API.

Ưu tiên đọc lại độc lập qua trường REST đã đăng ký hoặc editor được phép truy cập. Nếu chỉ có phản hồi ghi thành công của plugin, nói rõ “API đã nhận cập nhật; chưa đọc lại độc lập được”. Đây không phải lý do bắt người dùng xác nhận quyền thêm lần nữa.

Bài công khai: kiểm tra title, description, canonical, robots và schema thực tế. Route tùy chọn `/rankmath/v1/getHead?url=...` đọc head khi Headless CMS Support đã bật; không mở quyền ghi metadata. Không tự bật headless hoặc đăng bản nháp chỉ để xác minh.

Điểm Rank Math có thể cần mở editor hoặc công cụ Recalculate Scores. Tính lại toàn website nằm ngoài tác vụ một bài nếu chưa được cho phép. Điểm là tín hiệu phân tích của plugin, không đảm bảo thứ hạng Google.

Gặp 403 hoặc trang firewall không phải JSON: dừng ghi lặp lại, báo route và trở ngại. Với Wordfence dùng request bị chặn trong Live Traffic để xác định allowlist đúng; không tắt bảo vệ toàn site. Thử lại khi người dùng đã xử lý. Tham số GET mới có thể tránh cache cũ sau đổi cấu hình, không dùng để né hạn chế truy cập.

Nguồn để kiểm tra chi tiết phụ thuộc phiên bản: [route Rank Math](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/rest/class-shared.php), [đăng ký metadata](https://developer.wordpress.org/rest-api/extending-the-rest-api/modifying-responses/), [điểm SEO](https://rankmath.com/kb/seo-score-not-available/), [Wordfence allowlist](https://rankmath.com/kb/whitelist-rank-math-in-wordfence/).
