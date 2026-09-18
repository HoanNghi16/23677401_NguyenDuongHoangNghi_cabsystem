# CONTEXT DỰ ÁN CAB – TỔNG HỢP CÔNG VIỆC

## 1. Bối cảnh dự án

Đây là hệ thống CAB (gọi xe) được xây dựng theo kiến trúc **Microservices**.

Các role chính:

* Khách hàng
* Tài xế
* Nhân viên vận hành
* Hệ thống

Mục tiêu hiện tại là hoàn thiện:

1. Functional Requirements (FR)
2. Phân chia Service
3. Use Case
4. API Documentation bằng OpenAPI 3.0.3 YAML

Hiện tại đã chốt **4 microservices**:

* Auth Service
* User Service
* Booking Service
* Trip Service

Không có Operation Service riêng.

---

# 2. Functional Requirements đã chốt

Hiện tại hệ thống có **21 FR**, được gom từ các yêu cầu ban đầu.

| BR    | ID    | Chức năng                    | Mô tả                                                                                                                                                                                               | Role                                   |
| ----- | ----- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| BR-01 | FR-01 | Đăng ký tài khoản            | Người dùng nhập thông tin cần thiết để tạo tài khoản mới và đăng ký sử dụng hệ thống.                                                                                                               | Khách hàng, Tài xế                     |
| BR-01 | FR-02 | Đăng nhập                    | Người dùng cung cấp thông tin xác thực để truy cập vào hệ thống.                                                                                                                                    | Khách hàng, Tài xế, Nhân viên vận hành |
| BR-01 | FR-03 | Đăng xuất                    | Người dùng kết thúc phiên đăng nhập hiện tại và thoát khỏi hệ thống.                                                                                                                                | Khách hàng, Tài xế, Nhân viên vận hành |
| BR-01 | FR-04 | Cập nhật thông tin cá nhân   | Người dùng xem và cập nhật thông tin cá nhân của tài khoản.                                                                                                                                         | Khách hàng                             |
| BR-01 | FR-05 | Đặt xe                       | Khách hàng nhập điểm đón, điểm đến, lựa chọn loại xe, xem thông tin chuyến và xác nhận yêu cầu đặt xe.                                                                                              | Khách hàng                             |
| BR-03 | FR-06 | Tìm tài xế                   | Hệ thống xác định các tài xế đang sẵn sàng và tìm tài xế phù hợp dựa trên vị trí và loại xe.                                                                                                        | Hệ thống                               |
| BR-03 | FR-07 | Phân công tài xế             | Hệ thống ưu tiên và gửi yêu cầu chuyến đến tài xế phù hợp. Khi tài xế từ chối hoặc không phản hồi, hệ thống tiếp tục tìm tài xế khác. Nếu không tìm được tài xế, hệ thống thông báo cho khách hàng. | Hệ thống                               |
| BR-04 | FR-08 | Xử lý yêu cầu chuyến         | Tài xế nhận thông báo yêu cầu chuyến mới và lựa chọn chấp nhận hoặc từ chối chuyến.                                                                                                                 | Tài xế                                 |
| BR-05 | FR-09 | Quản lý chuyến đi            | Hệ thống tạo và quản lý trạng thái chuyến; tài xế cập nhật trạng thái từ đã đến điểm đón, đã đón khách, đang di chuyển đến hoàn thành chuyến.                                                       | Tài xế, Hệ thống                       |
| BR-05 | FR-10 | Theo dõi chuyến đi           | Khách hàng theo dõi trạng thái hiện tại của chuyến đi.                                                                                                                                              | Khách hàng                             |
| BR-05 | FR-11 | Xem lịch sử chuyến đi        | Người dùng tra cứu các chuyến đi đã hoàn thành và xem thông tin của từng chuyến, bao gồm thông tin cước phí.                                                                                        | Khách hàng, Tài xế, Nhân viên vận hành |
| BR-06 | FR-12 | Xác nhận thanh toán          | Tài xế xác nhận đã nhận tiền từ khách hàng; hệ thống ghi nhận chuyến đi ở trạng thái đã thanh toán.                                                                                                 | Tài xế, Hệ thống                       |
| BR-07 | FR-13 | Quản lý khách hàng           | Nhân viên vận hành xem và quản lý thông tin khách hàng.                                                                                                                                             | Nhân viên vận hành                     |
| BR-07 | FR-14 | Quản lý tài xế               | Nhân viên vận hành xem và quản lý thông tin tài xế.                                                                                                                                                 | Nhân viên vận hành                     |
| BR-07 | FR-15 | Quản lý phương tiện          | Nhân viên vận hành xem và quản lý thông tin phương tiện.                                                                                                                                            | Nhân viên vận hành                     |
| BR-07 | FR-16 | Theo dõi chuyến đang diễn ra | Nhân viên vận hành xem các chuyến hiện đang được thực hiện trong hệ thống.                                                                                                                          | Nhân viên vận hành                     |
| BR-07 | FR-17 | Theo dõi tài xế              | Nhân viên vận hành xem trạng thái của các tài xế.                                                                                                                                                   | Nhân viên vận hành                     |
| BR-07 | FR-18 | Xử lý sự cố chuyến đi        | Nhân viên vận hành tiếp nhận và xử lý các chuyến đi gặp sự cố.                                                                                                                                      | Nhân viên vận hành                     |
| BR-07 | FR-19 | Tra cứu lịch sử giao dịch    | Nhân viên vận hành tra cứu thông tin các giao dịch thanh toán trong hệ thống.                                                                                                                       | Nhân viên vận hành                     |
| BR-08 | FR-20 | Xác thực người dùng          | Hệ thống xác thực người dùng trước khi cho phép sử dụng các chức năng yêu cầu tài khoản.                                                                                                            | Hệ thống                               |
| BR-08 | FR-21 | Phân quyền                   | Hệ thống kiểm soát quyền truy cập các chức năng dựa trên vai trò của người dùng.                                                                                                                    | Hệ thống                               |

---

# 3. Các quyết định quan trọng về FR

## Logging

Không đưa logging/audit middleware thành Functional Requirement.

FR cũ về "Ghi nhật ký quản trị" đã loại bỏ vì:

* Logging là implementation detail.
* Middleware có thể tự xử lý.
* Không có chức năng người dùng trực tiếp quản lý/xem log.

## Tính cước

Không tạo FR "Tính cước" riêng.

Cước được hệ thống tính **trong quá trình đặt xe**, thuộc FR-05.

Nếu viết lại mô tả FR-05 chi tiết hơn, có thể thể hiện:

* Nhập điểm đón
* Nhập điểm đến
* Chọn loại xe
* Hệ thống tính cước
* Xem thông tin chuyến và cước phí
* Xác nhận đặt xe

## Thanh toán

Hệ thống hiện tại **chỉ hỗ trợ tiền mặt**.

Không có online payment vì phạm vi coding chỉ khoảng 2 tuần.

Luồng:

* Khách hàng hoàn thành chuyến
* Thanh toán tiền mặt cho tài xế
* Tài xế xác nhận đã nhận tiền
* Hệ thống cập nhật trạng thái thanh toán

Do đó FR-12 là **Xác nhận thanh toán**, không phải một Payment Service độc lập.

## Lịch sử giao dịch

Customer và Driver không cần chức năng "Tra cứu lịch sử giao dịch" riêng.

Thông tin cước/phí thanh toán đã nằm trong thông tin/lịch sử chuyến đi.

FR-19 chỉ dành cho Nhân viên vận hành.

## Không tự thêm requirement

Không tự thêm các chức năng như:

* Hủy chuyến
* Đánh giá tài xế
* Đổi mật khẩu
* Online payment
* Khuyến mãi
* Điểm thưởng
* Khiếu nại

...nếu chưa được đưa vào requirement.

---

# 4. Microservice Architecture đã chốt

## Service 1 — Auth Service

Phụ trách:

* Đăng ký
* Đăng nhập
* Đăng xuất
* Xác thực
* Phân quyền

FR:

* FR-01
* FR-02
* FR-03
* FR-20
* FR-21

---

## Service 2 — User Service

Gom:

* Customer
* Driver
* Vehicle

Phụ trách:

* Thông tin cá nhân
* Quản lý khách hàng
* Quản lý tài xế
* Quản lý phương tiện
* Theo dõi trạng thái tài xế

FR:

* FR-04
* FR-13
* FR-14
* FR-15
* FR-17

Vehicle Service được gộp vào User Service vì vehicle có quan hệ rất chặt với driver và phạm vi hệ thống hiện tại không cần một service độc lập.

---

## Service 3 — Booking Service

Booking Service gom cả:

* Booking
* Fare calculation
* Driver matching
* Driver dispatch

Phụ trách:

* Đặt xe
* Tính cước trong lúc đặt xe
* Tìm tài xế
* Phân công tài xế
* Xử lý trường hợp tài xế từ chối/không phản hồi
* Tiếp tục tìm tài xế khác
* Thông báo nếu không tìm được tài xế

FR:

* FR-05
* FR-06
* FR-07

Không có Dispatch Service riêng.

Không có Fare Service riêng.

---

## Service 4 — Trip Service

Phụ trách giai đoạn sau khi đã có tài xế và chuyến đi được hình thành.

Gồm:

* Trip
* Tracking
* Trip history
* Payment
* Incident

FR:

* FR-08
* FR-09
* FR-10
* FR-11
* FR-12
* FR-16
* FR-18
* FR-19

Payment được gộp vào Trip Service vì hệ thống chỉ có giao dịch thanh toán gắn với chuyến đi, không có nghiệp vụ transaction độc lập.

---

# 5. Không có Operation Service

Nhân viên vận hành là **Actor**, không phải một Microservice.

Ví dụ:

Nhân viên vận hành muốn xem khách hàng:
→ gọi User Service.

Muốn xem tài xế:
→ gọi User Service.

Muốn xem phương tiện:
→ gọi User Service.

Muốn xem chuyến đang diễn ra:
→ gọi Trip Service.

Muốn xử lý sự cố:
→ gọi Trip Service.

Muốn tra cứu giao dịch:
→ gọi Trip Service.

Vì vậy không tạo Operation Service riêng.

---

# 6. Kiến trúc tổng quát

```text
                    ┌─────────────────┐
                    │   Auth Service  │
                    │ Auth / RBAC     │
                    └────────┬────────┘
                             │
                             ▼
┌──────────────┐      ┌───────────────┐
│ User Service │◄────►│   Booking     │
│              │      │   Service     │
│ Customer     │      │ Booking       │
│ Driver       │      │ Fare          │
│ Vehicle      │      │ Find Driver   │
│ Driver state │      │ Assign Driver │
└──────┬───────┘      └───────┬───────┘
       │                      │
       │                      ▼
       │              ┌───────────────┐
       └─────────────►│ Trip Service  │
                      │               │
                      │ Trip          │
                      │ Payment       │
                      │ Tracking      │
                      │ History       │
                      │ Incident      │
                      └───────────────┘
```

Lưu ý về business flow:

```text
Customer
   │
   ▼
Booking Service
   │
   ├── Tạo booking
   ├── Tính cước
   ├── Tìm tài xế
   └── Phân công tài xế
             │
             ▼
       Driver nhận yêu cầu
             │
        Chấp nhận
             │
             ▼
       Trip Service
             │
             ├── Quản lý chuyến
             ├── Theo dõi
             ├── Lịch sử
             ├── Xử lý sự cố
             └── Payment
```

Nếu cần xác định chính xác event/state giữa Booking và Trip thì phải tiếp tục thiết kế ở bước sau, không tự suy diễn thêm requirement.

---

# 7. API Documentation

Đang chuẩn bị API docs bằng **OpenAPI 3.0.3 YAML**.

Cấu trúc file dự kiến:

```text
api-docs/
├── auth.openapi.yaml
├── user.openapi.yaml
├── booking.openapi.yaml
└── trip.openapi.yaml
```

Không dùng một file Swagger chung.

Tên `*.openapi.yaml` được ưu tiên vì project đang dùng OpenAPI 3.0.3.

---

# 8. Chức năng cần đưa vào API Docs

## auth.openapi.yaml

### Authentication

* Đăng ký tài khoản
* Đăng nhập
* Đăng xuất
* Xác thực người dùng

### Authorization

* Phân quyền

FR:

```text
FR-01
FR-02
FR-03
FR-20
FR-21
```

API dự kiến có thể gồm:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/verify
```

Phần API cụ thể cho permission/RBAC sẽ được thiết kế tiếp khi viết YAML, không cần cố định endpoint ngay nếu chưa thống nhất.

---

## user.openapi.yaml

### Customer

* Xem thông tin khách hàng
* Cập nhật thông tin cá nhân
* Quản lý khách hàng

### Driver

* Xem thông tin tài xế
* Quản lý tài xế
* Xem trạng thái tài xế

### Vehicle

* Xem thông tin phương tiện
* Quản lý phương tiện

FR:

```text
FR-04
FR-13
FR-14
FR-15
FR-17
```

---

## booking.openapi.yaml

### Booking

* Tạo yêu cầu đặt xe
* Xem thông tin booking
* Tính cước trong quá trình đặt xe

### Driver Matching / Dispatch

* Tìm tài xế phù hợp
* Gửi yêu cầu chuyến đến tài xế
* Xử lý từ chối
* Tìm tài xế tiếp theo
* Xử lý trường hợp không tìm được tài xế

FR:

```text
FR-05
FR-06
FR-07
```

Không tạo `/fare` riêng chỉ để tính cước nếu tính cước là một bước của booking.

---

## trip.openapi.yaml

### Trip

* Xử lý yêu cầu chuyến
* Tạo/quản lý chuyến
* Cập nhật trạng thái chuyến
* Theo dõi chuyến
* Xem lịch sử chuyến
* Xem các chuyến đang diễn ra

### Incident

* Xử lý sự cố chuyến đi

### Payment

* Xác nhận thanh toán tiền mặt
* Xem thông tin thanh toán của chuyến
* Tra cứu lịch sử giao dịch

FR:

```text
FR-08
FR-09
FR-10
FR-11
FR-12
FR-16
FR-18
FR-19
```

---

# 9. Mapping FR → Service cuối cùng

```text
AUTH SERVICE
├── FR-01 Đăng ký tài khoản
├── FR-02 Đăng nhập
├── FR-03 Đăng xuất
├── FR-20 Xác thực người dùng
└── FR-21 Phân quyền

USER SERVICE
├── FR-04 Cập nhật thông tin cá nhân
├── FR-13 Quản lý khách hàng
├── FR-14 Quản lý tài xế
├── FR-15 Quản lý phương tiện
└── FR-17 Theo dõi tài xế

BOOKING SERVICE
├── FR-05 Đặt xe
├── FR-06 Tìm tài xế
└── FR-07 Phân công tài xế

TRIP SERVICE
├── FR-08 Xử lý yêu cầu chuyến
├── FR-09 Quản lý chuyến đi
├── FR-10 Theo dõi chuyến đi
├── FR-11 Xem lịch sử chuyến đi
├── FR-12 Xác nhận thanh toán
├── FR-16 Theo dõi chuyến đang diễn ra
├── FR-18 Xử lý sự cố chuyến đi
└── FR-19 Tra cứu lịch sử giao dịch
```

Tổng:

```text
21 FR
4 Services
Không Operation Service
Không Payment Service riêng
Không Vehicle Service riêng
Không Dispatch Service riêng
Không Fare Service riêng
```

---

# 10. Trạng thái hiện tại của công việc

Đã hoàn thành/chốt:

* [x] Gom và chuẩn hóa Functional Requirements
* [x] Chốt 21 FR
* [x] Loại logging khỏi FR
* [x] Chốt cash-only payment
* [x] Chốt tính cước nằm trong Booking
* [x] Chốt 4 microservices
* [x] Gộp Vehicle vào User
* [x] Gộp Booking + Dispatch
* [x] Gộp Payment vào Trip
* [x] Bỏ Operation Service
* [x] Xác định cấu trúc API docs

Đang làm tiếp:

* [ ] Thiết kế endpoint cụ thể cho từng service
* [ ] Thiết kế request/response
* [ ] Thiết kế schema/model trong OpenAPI
* [ ] Xác định HTTP method + status code
* [ ] Viết `auth.openapi.yaml`
* [ ] Viết `user.openapi.yaml`
* [ ] Viết `booking.openapi.yaml`
* [ ] Viết `trip.openapi.yaml`

## Điểm tiếp tục lần sau

Tiếp tục từ **thiết kế API docs cho 4 service**, không quay lại phân chia FR/service trừ khi có requirement mới hoặc phát hiện vấn đề kiến trúc.

Ưu tiên làm từng file một, từng service một, không làm tất cả cùng lúc để tránh quá tải.

Thứ tự đề xuất:

1. `auth.openapi.yaml`
2. `user.openapi.yaml`
3. `booking.openapi.yaml`
4. `trip.openapi.yaml`

Khi thiết kế endpoint, không tự thêm business requirement. Nếu một endpoint/field cần quyết định nhưng context chưa đủ thì hỏi lại trước.
