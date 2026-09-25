# Định dạng hồ sơ website riêng

Tạo hồ sơ thật ngoài thư mục skill bằng scripts/wp-setup.mjs init. Ví dụ cấu trúc, không chứa credentials hoạt động:

```json
{
  "schema_version": 1,
  "key": "blog-a",
  "url": "https://example.com",
  "env_file": "../../credentials/blog-a.env",
  "env_prefix": null,
  "capabilities": {
    "checked_at": null,
    "rankmath": "unknown",
    "jetengine": "unknown",
    "webp": "unknown"
  },
  "task_defaults": null
}
```

env_file tính tương đối từ file JSON này, không phải thư mục chạy lệnh; đường dẫn tuyệt đối cũng dùng được. Env chung dùng env_prefix, ví dụ WP_BLOG_A. Không lưu mật khẩu hay nội dung .env vào JSON.

Có thể lưu route post type đã xác minh, ghi chú tra tác giả/danh mục, múi giờ, khả năng upload/tạo thumbnail WebP, kích thước và relation ID tùy chọn. Tách thông tin lịch sử khỏi khả năng hiện đã kiểm tra. Không biến ID lần test thành mặc định. Tài khoản API không quyết định tác giả bài.

Xem [website giả định](example.md) để hiểu quan hệ giữa hồ sơ và .env.
