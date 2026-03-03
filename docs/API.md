# E-Commerce Order Processing – API Documentation

Base URL: `http://localhost:5000/api` (or your backend URL)

## Authentication

All protected endpoints require header: `Authorization: Bearer <token>`

---

## Auth

### POST /auth/register
Register a new user (customer or admin).

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 6)",
  "role": "customer | admin (optional, default customer)"
}
```

**Response:** `201` – `{ "success": true, "token": "...", "user": { "id", "name", "email", "role" } }`

---

### POST /auth/login
Login.

**Body:** `{ "email": "string", "password": "string" }`

**Response:** `200` – `{ "success": true, "token": "...", "user": { "id", "name", "email", "role" } }`

---

### GET /auth/me
Current user (requires auth).

**Response:** `200` – `{ "success": true, "user": { "id", "name", "email", "role" } }`

---

## Products

### GET /products
List products with search, filter, sort, pagination.

**Query:** `page`, `limit`, `search`, `category` (UUID), `sort` (name | price | created_at), `order` (ASC | DESC)

**Response:** `200` – `{ "success": true, "data": [...], "pagination": { "page", "limit", "total", "totalPages" } }`

---

### GET /products/:id
Get single product.

**Response:** `200` – `{ "success": true, "data": product }`

---

### POST /products
Create product (admin).

**Body:** `{ "name", "description?", "price", "stock?", "image_url?", "category_id?" }`

**Response:** `201` – `{ "success": true, "data": product }`

---

### PUT /products/:id
Update product (admin).

**Body:** same as create (all optional).

**Response:** `200` – `{ "success": true, "data": product }`

---

### DELETE /products/:id
Delete product (admin).

**Response:** `204`

---

## Categories

### GET /categories
List all categories.

**Response:** `200` – `{ "success": true, "data": [...] }`

---

### POST /categories
Create category (admin).

**Body:** `{ "name": "string" }`

**Response:** `201` – `{ "success": true, "data": category }`

---

## Cart (authenticated)

### GET /cart
Get current user's cart.

**Response:** `200` – `{ "success": true, "data": [ { "id", "quantity", "Product": { "id", "name", "price", "stock", "image_url" } } ] }`

---

### POST /cart
Add to cart or increase quantity.

**Body:** `{ "product_id": "UUID", "quantity": 1 }`

**Response:** `201` – `{ "success": true, "data": cart array }`

---

### PUT /cart/:id
Update cart item quantity (0 to remove).

**Body:** `{ "quantity": number }`

**Response:** `200` – `{ "success": true, "data": cart array }` or item removed from array

---

### DELETE /cart/:id
Remove item from cart.

**Response:** `204`

---

## Orders (authenticated)

### POST /orders
Place order from cart. Creates order, order items, reduces stock, clears cart.

**Response:** `201` – `{ "success": true, "message": "...", "data": order with OrderItems }`

---

### GET /orders
List current user's orders.

**Response:** `200` – `{ "success": true, "data": [...] }`

---

### GET /orders/:id
Get single order (own only).

**Response:** `200` – `{ "success": true, "data": order }`

---

### POST /orders/:id/pay
Simulate payment (dummy gateway). Sets payment_status to `paid`.

**Response:** `200` – `{ "success": true, "message": "...", "data": order }`

---

## Admin (admin only)

### GET /admin/users
List all users.

**Response:** `200` – `{ "success": true, "data": [...] }`

---

### GET /admin/orders
List all orders with optional status filter.

**Query:** `status`, `page`, `limit`

**Response:** `200` – `{ "success": true, "data": [...], "pagination": {...} }`

---

### GET /admin/analytics
Sales analytics: total orders, total revenue (paid), orders by status.

**Response:** `200` – `{ "success": true, "data": { "totalOrders", "totalRevenue", "byStatus": [...] } }`

---

## HTTP Status Codes

- `200` OK  
- `201` Created  
- `204` No Content  
- `400` Bad Request (validation / business rule)  
- `401` Unauthorized (missing or invalid token)  
- `403` Forbidden (e.g. not admin)  
- `404` Not Found  
- `409` Conflict (e.g. email already registered)  
- `500` Internal Server Error  

Errors: `{ "success": false, "message": "...", "errors": [...] }` (errors array for validation).
