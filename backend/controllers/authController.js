const User = require('../models/User');
const Community = require('../models/Community');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER || process.env.EMAIL;
const emailPass = process.env.EMAIL_PASS;

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    auth: {
        user: emailUser,
        pass: emailPass
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
            from: emailUser,
            to: email,
            subject: 'Your Registration OTP Code',
            html: `<p>Your OTP for registration is: <strong>${otpCode}</strong>. It will expire in 5 minutes.</p>`
        };

        // If email isn't configured, just log it for testing
        if (!emailUser || emailUser === 'your_email@gmail.com') {
            console.log(`[DEV MODE] OTP for ${email} is: ${otpCode}`);
            return res.status(200).json({ message: 'OTP stored. Check server console since email is not configured.', devOtp: otpCode });
        }

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'OTP sent to email successfully' });
        } catch (mailError) {
            // In local/dev environments, keep signup flow working even when SMTP is misconfigured.
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Email delivery failed. Falling back to dev OTP output:', mailError.message);
                console.log(`[DEV MODE] OTP for ${email} is: ${otpCode}`);
                return res.status(200).json({
                    message: 'OTP stored. Email sending failed, so OTP is returned for development use.',
                    devOtp: otpCode,
                });
            }
            throw mailError;
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Server error while sending OTP' });
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, username, email, password, otp, role, itNumber, communityName, communityDescription, communityCategory, requestedCommunity } = req.body;
        const cleanedItNumber = typeof itNumber === 'string' && itNumber.trim() ? itNumber.trim() : undefined;
        const cleanedCommunityName = typeof communityName === 'string' && communityName.trim() ? communityName.trim() : undefined;
        const cleanedCommunityDescription = typeof communityDescription === 'string' && communityDescription.trim() ? communityDescription.trim() : undefined;
        const cleanedCommunityCategory = typeof communityCategory === 'string' && communityCategory.trim() ? communityCategory.trim() : undefined;

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

        if (role === 'student' && !cleanedItNumber) {
            return res.status(400).json({ message: 'IT number is required for student registration' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'external';
        // Admins and external users are auto-approved; others need approval
        const userStatus = (userRole === 'admin' || userRole === 'external') ? 'approved' : 'pending';

        // Create new user
        const newUser = new User({
            name: name || username,
            email,
            password: hashedPassword,
            role: userRole,
            status: userStatus,
            ...(cleanedItNumber ? { itNumber: cleanedItNumber } : {}),
            ...(cleanedCommunityName ? { communityName: cleanedCommunityName } : {}),
            ...(cleanedCommunityDescription ? { communityDescription: cleanedCommunityDescription } : {}),
            ...(cleanedCommunityCategory ? { communityCategory: cleanedCommunityCategory } : {}),
            ...(userRole === 'student' && requestedCommunity ? { requestedCommunity } : {}),
        });

        await newUser.save();

        // If community admin, create a pending Community document immediately
        if (userRole === 'community_admin' && cleanedCommunityName) {
            const community = await Community.create({
                name: cleanedCommunityName,
                description: cleanedCommunityDescription || 'Community pending description update',
                category: cleanedCommunityCategory || 'Other',
                admin: newUser._id,
                status: 'pending',
            });
            // Link the user to their community right away
            await User.findByIdAndUpdate(newUser._id, { managedCommunity: community._id });
        }

        // Delete used OTP
        await OTP.deleteMany({ email });

        const message = userStatus === 'pending'
            ? 'Registration submitted! Your account is pending admin approval.'
            : 'User registered successfully';

        res.status(201).json({ message });
    } catch (error) {
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ message: `${duplicateField} already exists` });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current logged-in user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('managedCommunity', 'name status')
            .lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user existence — use lean() so Mongoose does NOT apply schema defaults
        // to old documents missing the `status` field (avoids false 'pending' blocks)
        const user = await User.findOne({ email })
            .populate('managedCommunity', 'name status')
            .lean();
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Block pending/rejected accounts — only for roles that require approval.
        // Old accounts with legacy role names ('sliit', 'community') are not blocked.
        const rolesRequiringApproval = ['community_admin', 'student'];
        if (rolesRequiringApproval.includes(user.role)) {
            if (user.status === 'pending') {
                const who = user.role === 'community_admin' ? 'Admin' : 'Community Admin';
                return res.status(403).json({ message: `Your account is pending ${who} approval.` });
            }
            if (user.status === 'rejected') {
                return res.status(403).json({ message: `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}` });
            }
        }

        // Normalize legacy role names to the current enum values
        const ROLE_MAP = { community: 'community_admin', sliit: 'student' };
        const normalizedRole = ROLE_MAP[user.role] || user.role;

        // Generate JWT token — include normalized role so authorize() middleware works
        const tokenSecret = process.env.JWT_SECRET || 'supersecretkey';
        const token = jwt.sign(
            { id: user._id, role: normalizedRole },
            tokenSecret,
            { expiresIn: '90d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name || user.username,
                email: user.email,
                role: normalizedRole,
                status: user.status,
                managedCommunity: user.managedCommunity,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
