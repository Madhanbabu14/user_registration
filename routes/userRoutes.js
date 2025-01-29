const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const { User } = require('../config/db')

router.use(bodyParser.json());

router.get('/', async (req, res) => {
    try {
        let obj = {};
        if (req.user.role !== 'admin') obj.role = 'user';
        let userFind = await User.findAll({ raw: true, where: obj, attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } })
        return res.status(200).send(userFind)
    } catch (error) {
        return res.status(500).send('There was a problem to find users')
    }
})

router.post('/', async (req, res) => {
    try {
        const find_user = await User.findOne({ raw: true, where: { email: req.body.email } });
        if (find_user) return res.status(500).send('Email already present');
        req.body.password = await bcrypt.hash(req.body.password, 8)
        const createdUser = await User.create(req.body);
        return res.status(201).send({ message: 'user created successfully', createdUser });
    } catch (error) {
        return res.status(500).send('Error creating the user');
    }
});

module.exports = router