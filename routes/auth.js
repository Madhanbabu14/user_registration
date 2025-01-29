const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        console.log("req.body", req.body)
        const find_user = await User.findOne({ raw: true, where: { email: req.body.email } });
        if (!find_user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const isVerified = await bcrypt.compare(req.body.password, find_user.password);
        if (!isVerified) {
            return res.status(401).send({ message: 'Invalid credentials provided' });
        }
        const token = jwt.sign({ username: find_user.username, email: find_user.email }, '@#12@123#', { expiresIn: '1h' })
        return res.status(200).send({ message: 'Login successful', user: find_user, token });
    } catch (error) {
        console.log("err", error)
        return res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
