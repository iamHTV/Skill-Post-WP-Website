# Website giả định: Nhật ký làm vườn

Đây là ví dụ minh họa, không phải website đã cấu hình/đang hoạt động hoặc file hồ sơ có thể chạy. Phải thay example.com, garden-demo và các đường dẫn bằng dữ liệu thật. Không gửi credentials thật đến domain ví dụ.

## Phạm vi giả định

Giả sử người dùng muốn đăng bài làm vườn và ảnh, dùng Rank Math nếu có, không dùng JetEngine. Đây chỉ là lựa chọn minh họa, không phải mặc định. Chưa chọn tác giả, danh mục, tags, ảnh đại diện hay ngày giờ; cần hỏi trước khi tạo bài.

## Cấu trúc file riêng

```text
PRIVATE_ROOT/
  credentials/garden-demo.env
  references/sites/garden-demo.json
```

garden-demo.env (điền giá trị thật cục bộ):

```dotenv
WORDPRESS_URL=https://example.com
WORDPRESS_USERNAME=
WORDPRESS_APPLICATION_PASSWORD=
```

garden-demo.json:

```json
{
  "schema_version": 1,
  "key": "garden-demo",
  "url": "https://example.com",
  "env_file": "../../credentials/garden-demo.env",
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

env_file tính từ file JSON. Nếu hồ sơ ở REPO/private-wordpress/references/sites/ còn credentials ở REPO/.env, dùng env_file "../../../.env". Đây là ví dụ quan hệ thư mục, không cố định vị trí repo.

Nếu dùng chung REPO/.env cho nhiều web, hồ sơ này chọn env_prefix "WP_GARDEN_DEMO" và ba biến WP_GARDEN_DEMO_URL, WP_GARDEN_DEMO_USERNAME, WP_GARDEN_DEMO_APPLICATION_PASSWORD. URL thật phải khớp ở cả hai nơi.

## Kiểm tra

Sau khởi tạo, chạy check của setup helper với JSON riêng thật. Các khả năng ở trên đều chưa xác minh. Ghi nhận hỗ trợ plugin thực tế và phạm vi đã chọn trong hồ sơ/ghi chú riêng, không sửa ví dụ này. Tra ID từ website thật, không tự tạo ID.

Xem [setup](../site-setup.md) cho lệnh init/check và [định dạng](template.md) cho ý nghĩa các trường.
