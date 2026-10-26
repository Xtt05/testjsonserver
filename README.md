# BookStore Phần B

1. Giải nén ZIP.
2. Mở terminal trong thư mục `BookStore_PhanB`.
3. Chạy `npm install`.
4. Kiểm tra `src/api/client.ts`; IP hiện đặt là `10.10.35.88`. Nếu IP máy tính đổi, cập nhật lại.
5. Đảm bảo JSON Server trong thư mục `bookstore-api` đang chạy cổng 3000.
6. Chạy `npx expo start`.
7. Mở Expo Go trên điện thoại cùng Wi-Fi.

Ứng dụng tối giản có đăng nhập, đăng ký, lưu phiên AsyncStorage, danh sách sách, chi tiết sách, đọc review và gửi review kèm JWT.

Tài khoản mẫu `test@gmail.com / 123456` chỉ hoạt động nếu đã tồn tại trong `db.json` với mật khẩu tương thích JSON Server Auth. Nếu không đăng nhập được, chuyển sang đăng ký hoặc kiểm tra dữ liệu server.
