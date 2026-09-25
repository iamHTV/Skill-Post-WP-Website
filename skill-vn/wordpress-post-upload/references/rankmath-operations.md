# Rank Math khi không cài skill SEO

Đọc hồ sơ site và khám phá plugin/route đang hoạt động. Tiêu đề SEO khác tiêu đề bài. Giữ nguyên giá trị được yêu cầu; nếu tối ưu, dựa trên bài thật, ý định tìm kiếm và từ khóa tự nhiên, không bịa dữ kiện.

Dùng [API helper](api-helper.md) POST /rankmath/v1/updateMeta với objectID, objectType "post" và chỉ các meta key được yêu cầu: rank_math_title, rank_math_description, rank_math_focus_keyword. Route không có thì kiểm tra trường đã đăng ký REST trước khi dùng payload meta của bài. Không tự cài/bật plugin hoặc bridge metadata khi chưa có quyền tương ứng.

Đọc lại độc lập nếu trường được công khai qua API được phép. Phản hồi plugin nhận cập nhật không chứng minh giá trị đã lưu/hiển thị. Bài công khai kiểm tra head tag nếu có thể; không đăng nháp chỉ để xác minh. Không tạo điểm rank_math_seo_score giả hoặc hứa thứ hạng. Báo hỗ trợ còn thiếu và hoàn tất phần độc lập đã được cho phép.

Nguồn: [route metadata Rank Math](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/rest/class-shared.php).
