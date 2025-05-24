# AgriConnect Kenya

AgriConnect is a web application that connects Kenyan farmers with buyers, providing real-time market prices, analytics, and direct communication channels.

## Features

### 1. User Authentication
- Email/Password registration and login
- Password reset functionality
- Secure user sessions
- Profile management

### 2. Dashboard
- Quick action buttons:
  - Add New Product
  - Set Price Alert
  - Market Analysis
  - Find Buyers
- Quick stats:
  - Products Listed
  - New Messages
  - Profile Views
- Latest market prices
- Recent messages

### 3. Market Analysis
- Real-time price trends
- Supply vs demand analysis
- Regional price comparison
- Market share visualization
- Time-range filtering
- Product-specific insights

### 4. Price Alerts
- Set custom price alerts
- Multiple notification methods:
  - Email
  - SMS
- Alert conditions:
  - Price above threshold
  - Price below threshold
- Active alerts management

### 5. Connect with Buyers
- Buyer search and filtering
- Verified buyer profiles
- Direct messaging system
- Product interest matching
- Transport arrangement info

### 6. Product Management
- Add new products
- Upload product images
- Set pricing
- Manage inventory
- Product categorization

## Technology Stack

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Chart.js for data visualization
  - Font Awesome icons

- Backend:
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
  - Firebase Analytics

## Project Structure

```
agriconnect/
├── css/
│   ├── style.css
│   ├── dashboard.css
│   ├── features.css
│   ├── buyer-contact.css
│   └── buyer-profile.css
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── market-analysis.js
│   ├── price-alerts.js
│   └── connect.js
├── index.html
├── dashboard.html
├── market-analysis.html
├── price-alerts.html
├── connect.html
├── add-product.html
└── various other HTML files
```

## Security Features

### Firebase Security Rules

#### Firestore Rules
- Authentication required for data access
- User-specific data protection
- Secure CRUD operations
- Data validation

#### Storage Rules
- Image upload restrictions
- File size limits
- File type validation
- User-specific storage access

### API Security
- API key restrictions
- Domain whitelisting
- Rate limiting
- CORS policies

## Setup Instructions

1. Clone the repository
2. Create a Firebase project
3. Configure Firebase:
   - Enable Authentication
   - Set up Firestore
   - Configure Storage
4. Create .env file with Firebase configuration
5. Deploy Firebase security rules
6. Set up API restrictions

## Environment Variables

Required environment variables in .env file:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Security Best Practices

1. Never commit sensitive information
2. Use environment variables
3. Implement proper authentication
4. Set up Firebase Security Rules
5. Restrict API access
6. Regular security audits

## Development Guidelines

1. Code Style
   - Use consistent indentation
   - Follow naming conventions
   - Comment complex logic
   - Keep functions focused

2. Git Workflow
   - Use feature branches
   - Write descriptive commits
   - Review before merging
   - Keep .gitignore updated

3. Testing
   - Test authentication flows
   - Validate form inputs
   - Check file uploads
   - Verify data security

## Deployment

1. Set up hosting (Firebase Hosting recommended)
2. Configure custom domain
3. Set up SSL certificate
4. Deploy security rules
5. Monitor analytics

## Maintenance

1. Regular updates
   - Security patches
   - Dependency updates
   - Feature improvements
   - Bug fixes

2. Monitoring
   - Error tracking
   - Usage analytics
   - Performance metrics
   - Security alerts

## Support

For support, contact:
- Email: info@agriconnect.co.ke
- Phone: +254 713332171

## License

Copyright © 2024 AgriConnect Kenya. All rights reserved.