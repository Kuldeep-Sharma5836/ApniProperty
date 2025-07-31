# 🏡 Real Estate Marketplace

A full-featured Real Estate Web Application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring Google Authentication, property management, and advanced search functionality.

## ✨ Features

### 👤 User Authentication
- **Google OAuth 2.0** integration using Passport.js
- **JWT-based** session handling
- **Role management**: Buyer / Seller / Admin
- **Secure password** hashing with bcrypt
- **Profile management** with avatar support

### 🏘️ Property Management
- **Add new properties** with comprehensive details
- **Edit/Delete properties** (owner only)
- **Image upload** with Cloudinary integration
- **Property search** with advanced filtering
- **Property details** with image galleries
- **Favorite properties** functionality

### 💼 Buy/Sell Functionality
- **Property listings** for sale and rent
- **Contact seller** information
- **Property status** tracking
- **View tracking** and analytics
- **Featured properties** highlighting

### 🔍 Advanced Search & Filtering
- **Text search** across titles and descriptions
- **Price range** filtering
- **Property type** filtering
- **Location-based** search
- **Bedrooms/Bathrooms** filtering
- **Listing type** (sale/rent) filtering

### 📱 Responsive Design
- **Mobile-first** responsive design
- **Modern UI** with TailwindCSS
- **Smooth animations** with Framer Motion
- **Accessible** components
- **Cross-browser** compatibility

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching
- **TailwindCSS** - Styling framework
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **Framer Motion** - Animations

### Development Tools
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google OAuth credentials
- Cloudinary account (optional, for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**

   **Backend (.env file in backend directory)**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/real-estate-marketplace

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Cloudinary Configuration (optional)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers concurrently.

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### MongoDB Setup
1. **Local MongoDB**: Install and start MongoDB service
2. **MongoDB Atlas**: Create a free cluster and get connection string
3. Update `MONGODB_URI` in your `.env` file

### Cloudinary Setup (Optional)
1. Create a [Cloudinary account](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

## 📁 Project Structure

```
real-estate-marketplace/
├── backend/
│   ├── config/
│   │   └── passport.js          # Google OAuth configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── upload.js            # File upload middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Property.js          # Property model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── properties.js        # Property routes
│   │   └── users.js             # User routes
│   ├── utils/
│   │   └── generateToken.js     # JWT token generation
│   ├── uploads/                 # Uploaded files directory
│   ├── server.js                # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/            # Authentication components
│   │   │   ├── Layout/          # Layout components
│   │   │   ├── Properties/      # Property components
│   │   │   ├── Search/          # Search components
│   │   │   └── UI/              # Reusable UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── Auth/            # Authentication pages
│   │   │   ├── Dashboard/       # Dashboard pages
│   │   │   └── Home.js          # Home page
│   │   ├── services/
│   │   │   └── api.js           # API service
│   │   ├── App.js               # Main app component
│   │   ├── index.js             # App entry point
│   │   └── index.css            # Global styles
│   ├── tailwind.config.js       # TailwindCSS configuration
│   └── package.json
├── package.json                 # Root package.json
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate-marketplace
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Property Endpoints
- `GET /api/properties` - Get all properties (with filtering)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/favorite` - Toggle favorite

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/role` - Change user role

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/real-estate-marketplace/issues) page
2. Create a new issue with detailed information
3. Contact: your-email@example.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Passport.js](http://www.passportjs.org/) - Authentication
- [React Query](https://react-query.tanstack.com/) - Data fetching

---

**Happy coding! 🚀** 