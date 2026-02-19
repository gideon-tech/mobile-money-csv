# MoMo2CSV Development Plan
## **Feature-by-Feature Implementation Guide**

### **🎯 Current Status: Week 1 MVP ✅**
- [x] MTN & Airtel parsers built
- [x] PDF processing engine  
- [x] CSV generation
- [x] Landing page UI
- [x] Server running successfully

---

## **📋 DEVELOPMENT ROADMAP**

### **PHASE 1: Core Upload System (Week 2)**

#### **Feature 1.1: File Upload Interface**
**Goal**: Allow users to drag & drop PDF files

**Technical Specs:**
```typescript
// Components needed:
- FileUploadZone.tsx (drag & drop)
- FileValidator.ts (PDF validation)
- UploadProgress.tsx (upload feedback)

// API endpoints:
POST /api/upload - Handle file upload
GET /api/upload/[id] - Check upload status

// Database schema:
uploads {
  id: string (UUID)
  filename: string
  filesize: number
  mimetype: string
  uploadedAt: datetime
  userId?: string (null for anonymous)
  status: 'uploading' | 'processing' | 'completed' | 'error'
  errorMessage?: string
}
```

**Implementation Steps:**
1. Create upload component with react-dropzone
2. Add file validation (PDF only, max 10MB)
3. Implement progress tracking
4. Store uploaded files temporarily
5. Add error handling & user feedback

**Acceptance Criteria:**
- ✅ Drag & drop PDFs works
- ✅ File validation shows clear errors
- ✅ Upload progress displays
- ✅ Only PDF files accepted
- ✅ File size limits enforced

---

#### **Feature 1.2: PDF Processing Pipeline**
**Goal**: Process uploaded PDF and show preview

**Technical Specs:**
```typescript
// Processing workflow:
1. Upload PDF → Temporary storage
2. Extract text using pdf-parse
3. Auto-detect provider (MTN/Airtel)
4. Parse transactions
5. Generate preview table
6. Store parsed data

// API endpoints:
POST /api/process/[uploadId] - Start processing
GET /api/process/[uploadId]/status - Check progress
GET /api/process/[uploadId]/preview - Get parsed data preview

// Database schema:
parsed_statements {
  id: string (UUID)
  uploadId: string (FK)
  provider: 'MTN' | 'Airtel'
  accountNumber: string
  periodFrom: date
  periodTo: date
  openingBalance: decimal
  closingBalance: decimal
  totalTransactions: number
  parsedAt: datetime
  rawText: text (for debugging)
}

transactions {
  id: string (UUID)
  statementId: string (FK)
  date: date
  time: time
  type: string
  description: text
  amount: decimal
  balance: decimal
  counterParty?: string
  reference: string
  provider: 'MTN' | 'Airtel'
}
```

**Implementation Steps:**
1. Create processing queue system
2. Integrate PDF processor with parsers
3. Build preview component showing transactions
4. Add error handling for parsing failures
5. Store parsed data in database

**Acceptance Criteria:**
- ✅ PDF uploads process automatically
- ✅ MTN & Airtel statements detected correctly
- ✅ Transaction preview displays properly
- ✅ Error messages for unsupported formats
- ✅ Processing status updates in real-time

---

#### **Feature 1.3: CSV Download System**
**Goal**: Generate and download clean CSV files

**Technical Specs:**
```typescript
// CSV generation:
- Standard format for all providers
- Proper escaping for descriptions
- Consistent date/time formatting
- Clean column headers

// API endpoints:
GET /api/download/[statementId]/csv - Download CSV
GET /api/download/[statementId]/summary - Download summary report

// CSV format:
Date,Time,Type,Description,Amount,Balance,Counter Party,Reference,Provider
01/02/2024,09:15:30,Send,"Send Money to 256702345678",50000.00,100000.00,256702345678,MM2402010001,MTN
```

**Implementation Steps:**
1. Build CSV formatter with proper escaping
2. Create download endpoint with streaming
3. Add summary report generation
4. Implement file cleanup after download
5. Add download tracking

**Acceptance Criteria:**
- ✅ CSV downloads immediately
- ✅ Proper formatting for Excel compatibility
- ✅ All transaction data included
- ✅ Files clean up automatically
- ✅ Download tracking works

---

### **PHASE 2: User System & Freemium (Week 3)**

#### **Feature 2.1: User Authentication**
**Goal**: User registration, login, and session management

**Technical Specs:**
```typescript
// Using NextAuth.js + Prisma
// Database schema:
users {
  id: string (UUID)
  email: string (unique)
  name?: string
  emailVerified?: datetime
  image?: string
  createdAt: datetime
  updatedAt: datetime
  plan: 'free' | 'pro'
  subscriptionId?: string
  subscriptionStatus?: string
}

accounts {
  // NextAuth.js standard schema
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  // ... other OAuth fields
}

// Components needed:
- LoginForm.tsx
- SignupForm.tsx  
- UserProfile.tsx
- ProtectedRoute.tsx
```

**Implementation Steps:**
1. Set up NextAuth.js with email provider
2. Create user database schema with Prisma
3. Build login/signup forms
4. Add email verification
5. Implement protected routes

**Acceptance Criteria:**
- ✅ Users can register with email
- ✅ Login/logout works correctly
- ✅ Email verification required
- ✅ Session persistence works
- ✅ Protected routes redirect properly

---

#### **Feature 2.2: Usage Tracking System**
**Goal**: Track conversions and enforce free tier limits

**Technical Specs:**
```typescript
// Database schema:
usage_records {
  id: string (UUID)
  userId: string (FK)
  uploadId: string (FK)
  action: 'conversion' | 'download'
  createdAt: datetime
  plan: 'free' | 'pro'
}

// Limits configuration:
FREE_TIER_LIMITS = {
  conversionsPerMonth: 5,
  maxFileSize: 10 * 1024 * 1024, // 10MB
}

PRO_TIER_LIMITS = {
  conversionsPerMonth: -1, // unlimited
  maxFileSize: 50 * 1024 * 1024, // 50MB
  bulkUpload: true,
  customTemplates: true,
}
```

**Implementation Steps:**
1. Create usage tracking middleware
2. Implement monthly usage calculations
3. Add limit enforcement to upload/process
4. Build usage dashboard for users
5. Add upgrade prompts at limits

**Acceptance Criteria:**
- ✅ Usage counts correctly per month
- ✅ Free users blocked after 5 conversions
- ✅ Clear usage display in dashboard
- ✅ Upgrade prompts at appropriate times
- ✅ Pro users have unlimited access

---

#### **Feature 2.3: User Dashboard**
**Goal**: Show usage, history, and account management

**Technical Specs:**
```typescript
// Dashboard components:
- UsageOverview.tsx (current month stats)
- ConversionHistory.tsx (past conversions)
- AccountSettings.tsx (profile management)
- BillingInfo.tsx (subscription details)

// API endpoints:
GET /api/user/usage - Current usage stats
GET /api/user/history - Conversion history
PUT /api/user/profile - Update profile
GET /api/user/billing - Billing information
```

**Implementation Steps:**
1. Create dashboard layout
2. Build usage overview with charts
3. Add conversion history table
4. Implement account settings
5. Add export functionality for history

**Acceptance Criteria:**
- ✅ Usage clearly displayed with limits
- ✅ Conversion history shows all past uploads
- ✅ Account settings work correctly
- ✅ Mobile responsive design
- ✅ Fast loading performance

---

### **PHASE 3: Payment System (Week 4)**

#### **Feature 3.1: Stripe Integration**
**Goal**: Process Pro subscriptions and payments

**Technical Specs:**
```typescript
// Stripe integration:
- Product: "MoMo2CSV Pro" - $25/month
- Customer portal for billing management
- Webhook handling for subscription events

// Database schema:
subscriptions {
  id: string (UUID)
  userId: string (FK)
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodStart: datetime
  currentPeriodEnd: datetime
  createdAt: datetime
  canceledAt?: datetime
}

// Environment variables needed:
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Implementation Steps:**
1. Set up Stripe account and products
2. Create subscription endpoints
3. Implement payment flow
4. Add webhook handlers
5. Build customer portal integration

**Acceptance Criteria:**
- ✅ Users can upgrade to Pro
- ✅ Payments process correctly
- ✅ Subscription status updates
- ✅ Billing portal works
- ✅ Webhooks handle all events

---

#### **Feature 3.2: Pro Features**
**Goal**: Advanced features for paid subscribers

**Technical Specs:**
```typescript
// Pro-only features:
1. Bulk upload (multiple PDFs)
2. Custom CSV templates
3. Advanced categorization
4. Priority processing
5. Extended file retention

// Implementation:
- BulkUploader.tsx component
- CSVTemplateBuilder.tsx
- CategoryMapper.tsx
- PriorityQueue for processing
```

**Implementation Steps:**
1. Build bulk upload interface
2. Create CSV template system
3. Add advanced categorization
4. Implement priority processing
5. Extended file storage for Pro users

**Acceptance Criteria:**
- ✅ Bulk upload works for Pro users
- ✅ Custom templates generate correctly
- ✅ Advanced categorization accurate
- ✅ Pro users get priority processing
- ✅ Features locked for free users

---

### **PHASE 4: Launch & Polish (Week 5)**

#### **Feature 4.1: Error Handling & Monitoring**
**Technical Specs:**
```typescript
// Error tracking:
- Sentry for error monitoring
- Custom error boundaries
- User-friendly error messages
- Admin notification system

// Performance monitoring:
- Page load times
- API response times
- File processing times
- User journey analytics
```

#### **Feature 4.2: Mobile Optimization**
**Technical Specs:**
```typescript
// Mobile considerations:
- Touch-friendly upload interface
- Mobile-optimized tables
- Progressive Web App (PWA) features
- Offline capability for downloaded CSVs
```

---

## **🛠️ TECHNICAL REQUIREMENTS**

### **Environment Setup:**
```bash
# Database
POSTGRES_URL="postgresql://..."

# Authentication  
NEXTAUTH_SECRET="random-secret"
NEXTAUTH_URL="http://localhost:3000"

# File Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_BUCKET_NAME="momo2csv-uploads"

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring
SENTRY_DSN="https://..."
```

### **Database Schema (Complete):**
```sql
-- Run this migration after Phase 2
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email_verified TIMESTAMP,
  image VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free',
  subscription_id VARCHAR(255),
  subscription_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  filesize INTEGER NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'uploading',
  error_message TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE parsed_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES uploads(id),
  provider VARCHAR(10) NOT NULL,
  account_number VARCHAR(20),
  period_from DATE,
  period_to DATE,
  opening_balance DECIMAL(15,2),
  closing_balance DECIMAL(15,2),
  total_transactions INTEGER,
  raw_text TEXT,
  parsed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID REFERENCES parsed_statements(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  counter_party VARCHAR(20),
  reference VARCHAR(50) NOT NULL,
  provider VARCHAR(10) NOT NULL
);

CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  upload_id UUID REFERENCES uploads(id),
  action VARCHAR(20) NOT NULL,
  plan VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  canceled_at TIMESTAMP
);
```

---

## **🚀 DEVELOPMENT WORKFLOW**

### **For Each Feature:**
1. **Spec Review** - Confirm requirements
2. **Implementation** - Build feature step by step  
3. **Testing** - Manual + automated tests
4. **Integration** - Ensure works with existing features
5. **Deployment** - Deploy to staging → production

### **Ready to start with Feature 1.1 (File Upload)?**

I can provide detailed implementation code for the file upload interface. Which feature would you like to tackle first? ⚡