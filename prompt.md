Act as a Top-Tier Full-Stack Architect & Senior E-Commerce Developer.

PROJECT: "BazarBD" – An advanced, Bangladesh-focused e-commerce platform.
GOAL: Deliver a complete, runnable, production-structured codebase with zero placeholders.

🔧 TECHNICAL STACK & CONSTRAINTS
• Frontend: React 18 via CDN (UMD/ESM) + Babel Standalone for JSX + Tailwind CSS via CDN. No build tools (Vite/Webpack). Must run directly from a static HTML file.
• Backend: Laravel 11+ with SQLite. API-first architecture. Use Laravel Sanctum for SPA authentication (cookie-based). RESTful endpoints only.
• Database: SQLite (config via `.env`). Provide migrations, seeders, and model relationships.
• Deployment Target: Shared hosting or basic VPS. Keep dependencies minimal.

🇧🇩 BANGLADESH-SPECIFIC REQUIREMENTS
• Currency: BDT (৳) with proper formatting & locale.
• Payments: Cash on Delivery (default), simulated bKash & Nagad (UI + API stubs).
• Address: Division → District → Upazila dropdowns (provide JSON/static seed data).
• Phone: +880 validation, 10-digit local format enforcement.
• Tax: Configurable VAT (default 15%) + shipping calculation by district.
• Localization: English/Bengali toggle (hardcoded i18n JSON, no external packages).

⚙️ CORE FEATURES
1. Auth: Register, Login, Logout, Password Reset (Sanctum + email verification stub)
2. Catalog: Categories, Products (variants, stock, images via placeholder URLs), Search, Filters
3. Cart & Checkout: Persistent cart (localStorage → API sync), coupon support, address selection, order summary
4. Orders: User order history, admin order status management (pending → confirmed → shipped → delivered → cancelled)
5. Admin Dashboard (Basic): Product CRUD, order management, user list, sales summary
6. Security: CSRF, rate limiting, input validation, SQL injection/XSS prevention, secure cookie settings

📐 ARCHITECTURE & API DESIGN
• Laravel routes grouped under `/api/v1`
• Controllers: `AuthController`, `ProductController`, `CartController`, `OrderController`, `AdminController`
• Requests/FormRequests for validation
• API Resources for consistent JSON responses
• Error handling: standardized `{ success, message, data, errors }` format
• Pagination, sorting, filtering via query parameters

📦 DELIVERABLES & OUTPUT FORMAT
Respond EXACTLY in this structure:
1. 📁 Complete project file tree (Laravel backend + CDN frontend)
2. 🔑 Step-by-step setup commands (composer, npm not required, artisan, sqlite config)
3. 📄 FULL CODE for each critical file (no placeholders, no "..." truncation). Use markdown code blocks with language tags.
4. 🌐 Frontend: Single `index.html` with React CDN, Tailwind CDN, Babel standalone, and modular React components embedded.
5. 🗄️ Database: Migrations, seeders (categories, products, divisions/districts), model relationships.
6. 🔐 Auth flow: Sanctum config, CORS setup, CSRF token handling for CDN frontend.
7. 📝 API Contract: List all endpoints with method, payload, response schema.
8. 🇧🇩 Localization: i18n JSON for en/bn, currency formatting, phone validation logic.
9. ⚠️ Production Notes: CDN limitations, SQLite caveats, recommended upgrades for scale.

🚨 EXECUTION RULES
• NO placeholders like `// your code here` or `TODO`.
• All code must be functional, copy-paste ready, and syntactically correct.
• Follow Laravel 11 & React 18 best practices.
• Keep Tailwind utility usage efficient. Avoid heavy inline styles.
• Include comments only where logic is non-obvious.
• If any constraint conflicts with best practices, explicitly state the workaround used.

Begin. Output only the requested structure.
