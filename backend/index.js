
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const authRouter = require('./routes/auth.routes');
const employeesRouter = require('./routes/employees.routes');
const tasksRouter = require('./routes/tasks.routes');
const companiesRouter = require('./routes/companies.routes');
const sessionsRouter = require('./routes/sessions.routes');

const app = express();

// Глобальный логгер всех входящих HTTP-запросов для отладки
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// Используем cors middleware
app.use(cors(config.corsOptions));

// Добавляем обработку preflight запросов
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
            res.status(204).end();
            return;
        }
    }
    next();
});

// Добавляем обработку ошибок CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        console.error('CORS Error:', {
            origin: req.headers.origin,
            method: req.method,
            path: req.path
        });
        return res.status(403).json({
            error: 'CORS not allowed',
            origin: req.headers.origin
        });
    }
    next(err);
});

// Middleware для парсинга JSON и cookies
app.use(express.json());
app.use(cookieParser());

// Роуты
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/company', companiesRouter);
app.use('/api/sessions', sessionsRouter);

// Корневой маршрут для /api/
app.get('/api', (req, res) => {
    res.json({
        message: 'Employee Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            employees: '/api/employees',
            tasks: '/api/tasks',
            company: '/api/company',
            sessions: '/api/sessions'
        }
    });
});

app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
}); 