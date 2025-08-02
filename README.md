# Admin Panel

A comprehensive admin panel built with Refine and React for managing users, organizations, and agents. This application integrates with a backend API to provide full CRUD operations.

## Features

### 🔐 Authentication
- JWT-based authentication
- Secure login/logout functionality
- Token management and validation
- Protected routes

### 👥 User Management
- List all users with pagination and filtering
- Create new users with validation
- Edit existing user information
- View user details
- Delete users
- Active/inactive status management

### 🏢 Organization Management
- List all organizations with pagination and filtering
- Create new organizations
- Edit organization details
- View organization information
- Delete organizations
- Hierarchical organization structure support
- Active/inactive status management

### 🤖 Agent Management
- List all agents with pagination and filtering
- Create new agents with detailed configuration
- Edit agent settings and details
- View comprehensive agent information
- Delete agents
- Agent interaction mode configuration (chat, voice, text)
- System prompt and first message configuration
- Organization association

### 📊 Dashboard
- Overview of system statistics
- Quick access to main features
- Visual representation of data
- Quick action buttons

## Technology Stack

- **Frontend**: React 18, TypeScript
- **UI Framework**: Material-UI (MUI)
- **Admin Framework**: Refine
- **Routing**: React Router
- **State Management**: React Query (via Refine)
- **Authentication**: JWT tokens
- **Data Grid**: MUI Data Grid
- **Forms**: React Hook Form

## Backend API Integration

The admin panel integrates with a RESTful API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User authentication

### Users
- `GET /api/users` - List users with pagination and filtering
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Organizations
- `GET /api/organizations` - List organizations with pagination and filtering
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Agents
- `GET /api/agents` - List agents with pagination and filtering
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3003`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Environment Configuration

The application is configured to connect to the backend API at `http://localhost:3003`. If your backend is running on a different URL, update the `API_BASE_URL` constant in the following files:

- `src/authProvider.ts`
- `src/dataProvider.ts`

## Usage

### Login
1. Navigate to the login page
2. Enter your email and password
3. Click "Sign In" to authenticate

### Managing Users
1. Navigate to "Users" from the sidebar
2. View the list of all users
3. Use the "Create User" button to add new users
4. Click on user rows to view details, edit, or delete

### Managing Organizations
1. Navigate to "Organizations" from the sidebar
2. View the list of all organizations
3. Use the "Create Organization" button to add new organizations
4. Click on organization rows to view details, edit, or delete

### Managing Agents
1. Navigate to "Agents" from the sidebar
2. View the list of all agents
3. Use the "Create Agent" button to add new agents
4. Configure agent details including interaction mode, system prompts, and first messages
5. Click on agent rows to view details, edit, or delete

## Features

### Data Grid Features
- Server-side pagination
- Column sorting
- Row selection
- Bulk actions
- Export functionality
- Responsive design

### Form Validation
- Required field validation
- Email format validation
- Password strength requirements
- Custom validation rules

### Error Handling
- Network error handling
- API error messages
- User-friendly error displays
- Automatic token refresh

### Security
- JWT token authentication
- Secure token storage
- Automatic token validation
- Protected routes

## Development

### Project Structure
```
src/
├── components/          # Reusable components
├── contexts/           # React contexts
├── pages/             # Page components
│   ├── users/         # User management pages
│   ├── organizations/ # Organization management pages
│   ├── agents/        # Agent management pages
│   └── dashboard/     # Dashboard page
├── authProvider.ts    # Authentication provider
├── dataProvider.ts    # Data provider for API integration
└── App.tsx           # Main application component
```

### Adding New Features

1. **New Resource**: Add a new resource to the `resources` array in `App.tsx`
2. **New Pages**: Create new page components in the appropriate directory
3. **API Integration**: Update the data provider to handle new endpoints
4. **Authentication**: Update the auth provider if needed

### Customization

- **Theme**: Modify the Material-UI theme in `contexts/color-mode`
- **Layout**: Customize the layout in `components/header` and `ThemedLayoutV2`
- **Styling**: Update component styles using MUI's `sx` prop or styled components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
