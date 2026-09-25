---
name: wordpress-post-upload
description: Tạo hoặc cập nhật bài WordPress từ nội dung được cung cấp, gồm tác giả, danh mục, tags, lịch đăng, ảnh và quan hệ tùy chọn theo website. Dùng khi đăng/sửa bài, setup website lần đầu, thêm website hoặc chọn credentials riêng/chung. Chỉ phối hợp xử lý ảnh và Rank Math khi thuộc yêu cầu.
---

# Đăng bài WordPress

## Chọn website và phạm vi

Đọc [setup website](references/site-setup.md) và hồ sơ riêng được chọn qua [danh mục hồ sơ](references/sites/index.md). Tài nguyên bắt buộc nằm trong skill này. Skill ảnh/SEO có thể hỗ trợ nếu đã cài, nhưng không phải điều kiện bắt buộc.

Làm rõ website, nguồn nội dung, tạo mới hay cập nhật, bài đích, trạng thái nháp/đăng ngay/hẹn giờ và phần bổ sung trước khi ghi. Dùng lựa chọn đã được cung cấp trong tác vụ; chỉ hỏi phần còn thiếu có ảnh hưởng. Biết website không đồng nghĩa mọi tích hợp đều được phép dùng. Nhắc dự án trong nội dung không tự cho phép tạo relation.

Trước khi tạo bài, hỏi người dùng các mục sau nếu chưa nêu rõ cho tác vụ hoặc đợt đăng hiện tại:

- Trạng thái và thời gian: bản nháp, đăng ngay hoặc hẹn ngày/giờ kèm múi giờ.
- Tác giả.
- Danh mục.
- Tags, bao gồm lựa chọn không dùng tags.
- Ảnh đại diện, bao gồm lựa chọn không dùng ảnh. Nếu chọn ảnh, hỏi có chèn trong nội dung không khi chưa được chỉ định.

Gom các mục thiếu vào một câu hỏi ngắn. Tra cứu website để đưa lựa chọn tác giả/danh mục thật khi hữu ích. Không thay câu trả lời bằng dữ liệu lần test cũ, hồ sơ lịch sử, tài khoản API hoặc suy đoán từ chủ đề. Không ngầm dùng tài khoản xác thực làm tác giả, Uncategorized, tags suy diễn hay ảnh cũ. Lựa chọn rõ như “không tags”, “không ảnh”, “dùng các mặc định tôi liệt kê” đã là câu trả lời, không hỏi lại.

Trong lúc chờ, được đọc bài, kiểm tra khả năng website và chuẩn bị nội dung cục bộ. Chưa tạo/đăng/hẹn giờ bài hoặc gắn ảnh trước khi có các lựa chọn bắt buộc. Nếu người dùng giao quyền tự chọn, chọn trong phạm vi đó và báo lại. Cập nhật hẹp chỉ hỏi thay đổi còn mơ hồ, giữ nguyên các trường ngoài yêu cầu.

Có thể đề xuất nháp khi chưa rõ ý định xuất bản, nhưng cần lựa chọn trước khi tạo. Đã được yêu cầu đăng/hẹn giờ thì không hỏi lại quyền. Cập nhật phải giữ trạng thái và trường không liên quan; ví dụ trong hồ sơ không phải mặc định chung.

## Chuẩn bị và thực hiện

1. Đọc hết bài nguồn. Giữ nội dung đã duyệt; upload không đồng nghĩa viết lại. Chuyển Markdown thành HTML/block Gutenberg phù hợp nếu cần, không gửi Markdown thô như HTML. Tách tiêu đề bài khỏi nội dung; tránh H1 trùng.
2. Xác định đúng post type và REST base. Tra tác giả, danh mục, tags thành ID của website đang chọn. Nếu nhiều kết quả hợp lý, làm rõ trước khi gắn. Không tự tạo tài khoản/danh mục vì không tìm thấy tên.
3. Cập nhật: GET bài chính xác với `context=edit`, dùng `content.raw` và giữ thuộc tính block. Không chỉ dựa vào slug cũ khi bài đã đổi tên. Tạo mới: lưu ngay ID trả về để tiếp tục các bước bằng ID đó.
4. Gửi payload tối thiểu. Bài thường dùng `POST /wp/v2/posts` để tạo, `POST /wp/v2/posts/{id}` để sửa; khám phá route tương ứng với CPT. Gán categories thay toàn bộ danh sách: gộp/thay theo yêu cầu. Hẹn giờ cần ngày giờ và múi giờ rõ ràng.
5. Nếu có xử lý ảnh, dùng skill `wordpress-image-upload` khi có, hoặc [hướng dẫn ảnh](references/image-operations.md). Featured image là ID attachment, không phải URL. “Dưới tiêu đề” nghĩa chèn block ảnh đầu `content.raw`, không sửa theme. Dùng URL, alt và caption phù hợp; kiểm tra ảnh đã tồn tại để tránh trùng. Nêu rõ vị trí phụ thuộc theme chưa được kiểm chứng.
6. Nếu có SEO, dùng `wordpress-rankmath-seo` khi có, hoặc [hướng dẫn Rank Math](references/rankmath-operations.md). Quan hệ tùy chọn đọc [JetEngine](references/jetengine.md). Bỏ qua tích hợp ngoài phạm vi.
7. GET bài lại, đối chiếu tiêu đề, slug, trạng thái, ngày giờ, tác giả/danh mục/tags, nội dung và featured_media theo yêu cầu. Đọc relation riêng. Bài công khai kiểm tra hiển thị khi cần; không xuất bản bản nháp chỉ để kiểm tra.

Dùng [API helper](references/api-helper.md) cho request lặp lại. Mỗi lần ghi có receipt riêng; không tự tạo lại sau timeout. Lỗi metadata/relation không tự hủy bản nháp đã tạo thành công. Báo bước hoàn tất và phần còn vướng.

## Bàn giao

Trả URL chỉnh sửa, trạng thái xuất bản cuối và trường đã đổi. Phân biệt dữ liệu đã đọc lại với API báo thành công nhưng chưa xác minh độc lập. Không nói đã kiểm tra điểm SEO hoặc giao diện thật nếu chưa làm.
