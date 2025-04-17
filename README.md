# PhishGuard - Phishing Awareness Simulation Platform

PhishGuard is a comprehensive phishing awareness simulation platform designed to help organizations strengthen their security posture through effective employee training. This platform enables security teams to run simulated phishing campaigns, track user interactions, and provide educational resources to improve security awareness.

![PhishGuard Dashboard](https://via.placeholder.com/800x450?text=PhishGuard+Dashboard)

## Features

- **Campaign Management**: Create, configure, and schedule phishing simulation campaigns
- **Email Templates**: Design and manage customizable phishing email templates
- **Target Management**: Organize targets into groups for targeted simulations
- **Interaction Tracking**: Monitor email opens, link clicks, and credential submissions
- **Analytics Dashboard**: View comprehensive metrics and reports on campaign effectiveness
- **Educational Resources**: Redirect users to educational content after phishing simulations

 

## Installation and Setup

 

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/phishguard.git
   cd phishguard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=5000
   
   # Authentication
   JWT_SECRET=your-secret-key
   
   # Email Configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-email-password
   SMTP_FROM=phishguard@example.com
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application:
   Open your browser and navigate to `http://localhost:5000`

## Default Login Credentials

- **Username**: admin
- **Password**: admin123

---
---
![image](https://github.com/user-attachments/assets/1d90758a-6525-4a9f-b9bf-42f2eb973c1b)



*Note: Change these credentials immediately after first login for security purposes.*

## Project Structure

```
phishguard/
├── client/              # Frontend code
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layouts/     # Page layouts
│   │   ├── lib/         # Utility functions
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   └── types/       # TypeScript type definitions
├── server/              # Backend code
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage layer
│   └── vite.ts          # Vite server configuration
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema and types
└── public/              # Static assets
```

## API Endpoints

- **Authentication**
  - `POST /api/auth/login` - Authenticate a user

- **Campaigns**
  - `GET /api/campaigns` - Get all campaigns
  - `GET /api/campaigns/:id` - Get a specific campaign
  - `POST /api/campaigns` - Create a new campaign
  - `PUT /api/campaigns/:id` - Update a campaign
  - `DELETE /api/campaigns/:id` - Delete a campaign

- **Templates**
  - `GET /api/templates` - Get all templates
  - `GET /api/templates/:id` - Get a specific template
  - `POST /api/templates` - Create a new template
  - `PUT /api/templates/:id` - Update a template
  - `DELETE /api/templates/:id` - Delete a template

- **Target Groups**
  - `GET /api/target-groups` - Get all target groups
  - `GET /api/target-groups/:id` - Get a specific target group
  - `POST /api/target-groups` - Create a new target group
  - `PUT /api/target-groups/:id` - Update a target group
  - `DELETE /api/target-groups/:id` - Delete a target group

- **Phishing Simulation**
  - `GET /api/track/:interactionId` - Track email opens
  - `GET /api/phish/:interactionId` - Simulate phishing link clicks
  - `POST /api/capture/:interactionId` - Capture credentials

## License

This project is licensed under the MIT License - see the LICENSE file for details.
