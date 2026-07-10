# E-Commerce Web Application

A full-stack e-commerce platform with a React frontend and a Django REST Framework backend. The system includes customer-facing shopping pages, secure checkout (M-Pesa and PayPal), user authentication, and an admin dashboard with sales analytics.

---

## Features

### Customer-Facing
- Home, Shop, and Category pages (Men, Women, Shoes, Accessories)
- Shopping cart and multi-step checkout
- Checkout via M-Pesa and PayPal
- User authentication (Login, Register, Forgot/Reset Password, OAuth callback)
- User profile and order history
- Product reviews
- Contact and newsletter subscription
- FAQs page
- Real-time notifications

### Admin Dashboard
- Sales, product, and customer analytics
- Product and category management (create, list, edit)
- Order management
- User management
- Contact messages and newsletter subscriber management
- Social accounts management
- Store settings
- Protected admin routes with dedicated admin login

---

## Tech Stack

### Frontend
- React (Create React App)
- Tailwind CSS
- React Router
- React Context API (Auth, App, Notifications)
- Axios (via `services/api.js`)
- Payment integrations: M-Pesa Daraja API, PayPal
- Webpack, Babel, Sass Loader
- Workbox (service worker / PWA support)

### Backend
- Django 4.2 with Django REST Framework 3.15
- Authentication: djangorestframework-simplejwt (JWT), django-allauth and dj-rest-auth (session/social authentication)
- API documentation: drf-yasg (Swagger / ReDoc)
- CORS handling: django-cors-headers
- Filtering: django-filter
- Image handling: Pillow
- Phone number validation: phonenumbers
- Environment configuration: python-decouple, python-dotenv
- Static file serving: WhiteNoise
- Production server: Gunicorn
- Database support: SQLite (default), with backend support present for PostgreSQL, MySQL, and Oracle

---

## Project Structure

### Frontend (`/frontend`)

```
Ecom/
├── public/                     # Static assets, HTML template, manifest, favicon
│
└── src/
    ├── App.js / App.css        # Root application component & global styles
    ├── index.js / index.css    # App entry point
    ├── products.js             # Product data/config
    ├── reportWebVitals.js      # Performance monitoring
    ├── setupTests.js           # Test configuration
    │
    ├── components/              # Reusable UI components
    │   ├── ConfirmModal.jsx
    │   ├── Footer.jsx
    │   ├── Navbar.jsx
    │   ├── ProductCard.jsx
    │   ├── ProtectedRoute.js    # Route guard for authenticated/admin routes
    │   ├── ScrollToTop.jsx
    │   ├── common/              # Shared/common UI elements
    │   └── Layout/              # App shell (AdminLayout, Sidebar, Topbar, Layout)
    │
    ├── constants/
    │   └── FaqsPage.jsx
    │
    ├── context/                 # Global state providers
    │   ├── AppContext.jsx
    │   ├── Authcontext.jsx
    │   └── NotificationContext.jsx
    │
    ├── Data/                    # Static/local data files
    │
    ├── pages/                   # Route-level pages
    │   ├── HomePage.jsx
    │   ├── ShopPage.jsx / ProductsPage.jsx / CategoryPage.jsx
    │   ├── MenPage.jsx / WomenPage.jsx / ShoesPage.jsx / AccessoriesPage.jsx
    │   ├── CartPage.jsx
    │   ├── CheckoutPage.jsx / CheckoutMpesaPage.jsx / CheckoutPaypalPage.jsx
    │   ├── OrderConfirmationPage.jsx / OrdersPage.jsx
    │   ├── LoginPage.jsx / RegisterPage.jsx / AuthCallback.jsx
    │   ├── ForgotPasswordPage.jsx / ResetPasswordPage.jsx
    │   ├── ProfilePage.jsx / ReviewPage.jsx
    │   ├── AboutPage.jsx / ContactPage.jsx
    │   │
    │   ├── admin/                # Admin dashboard pages
    │   │   ├── Adminlogin.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ProductList.jsx / CreateProduct.jsx / ProductCategories.jsx
    │   │   ├── Orders.jsx
    │   │   ├── Users.jsx
    │   │   ├── NewsletterPage.jsx / ContactMessagesPage.jsx
    │   │   ├── SocialAccountsPage.jsx
    │   │   └── Settings.jsx
    │   │
    │   └── analytics/             # Admin analytics pages
    │       ├── AnalyticsOverview.jsx
    │       ├── AnalyticsSales.jsx
    │       ├── AnalyticsProducts.jsx
    │       ├── AnalyticsCustomers.jsx
    │       └── analyticsUtils.jsx
    │
    ├── services/                 # API layer
    │   ├── api.js
    │   ├── index.js
    │   └── toast.js
    │
    └── Shared/                   # Shared feature components
        ├── Discounts.jsx
        ├── Notifications.jsx
        └── Reviews.jsx
```

### Backend (`/backend`)

Django project using Django REST Framework, with SQLite as the development database.

```
backend/
├── manage.py                   # Django management entrypoint
├── requirements.txt            # Python dependencies
├── runtime.txt                 # Python runtime version (for deployment platforms)
├── settings.py                 # Project settings
├── ecommerce_db.sqlite3        # Development database
├── media/                      # User-uploaded files (e.g. product images)
├── static/                     # Static assets
├── templates/                  # Django templates
│
├── ecommerce/                   # Django project package (urls.py, wsgi.py, asgi.py)
├── accounts/                    # User accounts, registration, profile
├── admin_app/                   # Custom admin dashboard functionality
├── products/                    # Product catalog and categories
├── orders/                      # Order management
├── payments/                    # M-Pesa / PayPal payment integration
├── token_blacklist/              # JWT token blacklist (djangorestframework-simplejwt)
│
└── venv/                         # Python virtual environment (excluded from version control)
```

Key installed packages:

| Package | Purpose |
|---|---|
| Django 4.2.21 | Core web framework |
| djangorestframework 3.15.2 | REST API framework |
| djangorestframework-simplejwt 5.3.1 | JWT authentication and token blacklisting |
| django-allauth 65.3.0 | Authentication, including social login |
| dj-rest-auth 7.0.1 | REST endpoints for registration, login, password reset |
| django-cors-headers 4.7.0 | Cross-origin request handling for the React frontend |
| django-filter 24.3 | Queryset filtering for API endpoints |
| drf-yasg 1.21.15 | Swagger/ReDoc API documentation |
| Pillow 11.2.1 | Image processing for product media uploads |
| phonenumbers 8.13.26 | Phone number parsing and validation |
| python-decouple 3.8 / python-dotenv 1.0.1 | Environment variable management |
| whitenoise 6.8.2 | Static file serving in production |
| gunicorn 23.0.0 | Production WSGI server |
| requests 2.32.3 | Outbound HTTP requests (M-Pesa / PayPal API calls) |
| PyJWT 2.10.1 | JWT token handling |

---

## Getting Started

### Frontend

**Prerequisites**
- Node.js (v16+ recommended)
- npm or yarn

**Installation**

```bash
cd frontend
npm install
```

**Environment Variables**

Create a `.env` file in the frontend root:

```env
REACT_APP_API_BASE_URL=
REACT_APP_MPESA_CONSUMER_KEY=
REACT_APP_MPESA_CONSUMER_SECRET=
REACT_APP_PAYPAL_CLIENT_ID=
```

> Update this list to match the actual variables consumed in `src/services/api.js` and the checkout pages.

**Available Scripts**

```bash
npm start        # Run the app in development mode (http://localhost:3000)
npm run build     # Build the app for production
npm test          # Run tests
```

### Backend

**Prerequisites**
- Python 3.10
- pip

**Installation**

```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Git Bash on Windows
pip install -r requirements.txt
```

**Environment Variables**

Create a `.env` file in the backend root (read via python-decouple / python-dotenv):

```env
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=
DATABASE_URL=
CORS_ALLOWED_ORIGINS=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

**Common Commands**

```bash
python manage.py migrate          # Apply database migrations
python manage.py createsuperuser  # Create an admin user
python manage.py runserver        # Run the development server
gunicorn ecommerce.wsgi:application  # Run with Gunicorn (production)
```

**API Documentation**

With drf-yasg installed, Swagger and ReDoc documentation are typically exposed at routes such as `/swagger/` and `/redoc/`, once configured in `ecommerce/urls.py`.

---

## Authentication & Route Protection

- Frontend: `context/Authcontext.jsx` manages login state and user session; `components/ProtectedRoute.js` guards customer and admin routes, redirecting unauthenticated users. Admin routes are additionally gated behind `pages/admin/Adminlogin.jsx`.
- Backend: JWT-based authentication via djangorestframework-simplejwt, with token blacklisting handled by the `token_blacklist` app. dj-rest-auth and django-allauth provide registration, login, password reset, and social authentication endpoints. User accounts are managed in the `accounts` app; custom admin dashboard functionality lives in `admin_app`.

---

## Payments

- M-Pesa checkout flow: frontend `pages/CheckoutMpesaPage.jsx`, backend `payments` app handling Daraja API requests via the `requests` library.
- PayPal checkout flow: frontend `pages/CheckoutPaypalPage.jsx`, backend `payments` app.
- Orders: backend `orders` app; frontend order history and confirmation via `OrderConfirmationPage.jsx`, `OrdersPage.jsx`.

---

## Products

- Backend `products` app handles the product catalog and categories, with media (product images) served from `media/` via Pillow-processed uploads.
- Frontend catalog pages: `ShopPage.jsx`, `ProductsPage.jsx`, `CategoryPage.jsx`, `MenPage.jsx`, `WomenPage.jsx`, `ShoesPage.jsx`, `AccessoriesPage.jsx`.

---

## Admin Analytics

The `pages/analytics/` module (frontend) provides dashboards for:
- Overall store performance (`AnalyticsOverview.jsx`)
- Sales trends (`AnalyticsSales.jsx`)
- Product performance (`AnalyticsProducts.jsx`)
- Customer insights (`AnalyticsCustomers.jsx`)

Backed by data from the `orders`, `products`, and `accounts` apps, surfaced through the `admin_app` app.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

---

## License
