# Ghi schema và xử lý công cụ bảo mật chặn request

Đọc khi có tác vụ schema hoặc request Rank Math thất bại. Tra route và quyền theo website đang chọn; ID, slug và schema key minh họa không phải mặc định.

## Thêm hoặc cập nhật schema

1. GET đúng bài với context=edit, ghi nhận trạng thái, slug và các trường ngoài yêu cầu. Kiểm tra schema đã lưu bằng editor/API được phép trước khi thêm; phân biệt schema mặc định được sinh tự động với bản ghi schema đã lưu.
2. Khám phá POST /rankmath/v1/updateSchemas. Dữ liệu theo cấu trúc nội bộ hiện tại của plugin, không phải JSON-LD tùy ý chèn vào nội dung. Thiếu route thì báo thiếu khả năng; không tự cài bridge hoặc đổi cấu hình plugin.
3. Schema mới dùng key mới bắt đầu bằng new-. Cập nhật dùng key schema-<meta_id> đang thuộc đúng bài. Không dùng new- để sửa schema cũ vì sẽ tạo thêm bản ghi. Giữ schema ngoài yêu cầu; không tự xóa/thay chúng.
4. Gửi objectID, objectType "post", schemas qua [API helper](api-helper.md), mỗi thao tác ghi có receipt riêng. Phản hồi không rõ kết quả cần kiểm tra dữ liệu đã lưu trước khi thử lại; đổi tên receipt không cho phép tạo trùng.
5. Lưu ánh xạ key mới → meta ID trả về. Đọc lại độc lập và so loại/schema fields. HTTP thành công hoặc ID trả về chưa chứng minh JSON-LD hiển thị đúng. Giữ nháp chưa xuất bản; bài công khai kiểm tra entity sai/trùng khi có thể.

### Ví dụ Article

Thay 123 bằng ID bài đã xác nhận, new-article-example bằng key thao tác mới. Chỉ dùng cấu trúc này sau khi xác nhận phiên bản plugin của site hỗ trợ:

```json
{
  "method": "POST",
  "path": "/rankmath/v1/updateSchemas",
  "body": {
    "objectID": 123,
    "objectType": "post",
    "schemas": {
      "new-article-example": {
        "@type": "Article",
        "metadata": {
          "title": "Article",
          "type": "template",
          "isPrimary": true,
          "name": "%seo_title%",
          "description": "%seo_description%"
        },
        "headline": "%seo_title%",
        "description": "%seo_description%",
        "keywords": "%keywords%",
        "author": { "@type": "Person", "name": "%name%" }
      }
    }
  }
}
```

Các biến được Rank Math lấy từ bài. Nếu người dùng yêu cầu giá trị nguyên văn thì giữ đúng. Không bịa tác giả, ngày, logo nhà xuất bản, đánh giá hoặc dữ kiện khác. isPrimary=true dành cho Article được chọn làm schema chính, không phải chỉ dẫn ghi đè schema chính đang có. Nếu thêm bên cạnh schema khác, làm rõ lựa chọn chính và giữ phần còn lại. Chỉ thêm shortcode khi cần với giá trị duy nhất.

Phản hồi tạo có thể là {"new-article-example":456}; lần sửa sau dùng "schema-456", không dùng lại "new-article-example".

### Giới hạn đọc lại

Ưu tiên schema metadata đã đăng ký REST hoặc editor được phép. updateSchemas trả ID, không trả toàn bộ schema đã lưu. updateMeta có thể trả schemas đọc từ cơ sở dữ liệu, nhưng **đây là route POST ghi, không phải endpoint chỉ đọc**. Meta rỗng có thể bị từ chối HTTP 400.

Chỉ trong tác vụ sửa schema đã được cho phép, có thể dùng cách dự phòng đã kiểm tra theo phiên bản: updateMeta với meta.permalink bằng đúng slug hiện tại, không rỗng, vừa GET từ bài. Ở bản triển khai đã xác minh, slug không đổi sẽ được giữ và phản hồi chứa schemas; tuy nhiên vẫn chạy hook plugin và phải có receipt. Tra lại slug ngay trước lệnh, không dùng slug cũ/ví dụ, đối chiếu trường bài sau lệnh. Không dùng cho tác vụ chỉ đọc hoặc khi có sửa đồng thời/hành vi plugin chưa rõ. Không có cách đọc lại an toàn thì báo giới hạn, không sửa một trường SEO không liên quan chỉ để lấy phản hồi.

## Khi request bị chặn

Cảnh báo khi liên quan: plugin bảo mật, WAF của hosting hoặc CDN có thể chặn nhầm REST API Rank Math. Request thất bại không tự chứng minh Rank Math không hỗ trợ API.

- 401: kiểm tra xác thực/Application Password.
- 403 JSON: đọc mã lỗi/nội dung và quyền tài khoản; có thể thiếu quyền, không phải firewall.
- 403 HTML/không phải JSON hoặc trang challenge/chặn có dấu hiệu rõ: kiểm tra plugin bảo mật, firewall hosting/CDN và log tương ứng. Không kết luận Wordfence nếu chưa có bằng chứng.
- 400: kiểm tra tham số/schema. 404: kiểm tra URL, route REST, module. Không khuyên mở bảo mật cho mọi lỗi.

Dừng ghi lặp lại khi xác nhận bị chặn. Báo website, route chính xác, thời điểm, HTTP status và chẩn đoán ngắn đã bỏ thông tin nhạy cảm; không đưa Authorization header, mật khẩu hoặc log nhạy cảm đầy đủ. Nêu rõ bước trước đã thành công chưa và kết quả thao tác cuối có còn chưa xác định không.

Với Wordfence: Tools → Live Traffic → Blocked by Firewall; tìm đúng request hợp lệ và chọn "Add param to firewall allowlist". Kiểm tra URL/tham số tương ứng tại Firewall → All Firewall Options → Allowlisted URLs. Hai route thường cần cho quy trình này:

- /wp-json/rankmath/v1/updateMeta
- /wp-json/rankmath/v1/updateSchemas

Cho phép một route/tham số không đảm bảo mọi payload sau đều được cho qua, cũng không thay thế xác thực/quyền WordPress. Với WAF khác, nhờ quản trị website/hosting xem rule tương ứng và tạo ngoại lệ hẹp. Không tự tắt toàn bộ firewall, mở toàn /wp-json/, né hạn chế truy cập hoặc đổi cấu hình toàn cục khi chưa được phép.

Learning Mode chỉ là lựa chọn chẩn đoán tạm thời được người dùng đồng ý, không phải cách sửa mặc định hoặc công tắc riêng Rank Math. Nó giảm một phần bảo vệ toàn website. Nếu dùng, chỉ thử thao tác hợp lệ cần thiết, kiểm tra ngoại lệ đã học và sớm bật lại Enabled and Protecting; tránh dùng khi site đang bị tấn công.

Sau khi người dùng xác nhận đã xử lý chặn, kiểm tra schema hiện tại lần nữa, rồi thử lại đúng thao tác còn thiếu với receipt mới. Đọc lại dữ liệu, giữ trạng thái bài; không lặp mù quáng lệnh tạo new-.

Nguồn: [REST Rank Math](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/rest/class-shared.php), [schema mặc định](https://github.com/rankmath/seo-by-rank-math/blob/master/includes/modules/schema/class-admin.php), [allowlist Wordfence](https://rankmath.com/kb/whitelist-rank-math-in-wordfence/), [rủi ro Learning Mode](https://www.wordfence.com/help/firewall/learning-mode/).
