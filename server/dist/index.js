"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
require("./passportConfig");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const user_1 = __importDefault(require("./models/user"));
require("./authMiddleware");
const mongoose_2 = require("mongoose");
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("./routes/index"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
mongoose_1.default.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;
main().catch((err) => console.log(err));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(mongoDB);
    });
}
const corsOptions = {
    origin: 'https://game-tracker-njphx5sq9-brdorads-projects.vercel.app',
    credentials: true,
    optionSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use((0, express_session_1.default)({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: connect_mongo_1.default.create({ mongoUrl: process.env.MONGO_URI })
}));
app.use(passport_1.default.session());
app.use("/", index_1.default);
app.post('/signup', [
    (0, express_validator_1.body)("username").isLength({ min: 4, max: 20 }).escape().withMessage("Username must be specified")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.findOne({ username: value });
        if (user) {
            throw new mongoose_2.Error("Username is already in use");
        }
    })).escape(),
    (0, express_validator_1.body)("password").isLength({ min: 8, max: 25 }).escape().withMessage("Password must be specified").isStrongPassword().withMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
    (0, express_validator_1.body)("confirm").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new mongoose_2.Error('Passwords do not match');
        }
        return true;
    }),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password, confirm } = req.body;
        try {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const newUser = new user_1.default({ username, password: hashedPassword, confirm });
            yield newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
]);
app.post('/login', (req, res, next) => {
    passport_1.default.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Your username or password are incorrect!' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, user });
    })(req, res, next);
});
app.get('/api/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}));
app.listen(3000, () => {
    console.log("up");
});
