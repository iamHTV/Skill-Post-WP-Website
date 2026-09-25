# Ưu tiên WebP trước upload

Cần Python 3 và Pillow hỗ trợ WebP. Kiểm tra bằng `python -c "from PIL import features; print(features.check('webp'))"`. Nếu thiếu, dùng encoder được duy trì có sẵn hoặc cài phụ thuộc trong môi trường được phép. Không mặc định gửi ảnh đến dịch vụ nén bên thứ ba.

```powershell
python SKILL_DIR/scripts/optimize_webp.py --input SOURCE.png --output-dir NEW_OUTPUT_FOLDER --kind text
```

SKILL_DIR, SOURCE.png, NEW_OUTPUT_FOLDER là chỗ thay đường dẫn thực. Dùng --kind text cho mặt bằng, sơ đồ, nhãn nhỏ; --kind photo cho ảnh chụp. Chỉ dùng --max-edge N khi kích thước hiển thị thực sự cần giảm; bỏ qua để giữ nguyên. Quy ước kích thước/mật độ pixel/ngân sách byte thuộc hồ sơ site; dung lượng mục tiêu không được đánh đổi độ rõ thiết yếu.

Script tạo lossless và nhiều WebP lossy cùng report.json: hash nguồn, định dạng thật, kích thước sau xử lý hướng ảnh, số byte, PSNR và đề xuất sơ bộ. Không ghi đè nguồn hoặc thư mục đầu ra có sẵn. Nguồn và ảnh nén được so ở cùng kích thước chuẩn hóa; chỉ số này không đánh giá chi tiết mất do resize. Độ trong suốt kiểm tra riêng. Ảnh động/mode không hỗ trợ bị từ chối thay vì âm thầm làm phẳng.

Các mức thử ban đầu: text 95/90/85, photo 90/85/80/75, cộng lossless. Đây là điểm khởi đầu thực dụng, không phải quy tắc SEO hay chứng minh tối ưu tuyệt đối. Với chữ, dùng lossless làm tham chiếu trước. PSNR mặc định 40 dB cho text, 36 dB cho photo chỉ là bộ lọc tham khảo, không đảm bảo chất lượng cảm nhận.

Mở nguồn và bản đề xuất, so chữ/đường nét ở 100% và kích thước hiển thị. Không đạt thì xem bản chất lượng cao hơn/lossless. Bản nhỏ hơn chỉ được chọn sau kiểm tra trực quan. Không tuyên bố “nhẹ nhất, nét nhất tuyệt đối”: chỉ chọn nhẹ nhất trong các bản đã thử và đạt. Bản gốc nhỏ hơn và phù hợp có thể được giữ; WebP không phải lý do tăng dung lượng. WebP có sẵn thường dùng lại, chỉ nén thêm khi có lý do.

Không sao chép EXIF/GPS; áp dụng hướng ảnh gốc và chuyển ICC nhúng sang sRGB. Thông tin bản quyền cần thiết giữ trong caption/description hoặc riêng. Giữ độ trong suốt và nguồn để sửa về sau, tránh nén lossy lặp lại.

Gửi file đầu ra đã chọn cùng upload_name .webp đúng cho scripts/wp-api.mjs; helper upload không tự chuyển đổi. Xác minh website nhận WebP và tạo thumbnail cần thiết trước khi nói toàn quy trình đã đạt. Upload bị từ chối cần tìm nguyên nhân, không đổi đuôi giả hoặc thử lại mù quáng.

Dữ liệu thử cục bộ cũ nếu có nằm ở assets/image-optimization-check, không phải đầu vào mặc định. Không upload chúng nếu user chưa chọn. Thư mục này được ignore và không cần để sử dụng skill.

Nguồn: [tùy chọn WebP của Pillow](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html#webp).
