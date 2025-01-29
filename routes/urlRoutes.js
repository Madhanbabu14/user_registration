const express = require('express');
const shortid = require('shortid')
const router = express.Router();
const { Url, Analytics } = require('../config/db')
const validator = require('validator');

router.post('/', async (req, res) => {
    try {
        const baseUrl = req.protocol + '://' + req.get('host');
        const { longUrl, customAlias, topic } = req.body;
        
        if (!validator.isURL(longUrl)) return res.status(404).send('Invalid URL')

        if (!longUrl || !/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(longUrl)) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        const shortId = shortid();
        let shortUrl = customAlias ?customAlias: shortId
        let payload = {
            longUrl,
            shortUrl,
            customAlias,
            topic
        }
        const createdUrl = await Url.create(payload)

        res.status(200).json({
            shortUrl: baseUrl + '/api/shorten/' + shortUrl,
            createdAt: createdUrl.createdAt,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const userAgent = req.headers['user-agent'];
        let ip = req.ip;

        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0];
        }

        const url = await Url.findOne({ where: { shortUrl: code } });
        if (!url) return res.status(404).json({ error: 'Short URL not found' });

        const analyticsEntry = {
            alias: url.shortUrl,
            ip,
            userAgent
        };
        await Analytics.create(analyticsEntry);

        res.redirect(url.longUrl);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;