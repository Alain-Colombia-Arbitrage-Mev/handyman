# Handyman Auction - Google Cloud Functions

A comprehensive serverless backend for the Handyman Auction mobile application built with Google Cloud Functions, TypeScript, and Firebase.

## 🏗️ Architecture Overview

This backend provides a complete serverless architecture with the following key components:

- **Authentication & Authorization** - JWT-based auth with role management
- **Payment Processing** - Stripe integration with webhook handling
- **Real-time Notifications** - FCM push notifications and email/SMS
- **Document Processing** - AI-powered document verification
- **Job Matching** - Intelligent handyman-job matching algorithms
- **Analytics & Reporting** - Business intelligence and KPIs
- **File Storage** - Secure document and image handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Google Cloud Project with billing enabled
- Firebase project configured

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository>
   cd google-functions
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

3. **Firebase Login**
   ```bash
   firebase login
   firebase use your-project-id
   ```

4. **Development Server**
   ```bash
   npm run serve
   # Functions will be available at http://localhost:5001
   ```

### Deployment

**Quick Deploy (All Functions)**
```bash
./deploy.sh
```

**Deploy Specific Functions**
```bash
./deploy.sh --functions auth,payments,notifications
```

**Deploy with Environment Setup**
```bash
./deploy.sh --setup-env
```

**Deploy Options**
```bash
./deploy.sh --help  # See all available options
```

## 📚 API Documentation

### Authentication Endpoints

Base URL: `https://REGION-PROJECT.cloudfunctions.net/auth`

#### POST `/register`
Register a new user account.

**Request:**
```typescript
{
  email: string;
  password: string;
  name: string;
  role: 'handyman' | 'client' | 'business';
  phone?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  categories?: string[];
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
  message: "User registered successfully";
  timestamp: number;
}
```

#### POST `/login`
Authenticate user and receive JWT tokens.

**Request:**
```typescript
{
  email: string;
  password: string;
  deviceInfo?: {
    deviceId: string;
    platform: string;
    version: string;
  };
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
  message: "Login successful";
  timestamp: number;
}
```

#### POST `/refresh`
Refresh JWT access token.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  timestamp: number;
}
```

### Payment Endpoints

Base URL: `https://REGION-PROJECT.cloudfunctions.net/payments`

#### POST `/create-intent`
Create a payment intent for job payment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```typescript
{
  jobId: string;
  amount: number; // in cents
  currency: string;
  paymentMethodId: string;
  metadata: {
    handymanId: string;
    clientId: string;
    jobTitle: string;
  };
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    clientSecret: string;
    status: PaymentStatus;
    // ... other payment details
  };
  timestamp: number;
}
```

#### POST `/webhook`
Stripe webhook endpoint for payment events.

**Headers:**
```
stripe-signature: <webhook_signature>
```

### Notification Endpoints

Base URL: `https://REGION-PROJECT.cloudfunctions.net/notifications`

#### POST `/push`
Send push notification to user.

**Headers:**
```
Authorization: Bearer <access_token>
X-API-Key: <service_api_key> // For service-to-service calls
```

**Request:**
```typescript
{
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Push notification sent successfully";
  timestamp: number;
}
```

## 🔧 Configuration

### Environment Variables

**Required:**
- `JWT_SECRET` - Secret for signing JWT access tokens
- `JWT_REFRESH_SECRET` - Secret for signing refresh tokens
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `CONVEX_URL` - Your Convex backend URL

**Payment Integration:**
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Communication:**
- `SENDGRID_API_KEY` - SendGrid API key for emails
- `TWILIO_ACCOUNT_SID` - Twilio account SID for SMS
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `FCM_SERVER_KEY` - Firebase Cloud Messaging server key

**External Services:**
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `REDIS_URL` - Redis connection URL for caching

### Firebase Configuration

Set environment variables in Firebase Functions:

```bash
firebase functions:config:set \
  jwt.secret="your-jwt-secret" \
  jwt.refresh_secret="your-refresh-secret" \
  stripe.secret_key="your-stripe-key"
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
```

### Local Development with Emulators
```bash
npm run serve
# This starts Firebase emulators for local development
```

## 📊 Monitoring & Logging

### Structured Logging

All functions use structured JSON logging with correlation IDs:

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('FunctionName');

// Automatic correlation ID and user context
logger.info('Operation completed', { userId, operationType });
logger.error('Operation failed', error, { userId, operationType });
```

### Error Tracking

- Comprehensive error handling with custom error types
- Automatic error logging with context
- Integration with external monitoring services

### Performance Monitoring

```typescript
logger.time('operation-name');
// ... perform operation
logger.timeEnd('operation-name');

logger.logRequest(method, path, statusCode, duration, metadata);
logger.logDatabaseOperation(operation, collection, duration, metadata);
logger.logExternalService(service, operation, duration, success, metadata);
```

## 🔐 Security

### Authentication & Authorization

- JWT tokens with configurable expiration
- Role-based access control (RBAC)
- Resource ownership validation
- Rate limiting per endpoint
- API key authentication for service-to-service calls

### Data Protection

- Input validation using Joi schemas
- SQL injection prevention
- XSS protection with helmet
- CORS configuration
- Encrypted storage for sensitive data

### Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📈 Performance Optimization

### Cold Start Optimization

- Minimal dependencies in critical functions
- Connection pooling for database connections
- Lazy loading of heavy dependencies
- Keep-warm strategies for critical endpoints

### Caching Strategy

- Redis-based caching for frequently accessed data
- Response caching with appropriate cache headers
- Database query optimization
- CDN integration for static assets

### Resource Management

```yaml
# Function configuration
Runtime: Node.js 18
Memory: 256MB (default), 512MB (processing), 1GB (reports)
Timeout: 60s (default), 300s (long-running tasks)
Concurrency: 100 (default), 1 (sequential processing)
```

## 🚀 Deployment Strategies

### Environment Management

- **Development**: Local emulators with test data
- **Staging**: Production-like environment for testing
- **Production**: Multi-region deployment for reliability

### CI/CD Pipeline

1. **Code Review** - GitHub pull requests with approval
2. **Automated Testing** - Unit and integration tests
3. **Security Scanning** - SAST tools for vulnerability detection
4. **Build & Deploy** - Automated deployment with rollback capability
5. **Post-Deploy Verification** - Health checks and smoke tests

### Deployment Commands

```bash
# Deploy to staging
./deploy.sh --env staging --project handyman-staging

# Deploy specific functions to production
./deploy.sh --functions auth,payments --env production

# Quick deployment with tests skipped (emergency fixes)
./deploy.sh --skip-tests --skip-lint
```

## 🔍 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clean and rebuild
rm -rf node_modules lib
npm install
npm run build
```

**Permission Errors:**
```bash
# Check Firebase authentication
firebase login --reauth

# Verify project permissions
firebase projects:list
```

**Environment Variable Issues:**
```bash
# Check current Firebase config
firebase functions:config:get

# Set missing variables
firebase functions:config:set key=value
```

### Debugging

**Local Development:**
```bash
# Start with debugging
npm run serve -- --inspect

# View logs
firebase functions:log
```

**Production Issues:**
```bash
# View live logs
firebase functions:log --limit 50

# Monitor specific function
firebase functions:log --only functionName
```

### Health Checks

Monitor function health with built-in endpoints:

```bash
# Health check endpoint
curl https://REGION-PROJECT.cloudfunctions.net/healthCheck

# Function-specific health
curl https://REGION-PROJECT.cloudfunctions.net/auth/health
```

## 📝 Contributing

### Code Standards

- **TypeScript**: Strict mode with comprehensive types
- **Linting**: ESLint with Airbnb configuration
- **Testing**: Jest with minimum 80% coverage
- **Documentation**: JSDoc comments for all functions

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests locally
4. Submit pull request with description
5. Code review and approval required
6. Automated deployment to staging
7. Manual promotion to production

### Commit Message Format

```
type(scope): description

feat(auth): add password reset functionality
fix(payments): resolve stripe webhook validation
docs(readme): update deployment instructions
```

## 📞 Support

### Documentation
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Getting Help
- Create an issue in the repository
- Contact the development team
- Check existing documentation and logs first

### Monitoring & Alerts

Production monitoring includes:
- Error rate alerts (> 5% error rate)
- Latency alerts (> 2s response time)
- Memory usage alerts (> 80% utilization)
- Failed deployment notifications
- Security event alerts

---

## 📊 Function Overview

| Function Category | Functions | Purpose |
|------------------|-----------|---------|
| **Authentication** | `auth*` | User registration, login, JWT management |
| **Payments** | `payment*` | Stripe integration, webhooks, payouts |
| **Notifications** | `notification*` | Push, email, SMS notifications |
| **Documents** | `document*` | File processing, verification |
| **Jobs** | `job*` | Job matching, search, analytics |
| **Analytics** | `analytics*` | Business metrics, reports, KPIs |
| **Maintenance** | `*Cleanup`, `healthCheck` | System maintenance, monitoring |
| **Integrations** | `maps*`, `social*` | External service integrations |

Built with ❤️ by the Handyman Auction Development Team