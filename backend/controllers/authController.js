const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB
        const newOTP = new OTP({ email, otp: otpCode });
        await newOTP.save();

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Registration OTP Code',
            html: `<p>Your OTP for registration is: <strong>${otpCode}</strong>. It will expire in 5 minutes.</p>`
        };

        // If email isn't configured, just log it for testing
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
            console.log(`[DEV MODE] OTP for ${email} is: ${otpCode}`);
            return res.status(200).json({ message: 'OTP stored. Check server console since email is not configured.', devOtp: otpCode });
        }

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email successfully' });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Server error while sending OTP' });
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, otp, role } = req.body;

        // Verify OTP
        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        // Find the most recent OTP for this email
        const otpRecords = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (otpRecords.length === 0 || otpRecords[0].otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Check if user already exists (again to be safe)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'external',
        });

        await newUser.save();

        // Delete used OTP
        await OTP.deleteMany({ email });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user existence
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const tokenSecret = process.env.JWT_SECRET || 'supersecretkey';
        const token = jwt.sign(
            { id: user._id },
            tokenSecret,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
