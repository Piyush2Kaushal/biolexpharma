# Pharma Backend API

Production-ready Node.js + Express + MongoDB backend for the Biolexpharmaceutical website.

---

## Project Structure

```
pharma-backend/
├── config/
│   ├── db.js               # MongoDB connection
│   └── cloudinary.js       # Cloudinary + Multer setup
├── controllers/
│   ├── authController.js   # Login, token verify
│   ├── categoryController.js
│   ├── productController.js
│   └── inquiryController.js
├── middleware/
│   ├── auth.js             # JWT protect middleware
│   ├── errorHandler.js     # Central error handler
│   └── validators.js       # express-validator rules
├── models/
│   ├── Admin.js
│   ├── Category.js
│   ├── Product.js
│   └── Inquiry.js
├── routes/
│   ├── auth.js
│   ├── categories.js
│   ├── products.js
│   └── inquiries.js
├── utils/
│   └── seed.js             # Create first admin account
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## Quick Start (Local Development)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Then fill in your values (see Environment Variables section below)
```

### 3. Seed the database (creates your first admin account)
```bash
npm run seed
```
Default credentials created:
- **Email:** `admin@biolexpharmaceutical.com`
- **Password:** `Admin@123456`

> ⚠️ Change the password immediately after first login.

### 4. Start the development server
```bash
npm run dev       # with nodemon (auto-restart)
# or
npm start         # plain node
```

Server runs at: `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

---

## Environment Variables

Create a `.env` file in the root of `pharma-backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pharma_db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS — your frontend URL
FRONTEND_URL=http://localhost:5173
```

### How to get credentials

**MongoDB Atlas:**
1. Go to https://cloud.mongodb.com → Create free cluster
2. Database Access → Add user with password
3. Network Access → Allow IP `0.0.0.0/0` (or your server IP)
4. Connect → Drivers → Copy the connection string
5. Replace `<password>` with your DB user password

**Cloudinary:**
1. Go to https://cloudinary.com → Sign up free
2. Dashboard → Copy Cloud Name, API Key, API Secret

**JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## API Reference

All responses follow this format:
```json
{
  "success": true | false,
  "data": { ... },       // present on success
  "message": "..."       // present on error or info responses
}
```

---

### Authentication

#### `POST /api/auth/login`
Login as admin.

**Request:**
```json
{
  "email": "admin@biolexpharmaceutical.com",
  "password": "Admin@123456"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "_id": "64abc123...",
      "name": "Super Admin",
      "email": "admin@biolexpharmaceutical.com"
    }
  }
}
```

#### `GET /api/auth/verify`
Verify JWT token (used by frontend on page load).

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "admin": { "_id": "...", "name": "...", "email": "..." }
  }
}
```

---

### Categories

#### `GET /api/categories` — Public
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123",
      "name": "Antibiotics",
      "description": "...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/categories` — Admin only
**Headers:** `Authorization: Bearer <token>`
```json
{ "name": "Antibiotics", "description": "Optional description" }
```

#### `PUT /api/categories/:id` — Admin only
**Headers:** `Authorization: Bearer <token>`
```json
{ "name": "Updated Name", "description": "Updated description" }
```

#### `DELETE /api/categories/:id` — Admin only
**Headers:** `Authorization: Bearer <token>`
```json
{ "success": true, "message": "Category deleted successfully." }
```

---

### Products

#### `GET /api/products` — Public
Optional query param: `?category=<categoryId>`
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc456",
      "name": "Amoxicillin 500mg",
      "description": "...",
      "category": "64abc123",
      "categoryName": "Antibiotics",
      "image": "https://res.cloudinary.com/...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `GET /api/products/:id` — Public
Returns single product with same structure as above.

#### `POST /api/products` — Admin only
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

| Field         | Type   | Required |
|---------------|--------|----------|
| `name`        | string | ✅        |
| `description` | string | ✅        |
| `category`    | string | ✅ (MongoDB ObjectId) |
| `image`       | file   | ✅ (jpg/png/webp, max 5MB) |

#### `PUT /api/products/:id` — Admin only
Same fields as POST. `image` is optional — omit to keep existing image.

#### `DELETE /api/products/:id` — Admin only
Also deletes the image from Cloudinary.

---

### Inquiries

#### `POST /api/inquiries` — Public
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "message": "I'd like to know more about your products.",
  "productId": "64abc456"   // optional
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully. We will contact you soon."
}
```

#### `GET /api/inquiries` — Admin only
**Headers:** `Authorization: Bearer <token>`
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc789",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "message": "...",
      "productId": "64abc456",
      "productName": "Amoxicillin 500mg",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `PATCH /api/inquiries/:id/status` — Admin only
**Headers:** `Authorization: Bearer <token>`
```json
{ "status": "contacted" }
```
Valid values: `pending` | `contacted` | `resolved`

---

## Frontend Integration

### 1. Set the API base URL

In your frontend project, create or update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
For production, replace with your deployed backend URL:
```env
VITE_API_URL=https://your-app.onrender.com/api
```

### 2. Endpoint mapping (already wired in `src/app/services/api.ts`)

| Frontend call              | Backend endpoint                     |
|---------------------------|--------------------------------------|
| `authAPI.login()`          | `POST /api/auth/login`               |
| `authAPI.verifyToken()`    | `GET  /api/auth/verify`              |
| `categoryAPI.getAll()`     | `GET  /api/categories`               |
| `categoryAPI.create()`     | `POST /api/categories`               |
| `categoryAPI.update(id)`   | `PUT  /api/categories/:id`           |
| `categoryAPI.delete(id)`   | `DELETE /api/categories/:id`         |
| `productAPI.getAll()`      | `GET  /api/products`                 |
| `productAPI.getByCategory()` | `GET /api/products?category=<id>`  |
| `productAPI.getById(id)`   | `GET  /api/products/:id`             |
| `productAPI.create()`      | `POST /api/products`  (FormData)     |
| `productAPI.update(id)`    | `PUT  /api/products/:id` (FormData)  |
| `productAPI.delete(id)`    | `DELETE /api/products/:id`           |
| `inquiryAPI.create()`      | `POST /api/inquiries`                |
| `inquiryAPI.getAll()`      | `GET  /api/inquiries`                |
| `inquiryAPI.updateStatus()`| `PATCH /api/inquiries/:id/status`    |

### 3. No frontend code changes needed
Your `src/app/services/api.ts` already calls the correct endpoints with correct headers. Just set `VITE_API_URL` and it works.

---

## Deploying to Render (Free Tier)

1. Push `pharma-backend/` to a GitHub repository

2. Go to https://render.com → **New Web Service**

3. Connect your GitHub repo

4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node version:** 18+

5. Add all environment variables from `.env` in the **Environment** tab

6. Deploy → Copy the URL (e.g. `https://pharma-api.onrender.com`)

7. Update your frontend `.env`:
   ```env
   VITE_API_URL=https://pharma-api.onrender.com/api
   ```

8. Run seed script once after deploy (via Render Shell):
   ```bash
   node utils/seed.js
   ```

---

## Security Notes

- Passwords are hashed with `bcryptjs` (12 salt rounds)
- JWTs expire in 7 days by default
- All admin routes require `Authorization: Bearer <token>`
- `helmet` sets secure HTTP headers
- File uploads are validated by MIME type and size (max 5MB)
- Cloudinary public IDs are stored so images are deleted when products are deleted
- MongoDB connection uses TLS by default (Atlas)
- `.env` is in `.gitignore` — never commit secrets

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `MongoServerError: bad auth` | Wrong username/password in `MONGO_URI` |
| `CORS error` | Add your frontend URL to `FRONTEND_URL` in `.env` |
| `TokenExpiredError` | User must log in again; token is expired |
| `Cloudinary: Must supply api_key` | Fill `CLOUDINARY_*` vars in `.env` |
| `LIMIT_FILE_SIZE` | Image must be < 5MB |
| `Cast to ObjectId failed` | Invalid MongoDB ID passed in URL |
