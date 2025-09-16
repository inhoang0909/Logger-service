# Logger-service
## Mục tiêu

Hướng dẫn từng bước để **tích hợp và chạy Logger Service** (Node.js/Express) trong môi trường local hoặc Docker, kèm cách **mở Swagger UI** để test API.

---

## Yêu cầu cơ bản

* Node.js >= 16
* npm hoặc yarn
* MongoDB (local hoặc container)
* Redis (local hoặc container)
* (Tùy chọn) Docker & docker-compose

---

## Biến môi trường mẫu (`.env`)

Tạo file `.env` trong thư mục gốc với các biến tối thiểu sau:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/logger
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
LOG_QUEUE_KEY=log_queue
NODE_ENV=development
```

> Lưu ý: tên biến trong project của bạn có thể khác (ví dụ `REDIS_URL`). Kiểm tra `config/*.js` để chắc.

---

## Cấu trúc thư mục (ví dụ)

```
├─ src/
│  ├─ config/
│  │  ├─ database.js
│  │  └─ redis.js
│  ├─ controllers/
│  ├─ routes/
│  │  └─ logRoutes.js
│  ├─ services/
│  ├─ models/
│  └─ server.js
├─ package.json
└─ .env
```

---

## 1. Cài đặt & chạy local (step-by-step)

1. Clone repository:

   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```
2. Cài dependencies:

   ```bash
   npm install
   # hoặc
   yarn
   ```
3. Tạo file `.env` theo mẫu phía trên.
4. Chạy MongoDB và Redis:

   * Nếu local đã cài: start service bình thường.
   * Dùng Docker nhanh:

     ```bash
     docker run -d --name mongo -p 27017:27017 mongo:6
     docker run -d --name redis -p 6379:6379 redis:7
     ```
5. Start server:

   ```bash
   # development (có nodemon)
   npm run dev

   # hoặc production
   node src/server.js

   # hoặc bật port khác tạm thời
   PORT=5000 node src/server.js
   ```
6. Kiểm tra server:

   * Root: `GET http://localhost:4000/` → trả về `ok` (nếu config mặc định PORT=4000)

---

## 2. Mở Swagger UI

1. Mở trình duyệt tới:

   ```
   http://localhost:<PORT>/api-docs
   # ví dụ: http://localhost:4000/api-docs
   ```
2. Nếu Swagger hiển thị nhưng **server URL (ở dropdown) không đúng**: kiểm tra `config/swagger.js` để đảm bảo `servers.url` dùng `process.env.PORT` hoặc khớp với `PORT` thực tế.

Ví dụ cấu hình swagger (nên dùng):

```js
const PORT = process.env.PORT || 4000;
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Logger API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};
```

3. Nếu đổi `PORT` hoặc sửa `servers` trong file config thì **khởi động lại server** để swagger reload.
4. Nếu UI vẫn hiển thị URL cũ: thử **Hard reload** (Ctrl+Shift+R) hoặc mở tab Incognito để tránh cache.

---

## 3. Các command để debug nhanh

* Kiểm tra swagger spec đã load route chưa (logs khi app start):

  ```js
  console.log('Swagger loaded paths:', Object.keys(swaggerSpec.paths));
  ```

  Nếu mảng rỗng → swagger-jsdoc không đọc được file (kiểm tra `apis` path).

* Kiểm tra port bận (EADDRINUSE):

  * macOS / Linux:

    ```bash
    lsof -i :4000
    kill -9 <PID>
    ```
  * Windows (PowerShell):

    ```powershell
    netstat -ano | findstr :4000
    taskkill /PID <PID> /F
    ```

* Kiểm tra Redis:

  ```bash
  redis-cli -h 127.0.0.1 -p 6379 ping
  # response: PONG
  ```

* Kiểm tra MongoDB:

  ```bash
  mongosh "mongodb://localhost:27017"
  ```

---

## 4. CURL examples (test nhanh)

* Enqueue log (vào Redis queue):

```bash
curl -X POST 'http://localhost:4000/logs' \
  -H 'Content-Type: application/json' \
  -d '{"service":"users","endpoint":"/users","method":"GET","status":200,"ip":"127.0.0.1","duration":120}'
```

* Create log trực tiếp (MongoDB):

```bash
curl -X POST 'http://localhost:4000/logs/direct' \
  -H 'Content-Type: application/json' \
  -d '{"service":"users","endpoint":"/users","method":"GET","status":200,"ip":"127.0.0.1"}'
```

* Lấy aggregated stats:

```bash
curl 'http://localhost:4000/logs/stats'
```

* Lấy error logs cho ngày cụ thể (Redis):

```bash
curl 'http://localhost:4000/logs/errors?date=2025-09-16'
```

* Lấy daily stats cho tháng:

```bash
curl 'http://localhost:4000/logs/monthly-stats?month=9&year=2025'
```

---

