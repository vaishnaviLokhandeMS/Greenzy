const NurseryOwner = require('../models/NurseryOwner');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateUsername = (fullname) => {
    return fullname.toLowerCase().replace(/\s+/g, '') + Math.floor(1000 + Math.random() * 9000);
};

// Signup
exports.registerNurseryOwner = async (req, res) => {
    try {
        const { fullname, phonenumber, nurseryname, nurseryaddress, owneraddress, email, password } = req.body;

        const existingUser = await NurseryOwner.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const username = generateUsername(fullname);

        const newUser = new NurseryOwner({
            fullname,
            phonenumber,
            nurseryname,
            nurseryaddress,
            owneraddress,
            email,
            password,
            username
        });

        await newUser.save();
        res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.loginNurseryOwner = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await NurseryOwner.findOne({ email, status: 'approved' });
        if (!user) return res.status(400).json({ message: 'Invalid credentials or account not approved' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, fullname: user.fullname } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
