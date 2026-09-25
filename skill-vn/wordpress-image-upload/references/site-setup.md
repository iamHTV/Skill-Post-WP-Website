# Thiết lập website và thông tin đăng nhập

Tài liệu này dùng cho người cài skill lần đầu và khi thêm website mới. Skill không có website mặc định. Mỗi lần làm việc phải chọn website theo URL hoặc site key do người dùng chỉ định.

## Đường dẫn trong ví dụ

`SKILL_DIR`, `PRIVATE_ROOT`, `ENV_FILE` và `SITE_KEY` là chỗ cần thay bằng đường dẫn/key người dùng chọn, không được script tự nội suy. Đường dẫn CLI tương đối tính từ thư mục chạy lệnh; đường dẫn có dấu cách phải đặt trong dấu nháy.

`D:/WordPressPrivate/references/sites/blog-a.json` trước đây chỉ là ví dụ, không phải đường dẫn cứng. Có thể giữ `.env` ở gốc repo và dùng `./private-wordpress/references/sites/` cho hồ sơ. Không bắt chuyển .env có sẵn sang chỗ khác.

## 1. Hỏi đúng thông tin ban đầu

Gom các mục còn thiếu vào một lần hỏi:

- URL WordPress chính xác, gồm cả thư mục con nếu có; ví dụ `https://example.com/blog`. Không nhập đường dẫn `wp-admin`, `wp-json` hay URL một bài viết. `www` và không `www` phải khớp cấu hình thực tế.
- Thư mục riêng trên máy để lưu cấu hình, ví dụ `PRIVATE_ROOT` trên Windows hoặc `/home/alice/wordpress-private` trên Linux. Không đặt trong skill hoặc thư mục website phục vụ qua HTTP. Có thể dùng private-wordpress trong repo cục bộ nếu đã ignore; không đưa thư mục này vào repo public hoặc ZIP thủ công.
- Đã có file `.env` chưa? Nếu có, chỉ cần đường dẫn và nhóm biến; không yêu cầu dán mật khẩu vào chat.
- Phạm vi: đăng bài / ảnh / SEO Rank Math / quan hệ JetEngine hoặc tích hợp khác. Plugin hiện diện không có nghĩa người dùng muốn sử dụng.

Thông tin đã được chỉ định cho tác vụ hiện tại không hỏi lại. Nếu nhiều website phù hợp, chờ chọn website trước khi gửi bất kỳ yêu cầu xác thực nào. Nếu người dùng không biết cách thiết lập, chủ động tạo file mẫu rỗng bằng công cụ bên dưới và chỉ dẫn họ điền cục bộ.

## 2. Cách khuyến nghị: mỗi website một .env

Cả ba skill đọc cùng một thư mục cấu hình riêng do người dùng chọn; không cần sao chép mật khẩu giữa các skill. Thư mục này khác với các `references/` mẫu công khai trong gói:

```text
PRIVATE_ROOT/
├── .gitignore
├── credentials/
│   ├── blog-a.env
│   └── blog-b.env
├── references/sites/
│   ├── blog-a.json
│   └── blog-b.json
└── receipts/
    ├── blog-a/
    └── blog-b/
```

`blog-a.env` chỉ có một website:

```dotenv
WORDPRESS_URL=https://example.com
WORDPRESS_USERNAME=
WORDPRESS_APPLICATION_PASSWORD=
```

Tên file có thể là `.env`, `blog-a.env` hoặc tên khác; helper dùng đường dẫn tường minh, không tự tìm file trong thư mục hiện tại. Mỗi website một username/Application Password tương ứng.

Tạo file mẫu và hồ sơ (không gửi network, không ghi WordPress):

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root "PRIVATE_ROOT" --key blog-a --site https://example.com
```

Nếu đã có `.env` ở vị trí riêng khác, đăng ký nó mà không sao chép hoặc sửa nội dung:

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root "PRIVATE_ROOT" --key blog-a --site https://example.com --env "ENV_FILE"
```

Helper in đường dẫn file và tên biến cần điền, không in giá trị bí mật. File hiện có luôn được giữ nguyên. Site key đã tồn tại sẽ bị từ chối để tránh ghi đè. Nếu .env nằm ngoài PRIVATE_ROOT, phải bảo vệ file đó riêng; .gitignore của PRIVATE_ROOT không bao phủ file bên ngoài.

## 3. Tạo Application Password và điền cục bộ

Trong WordPress: **Users → Profile → Application Passwords**, tạo mật khẩu có tên dễ nhận biết cho ứng dụng. Điền username đăng nhập và mật khẩu ứng dụng vào file đã tạo bằng trình soạn thảo trên máy. Không dùng tên hiển thị tác giả thay username, không dùng mật khẩu đăng nhập chính. Dấu cách trong Application Password có thể giữ nguyên; giá trị có `#` nên đặt trong dấu nháy.

Không mở toàn bộ file bí mật qua tool chỉ để xem cấu hình. Script đọc file tại runtime. Không ghi credentials vào lịch sử shell, ảnh chụp, câu trả lời hay gói skill. File `.env` vẫn là plaintext; `.gitignore` không phải mã hóa hoặc phân quyền. Người dùng cần giữ thư mục riêng và quyền truy cập phù hợp. Nếu file đã từng bị commit/public, thêm gitignore không khắc phục lộ mật khẩu: thu hồi Application Password đó.

Nguồn: [WordPress Application Passwords](https://developer.wordpress.org/advanced-administration/security/application-passwords/).

## 4. Kiểm tra website trước khi dùng

```powershell
node SKILL_DIR/scripts/wp-setup.mjs check --profile "PRIVATE_ROOT/references/sites/blog-a.json"
```

Lệnh này chỉ đọc API index và danh tính/quyền của tài khoản. Nó kiểm tra HTTPS, URL trong hồ sơ phải khớp URL của nhóm biến được chọn, xác thực, quyền bài viết/media và sự hiện diện route Rank Math/JetEngine. Không tự tạo bài test, không bật plugin hay đổi firewall. WebP upload và khả năng ghi metadata cần được xác minh riêng khi thực hiện tác vụ được yêu cầu.

Một route tồn tại chưa chứng minh tài khoản có quyền ghi. Lưu kết quả kiểm tra/những khả năng thực sự xác minh được vào hồ sơ riêng; không sửa hồ sơ mẫu public. Với 401 kiểm tra username/Application Password; với 403 đọc lỗi quyền/firewall; với 404 kiểm tra URL cài đặt và REST routes. Không tự chuyển domain qua redirect mang theo credentials; sửa URL chuẩn trước.

## 5. Thêm website mới

Chạy `init` với site key mới và URL mới, điền credentials của site đó rồi `check`. Ví dụ:

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root "PRIVATE_ROOT" --key blog-b --site https://example.org
node SKILL_DIR/scripts/wp-setup.mjs check --profile "PRIVATE_ROOT/references/sites/blog-b.json"
```

Nếu user nói “đăng lên blog-b”, chọn đúng `blog-b.json`. Nếu chỉ nói “đăng lên web” khi có nhiều web, hỏi họ chọn; không dùng site vừa dùng trước đó một cách ngầm định. Tác giả, taxonomy, CPT, plugin, relation ID và múi giờ được tra lại theo website, không sao chép ID từ site khác. Cấu hình site mới không kế thừa scope JetEngine/Rank Math của site cũ.

## 6. Nhiều website trong cùng một .env

Được hỗ trợ nhưng chỉ khi mỗi site có prefix riêng. Không lặp ba biến WORDPRESS_* vì chúng sẽ ghi đè/nhầm site trong các parser thông thường; helper này từ chối tên biến trùng.

```dotenv
WP_BLOG_A_URL=https://example.com
WP_BLOG_A_USERNAME=
WP_BLOG_A_APPLICATION_PASSWORD=

WP_BLOG_B_URL=https://example.org
WP_BLOG_B_USERNAME=
WP_BLOG_B_APPLICATION_PASSWORD=
```

Đăng ký từng site vào cùng file:

```powershell
node SKILL_DIR/scripts/wp-setup.mjs init --root "PRIVATE_ROOT" --key blog-a --site https://example.com --env "PRIVATE_ROOT/all-sites.env" --prefix WP_BLOG_A
node SKILL_DIR/scripts/wp-setup.mjs init --root "PRIVATE_ROOT" --key blog-b --site https://example.org --env "PRIVATE_ROOT/all-sites.env" --prefix WP_BLOG_B
```

Nếu file chưa tồn tại, lần đầu chỉ tạo nhóm của site đó. Lần tiếp theo giữ nguyên file; người dùng thêm nhóm mới bằng mẫu ở `assets/multi-site.env.example`. Helper không tự nối credentials hay xóa nhóm cũ. Có nhóm prefixed thì phải chọn prefix rõ ràng; không fallback sang WORDPRESS_* hay nhóm khác khi thiếu biến.

Khi chủ động chuyển .env một website sang dạng prefix, cập nhật cả env_prefix của hồ sơ tương ứng; không tự chuyển đổi cấu hình hiện tại.

Hồ sơ nhớ `env_file` và `env_prefix`; khi chạy chỉ cần chọn hồ sơ. File chung thuận tiện nhưng tập trung nhiều credentials vào một chỗ; mặc định hướng dẫn mỗi site một file.

## 7. Thực thi bằng hồ sơ đã chọn

```powershell
node SKILL_DIR/scripts/wp-api.mjs --profile "PRIVATE_ROOT/references/sites/blog-a.json" --request request.json
```

GET/OPTIONS đọc thật; POST chỉ xem trước. Khi đã có yêu cầu thực hiện từ user, thêm `--apply --receipt "PRIVATE_ROOT/receipts/blog-a/operation-001.json"`. Không hỏi lại quyền đã được cấp. Nếu muốn kiểm tra thêm URL dự định, truyền `--site https://example.com`; khác hồ sơ sẽ bị từ chối. Không kết hợp `--profile` với `--env`/`--prefix` để tránh ghi đè lựa chọn ngầm.

Cách trực tiếp vẫn được hỗ trợ: `--env FILE --site URL`, thêm `--prefix WP_BLOG_A` với file chung. Prefix có dạng WP_ + chữ hoa/số/gạch dưới. Script không nội suy biến shell, không hỗ trợ multiline values; mỗi biến một dòng.

## 8. Scope và lựa chọn biên tập

Với bài mới, hỏi các mục còn thiếu: trạng thái/ngày giờ/múi giờ, tác giả, danh mục, tags hoặc không tags, ảnh đại diện hoặc không ảnh. Dùng câu trả lời của tác vụ/batch hiện tại; hồ sơ chỉ mô tả khả năng và lựa chọn đã được user chủ động áp dụng. Narrow updates giữ các trường khác. Với ảnh/SEO riêng, chỉ hỏi các mục liên quan.

Rank Math và JetEngine là tùy chọn theo site và scope. Không tự cài plugin, tạo CPT, bật relation API hay thay firewall trong bước setup. Không coi quyền Administrator là điều kiện mặc định cho mọi người; kiểm tra quyền tối thiểu thực tế cho tác vụ.

## 9. Chia sẻ công khai

Chỉ chia sẻ README của repo và các thư mục skill đã làm sạch. Không chia sẻ thư mục cấu hình riêng, .env thật, receipts, backup, báo cáo chứa đường dẫn/thông tin website riêng hoặc cả thư mục dự án. Bản public chỉ chứa domain ví dụ và file mẫu không có secrets. Không đưa hồ sơ website thật vào references của skill public. Dữ liệu ảnh thử cục bộ trong assets/image-optimization-check được ignore; không đưa vào bản chia sẻ nếu chưa kiểm tra quyền sử dụng. .gitignore không tự lọc file khi nén ZIP thủ công.

Các file mẫu: [single-site.env.example](../assets/single-site.env.example), [multi-site.env.example](../assets/multi-site.env.example), [định dạng hồ sơ](sites/template.md), [website giả định](sites/example.md). `SKILL_DIR` trong lệnh là đường dẫn thư mục skill đang cài, không phải literal cần giữ nguyên.
