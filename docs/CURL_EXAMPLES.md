\# Примеры запросов curl для тестирования



\## 1. Upload файл (multipart) — admin

curl -X POST "https://lacriminalite.ru/api/upload" \\

&nbsp; -H "x-admin-secret: YOUR\_ADMIN\_SECRET" \\

&nbsp; -F "file=@/path/to/photo.jpg"



\## 2. Add product (админ API)

curl -X POST "https://lacriminalite.ru/api/admin/products" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "x-admin-secret: YOUR\_ADMIN\_SECRET" \\

&nbsp; -d '{"action":"addProduct","payload": {"title":"Test","slug":"test","price":1000,"collection":"regular","sizeStock":{"S":5,"M":3},"images":\["https://.../photo.jpg"]}}'



\## 3. Add event (админ API)

curl -X POST "https://lacriminalite.ru/api/admin/events" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "x-admin-secret: YOUR\_ADMIN\_SECRET" \\

&nbsp; -d '{"action":"addEvent","payload": {"title":"Party","slug":"party-1","description":"Desc","price":500,"startsAt":"2026-01-01T20:00:00Z","images":\["https://.../event.jpg"]}}'



\## 4. Create order (checkout)

curl -X POST "https://lacriminalite.ru/api/orders" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{

&nbsp;   "cart": {"items":\[{"productId":1,"quantity":1,"size":"M","price":8990}],"total":8990},

&nbsp;   "purchaser": {"name":"Иван Иванов","email":"ivan@example.com","phone":"79990001122"},

&nbsp;   "address": {"full":"ул. Пушкина, д.1","city":"Москва","postalCode":"111111"},

&nbsp;   "shippingMethod":"sdek"

&nbsp; }'



\## 5. Admin list orders

curl -X POST "https://lacriminalite.ru/api/admin/orders" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "x-admin-secret: YOUR\_ADMIN\_SECRET" \\

&nbsp; -d '{"action":"list"}'



\## 6. Cancel order (admin)

curl -X POST "https://lacriminalite.ru/api/admin/orders/cancel" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -H "x-admin-secret: YOUR\_ADMIN\_SECRET" \\

&nbsp; -d '{"orderNumber":"1616161616"}'



\## 7. Simulate YooKassa webhook (payment.succeeded)

curl -X POST "https://lacriminalite.ru/api/webhooks/yookassa" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{"event":"payment.succeeded","object":{"id":"pay\_123","metadata":{"orderNumber":"1616161616"}}}'



\## 8. Simulate SDEK webhook

curl -X POST "https://lacriminalite.ru/api/webhooks/sdek" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{"order": {"external\_id":"1616161616"}, "cdek\_number":"TRACK123", "status":"delivered"}'



