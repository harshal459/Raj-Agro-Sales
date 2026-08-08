# 🌾 Krishi Yantra Dealers — Agricultural Machinery Website

A full-stack production-ready website for an agricultural machinery dealership.
Built with Node.js, Express, MongoDB, vanilla HTML/CSS/JS, and a complete admin dashboard.

---

## 📁 Project Structure

```
agri-dealer/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Admin login / JWT
│   │   ├── productController.js # Product CRUD
│   │   ├── inquiryController.js # Inquiry CRUD
│   │   └── visitorController.js # Visitor tracking & analytics
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── visitorTracker.js    # Auto-track every API hit
│   ├── models/
│   │   ├── Admin.js             # Admin user schema
│   │   ├── Product.js           # Product schema
│   │   ├── Inquiry.js           # Inquiry schema
│   │   └── Visitor.js           # Visitor/session schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── inquiries.js
│   │   └── visitors.js
│   ├── utils/
│   │   └── seedData.js          # Seed sample products & admin
│   ├── server.js                # Express entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   └── public/
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   ├── i18n.js          # EN / Marathi / Hindi translations
│       │   └── app.js           # Core logic: API, session, i18n, tracking
│       ├── images/              # Place logo.png and hero-bg.jpg here
│       ├── uploads/             # Auto-created for product images
│       ├── index.html           # Homepage
│       ├── products.html        # Product catalog
│       ├── product.html         # Product detail
│       ├── inquiry.html         # Inquiry form
│       └── contact.html         # Contact page
└── admin/
    ├── index.html               # Admin login + full dashboard
    └── admin.css                # Admin styles
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone / Download the project

```bash
cd agri-dealer/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agri-dealer
JWT_SECRET=change_this_to_a_long_random_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongPassword123!
WHATSAPP_NUMBER=919876543210
FRONTEND_URL=http://localhost:5000
```

### 4. Add your branding assets

Place these files in `frontend/public/images/`:
- `logo.png` — Your shop logo
- `hero-bg.jpg` — A farm/tractor background image (1920×1080 recommended)

### 5. Seed the database

```bash
npm run seed
```

This creates:
- 6 sample products
- Admin user (from your .env credentials)

### 6. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### 7. Open in browser

| URL | Description |
|-----|-------------|
| `http://localhost:5000` | Customer website |
| `http://localhost:5000/admin` | Admin dashboard |

**Admin login:** Use the credentials you set in `.env`

---

## 🔑 Admin Dashboard Features

- **Dashboard** — Live stats: visitors, customers, products, inquiries + 7-day chart
- **Products** — Add / Edit / Delete / Upload images / Mark featured
- **Inquiries** — View all inquiries, update status, call/WhatsApp directly
- **Visitors** — See all identified customers with visit history

---

## 🌐 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:slug` | Single product detail |
| POST | `/api/inquiries` | Submit an inquiry |
| POST | `/api/visitors/track` | Track visitor session |
| POST | `/api/visitors/identify` | Store visitor name+phone |
| GET | `/api/visitors/check/:sessionId` | Check if visitor identified |

### Admin (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/verify` | Verify token |
| GET | `/api/products/admin/all` | All products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/inquiries` | All inquiries |
| PUT | `/api/inquiries/:id` | Update inquiry status |
| DELETE | `/api/inquiries/:id` | Delete inquiry |
| GET | `/api/visitors/analytics` | Analytics data |
| GET | `/api/visitors/list` | Visitor list |

---

## 🌍 Multi-Language Support

Three languages supported: **English**, **Marathi (मराठी)**, **Hindi (हिंदी)**

- Language switcher in the header
- All text (buttons, labels, messages) translates instantly
- Language preference saved in `localStorage`
- Add more keys in `frontend/public/js/i18n.js`

---

## 📱 WhatsApp Integration

1. Set your number in `backend/.env`:
   ```
   WHATSAPP_NUMBER=919876543210
   ```
2. Also update in `frontend/public/js/app.js`:
   ```js
   const WHATSAPP_NUMBER = '919876543210';
   ```

---

## 🏷️ Customise Business Info

Edit these files for your branding:

**`frontend/public/index.html`** — Update:
- Business name
- Address, phone, email
- Hero stats (years, farmers served, etc.)
- Testimonials

**`frontend/public/js/app.js`** — Update:
- `WHATSAPP_NUMBER`

**`frontend/public/js/i18n.js`** — Update:
- Contact info in translations
- Business hours

---

## ☁️ Deployment (Production)

### Option A: VPS (DigitalOcean / AWS / Hetzner)

```bash
# Install PM2
npm install -g pm2

# Start app
cd backend
pm2 start server.js --name agri-dealer

# Auto-start on reboot
pm2 startup
pm2 save
```

Use **Nginx** as reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option B: Railway / Render (Free tier)

1. Push to GitHub
2. Connect repo to Railway/Render
3. Set environment variables in dashboard
4. Deploy — they handle everything automatically

### Option C: MongoDB Atlas (Cloud DB)

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in your `.env`

---

## 🔒 Security Features

- ✅ JWT authentication for admin
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting (200 req/15min general, 10 login attempts/15min)
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ CORS configuration
- ✅ File upload type/size restrictions (images only, 5MB max)

---

## 🎨 Adding Your Logo & Images

1. **Logo:** Place `logo.png` in `frontend/public/images/`
2. **Hero background:** Place `hero-bg.jpg` in `frontend/public/images/`
3. **Product images:** Upload via Admin → Products → Add/Edit Product
4. The hero section auto-uses the logo and background image

---

## 📞 Support

For any questions or custom modifications, contact harshal patil.
