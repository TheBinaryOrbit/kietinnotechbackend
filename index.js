import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';

// Import routes
import authRoutes from './router/auth.js';
import userRoutes from './router/user.js';
import teamRoutes from './router/team.js';
import generalRoutes from './router/general.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: "*",
    credentials: true
}));

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

if (ENV === 'development') {
    app.use(morgan('dev'));
}


app.get('/', (req, res)=>{
    res.send('Welcome to the Innotech Backend API');
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/team', teamRoutes);
app.use('/api', generalRoutes);

// Health Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' , timestamp: new Date().toISOString() });
});




// not found route
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});


app.listen(PORT, () => {
    console.log(`Server is running in ${ENV} mode on port ${PORT}`);
});

export default app;