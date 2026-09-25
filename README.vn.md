# Skill-Post-WP-Website

[English](README.md) | [Tiếng Việt](README.vn.md)

Ba skill độc lập cho AI agent: đăng bài lên nhiều website WordPress, upload ảnh chuẩn SEO và xử lý metadata Rank Math.

## Các skill

| Skill | Chức năng |
| --- | --- |
| [wordpress-post-upload](skill-vn/wordpress-post-upload/SKILL.md) | Tạo/sửa bài, chọn tác giả/danh mục/tags, hẹn giờ, gắn ảnh và relation JetEngine khi được yêu cầu. |
| [wordpress-image-upload](skill-vn/wordpress-image-upload/SKILL.md) | Đọc ảnh/OCR, tối ưu WebP, soạn title/alt/caption/description, upload và gắn ảnh. |
| [wordpress-rankmath-seo](skill-vn/wordpress-rankmath-seo/SKILL.md) | Đặt hoặc tối ưu tiêu đề SEO, mô tả, từ khóa chính và xác minh metadata được hỗ trợ. |

Chọn skill-vn cho tiếng Việt hoặc skill-en cho tiếng Anh. Hai bản dùng cùng mã xử lý và tên skill: **chỉ cài một ngôn ngữ cho mỗi skill**. Ngôn ngữ bài viết theo yêu cầu người dùng.

## Cài đặt

Tải/clone repo rồi chép từng thư mục skill cần dùng vào thư mục skills mà ứng dụng agent hỗ trợ. Giữ nguyên scripts, references, assets bên trong. Không bắt buộc cài cả ba skill.

Yêu cầu:

- Node.js 18+ cho REST API.
- Python 3 và Pillow hỗ trợ WebP khi chuyển ảnh.
- Website WordPress HTTPS và Application Password có quyền phù hợp.

agents/openai.yaml là thông tin hiển thị skill, không phải dịch vụ chạy nền. references/sites/example.md trong mỗi skill là website giả định, không phải đích mặc định.

## Cấu trúc repo và cấu hình riêng

```text
README.md                      # tiếng Anh
README.vn.md                   # tiếng Việt
credentials/
  website-a.env.example        # mẫu rỗng public
  website-b.env.example        # mẫu rỗng public
skill-en/                      # ba skill tiếng Anh
skill-vn/                      # ba skill tiếng Việt
```

Tạo cục bộ khi setup, **không đưa lên Git**:

```text
credentials/website-a.env
credentials/website-b.env
private-wordpress/references/sites/website-a.json
private-wordpress/references/sites/website-b.json
private-wordpress/receipts/
```

Cả ba skill dùng chung hồ sơ/credentials. Mật khẩu không nằm trong các thư mục skill được cài.

## Website đầu tiên

Nói với agent:

> Setup website WordPress của tôi, dùng credentials/website-a.env và lưu hồ sơ tại private-wordpress. Dùng bài viết, ảnh và Rank Math; chưa dùng JetEngine.

Agent hỏi URL chính xác và phạm vi còn thiếu, tạo file rỗng nếu cần rồi hỗ trợ kiểm tra. Bạn cũng có thể chép website-a.env.example thành website-a.env. Điền trên trình soạn thảo cục bộ, **không gửi mật khẩu trong chat**:

```dotenv
WORDPRESS_URL=
WORDPRESS_USERNAME=
WORDPRESS_APPLICATION_PASSWORD=
```

Điền URL cài WordPress (gồm thư mục con nếu có), username đăng nhập và mật khẩu ứng dụng, không dùng mật khẩu chính hay tên hiển thị tác giả.

Chạy từ gốc repo, thay domain ví dụ bằng website thật:

```powershell
node ./skill-vn/wordpress-post-upload/scripts/wp-setup.mjs init --root ./private-wordpress --key website-a --site https://example.com --env ./credentials/website-a.env
```

Nếu file đã tồn tại, init giữ nguyên. Điền đủ ba giá trị rồi kiểm tra:

```powershell
node ./skill-vn/wordpress-post-upload/scripts/wp-setup.mjs check --profile ./private-wordpress/references/sites/website-a.json
```

Init chỉ tạo file cục bộ; check chỉ đọc API, không tạo bài, upload ảnh, cài plugin hay sửa firewall. Hồ sơ trùng key không bị ghi đè.

## Thêm website

Dùng credentials/website-b.env và hồ sơ riêng:

```powershell
node ./skill-vn/wordpress-post-upload/scripts/wp-setup.mjs init --root ./private-wordpress --key website-b --site https://example.org --env ./credentials/website-b.env
```

Điền file đó rồi chạy check với private-wordpress/references/sites/website-b.json. Website A không thay đổi. Website tiếp theo dùng key/file mới.

Có thể dùng một env chung với các nhóm WP_BLOG_A_URL / WP_BLOG_A_USERNAME / WP_BLOG_A_APPLICATION_PASSWORD và WP_BLOG_B_*. Đăng ký cùng --env nhưng mỗi hồ sơ chọn --prefix WP_BLOG_A hoặc WP_BLOG_B. Trùng tên biến hoặc URL không khớp sẽ bị từ chối, không tự lấy credentials website khác.

Xem [setup đầy đủ](skill-vn/wordpress-post-upload/references/site-setup.md), [mẫu nhiều website](skill-vn/wordpress-post-upload/assets/multi-site.env.example) và [website giả định](skill-vn/wordpress-post-upload/references/sites/example.md).

## Đường dẫn và cách hoạt động

Không cố định ổ đĩa hay website. Chọn vị trí bằng --root, --env, --profile. Đường dẫn CLI tương đối tính từ nơi chạy lệnh; env_file trong JSON tính từ file hồ sơ. SKILL_DIR, PRIVATE_ROOT, SITE_KEY là ký hiệu cần thay, không phải biến được tự nội suy.

Bài mới: hỏi trạng thái/ngày giờ/múi giờ, tác giả, danh mục, tags và ảnh đại diện còn thiếu. Không hỏi lại lựa chọn đã rõ; cập nhật hẹp giữ nguyên các trường khác.

Rank Math/JetEngine tùy website và phạm vi được chọn. Setup không tự cài plugin hay mở relation API. Có route không chứng minh có quyền ghi. Không đảm bảo điểm SEO hoặc thứ hạng.

Ảnh ưu tiên WebP khi hỗ trợ, so nhiều bản nén, giữ nguồn và kiểm tra trực quan độ rõ. Media upload có thể truy cập công khai kể cả bài còn nháp.

## Bảo mật và chia sẻ

Git chỉ chứa mẫu .env.example rỗng. .env thật, private-wordpress, receipts, ảnh kiểm tra cục bộ và script thử website riêng được loại trừ. Không force-add các file này. .gitignore không xóa bí mật đã commit, không tự lọc khi nén ZIP thủ công. Nếu mật khẩu từng lộ, thu hồi Application Password.

Không điền mật khẩu vào ví dụ public hay ảnh chụp màn hình. Hồ sơ chọn website không tự cho phép xuất bản hoặc sửa cấu hình ngoài yêu cầu.

## Kiểm thử

Chạy từ gốc repo:

```powershell
node --test ./skill-vn/wordpress-post-upload/scripts/wp-api.test.mjs ./skill-vn/wordpress-post-upload/scripts/wp-setup.test.mjs
python -B -m unittest discover -s ./skill-vn/wordpress-image-upload/scripts -p test_optimize_webp.py
```

Cả ba skill và hai ngôn ngữ đều có test API/setup. Test dùng dữ liệu giả lập, không dùng credentials website thật.
