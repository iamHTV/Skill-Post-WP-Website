# Công cụ gọi API

Cần Node.js 18+, không cần package bổ sung. Helper `../scripts/wp-api.mjs` tính từ thư mục tài liệu này, nằm ngay trong skill. Mỗi lần chạy chỉ gửi một request; agent vẫn phải chuẩn bị metadata, tra ID và xác minh theo skill.

Tạo request JSON UTF-8 bằng apply_patch. path tính từ /wp-json, không chứa bí mật. Ưu tiên `--profile PRIVATE_ROOT/references/sites/SITE_KEY.json`. Cách trực tiếp dùng `--env ENV_FILE --site URL`, thêm `--prefix WP_BLOG_A` nếu env chung. URL hồ sơ, --site nếu có và URL trong nhóm env đã chọn phải khớp domain/thư mục con (bỏ qua dấu / cuối). Không kết hợp --profile với --env/--prefix.

```powershell
node SKILL_DIR/scripts/wp-api.mjs --profile PRIVATE_ROOT/references/sites/SITE_KEY.json --request REQUEST_FILE
```

Các từ in hoa là chỗ thay bằng đường dẫn/key thật, không phải vị trí cố định. Xem [setup](site-setup.md) cho init/check. Hồ sơ và receipt riêng không đặt trong skill public.

GET/OPTIONS thực thi chỉ đọc. POST chỉ xem trước cho đến khi có --apply. Khi đã được yêu cầu thực hiện và request sẵn sàng, thêm `--apply --receipt RECEIPT_FILE`; không cần hỏi lại quyền. Thư mục cha của receipt phải tồn tại. Mỗi bước ghi dùng request và receipt duy nhất, tách theo website/tác vụ.

Receipt giữ chỗ thao tác trước khi gửi; không dùng lại đường dẫn receipt đã có. Thành công thì ghi ID và phản hồi. Timeout/phản hồi không phải JSON được coi là chưa rõ kết quả: kiểm tra bài/media đích hoặc danh sách gần đây, đối chiếu ID rồi quyết định có cần request mới không. Không chỉ đổi tên receipt để tạo/upload lại mù quáng. Phản hồi thành công của plugin vẫn cần đọc lại độc lập khi có thể. Receipt có thể chứa nội dung bài nên phải giữ riêng.

## Dạng request

Đọc: `{ "method": "GET", "path": "/wp/v2/posts/123?context=edit" }`.

Khám phá: `{ "method": "GET", "path": "/" }` hoặc OPTIONS /wp/v2/posts. Sau đổi cấu hình, query GET mới có thể tránh cache cũ, không né kiểm tra quyền.

Mẫu tạo nháp (chỉ minh họa cấu trúc; phải bổ sung lựa chọn đã hỏi theo skill đăng bài):

```json
{"method":"POST","path":"/wp/v2/posts","body":{"title":"Tiêu đề bài","content":"<p>Nội dung bài</p>","status":"draft"}}
```

Sửa dùng /wp/v2/posts/123 với trường được yêu cầu. Không dùng ID minh họa cho thao tác thật. Trạng thái nháp/đăng/hẹn giờ phải theo lựa chọn hiện tại của người dùng.

Upload:

```json
{"method":"POST","path":"/wp/v2/media","upload_file":"PATH/photo.webp","upload_name":"descriptive-image-name.webp"}
```

Helper nhận PNG/JPEG/WebP/GIF; kiểm tra nội dung file thực, không chỉ đuôi tên. Định dạng khác cần mở rộng client đã kiểm tra, không đổi đuôi giả. Cập nhật bốn trường bằng request riêng:

```json
{"method":"POST","path":"/wp/v2/media/456","body":{"title":"...","alt_text":"...","caption":"...","description":"..."}}
```

Rank Math: POST /rankmath/v1/updateMeta với body `{ "objectID":123, "objectType":"post", "meta":{ "rank_math_title":"...", "rank_math_description":"...", "rank_math_focus_keyword":"..." } }`.

Tích hợp khác nằm ngoài phạm vi trừ khi được yêu cầu và có tài liệu trong hồ sơ site. Helper không tự cấp quyền, đánh giá SEO, retry, xuất bản, tính điểm, chuyển ảnh hoặc đối chiếu trùng; agent quyết định theo tác vụ và skill.
