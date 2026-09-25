# Quan hệ JetEngine tùy chọn

Chỉ đọc khi có yêu cầu xử lý relation. Xác định đúng quan hệ, loại parent/child, số lượng liên kết cho phép và bắt buộc/tùy chọn từ hồ sơ website cùng kết quả khám phá thực tế. Meta WordPress thường không nhất thiết là relation JetEngine.

Website phải bật và lưu cả “Register get items/item REST API Endpoint” và “Register update REST API Endpoint” cho quan hệ đó. Giữ giới hạn quyền hiện tại. Chưa bật thì báo phần cần setup; yêu cầu nối một bài không cho phép sửa cấu hình quan hệ không liên quan.

Đọc parent: `GET /jet-rel/{relation_id}/parents/{post_id}`. Đọc child: `GET /jet-rel/{relation_id}/children/{project_id}`. Kiểm tra type/title/ID cả hai đối tượng trước khi ghi.

Nối dự án parent với bài child bằng POST /jet-rel/{relation_id}:

```json
{
  "parent_id": 123,
  "child_id": 456,
  "context": "parent",
  "store_items_type": "update"
}
```

ID trên là ví dụ, phải thay bằng ID đã tra. update thêm liên kết; replace thay các mục trong context đã chọn; disconnect gỡ liên kết chỉ định. Không dựa vào mặc định endpoint vì có thể là replace. Với một-nhiều, child không nên có parent thứ hai: kiểm tra parent hiện có và hỏi rõ nếu yêu cầu thay thế còn mơ hồ. Đã nối đúng thì bỏ qua ghi. Sau thành công, đọc parent lại và kiểm tra ID; có thể đọc thêm child của parent.

Không yêu cầu dự án thì bỏ qua relation hoàn toàn. Upload đơn thuần phải giữ kết nối hiện có, không xóa chúng.

Nguồn: [REST relation Crocoblock](https://crocoblock.com/knowledge-base/jetengine/jetengine-getting-and-updating-relation-data-via-rest-api/).
