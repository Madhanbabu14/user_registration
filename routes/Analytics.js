const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const UAParser = require('ua-parser-js');
const { Url, Analytics } = require('../config/db');

router.get('/topic/:topic', async (req, res) => {
    try {
        const topic = req.params.topic;
        const urls = await Url.findAll({ where: { topic } });
        if (!urls.length) {
            return res.status(200).json({
                totalClicks: 0,
                uniqueUsers: 0,
                clicksByDate: [],
                urls: []
            });
        }
        const aliases = urls.map(url => url.shortUrl);
        const analytics = await Analytics.findAll({
            where: { alias: { [Op.in]: aliases } }
        });
        if (!analytics.length) {
            return res.status(200).json({
                totalClicks: 0,
                uniqueUsers: 0,
                clicksByDate: [],
                urls: urls.map(url => ({
                    shortUrl: url.shortUrl,
                    totalClicks: 0,
                    uniqueUsers: 0
                }))
            });
        }
        const totalClicks = analytics.length;
        const uniqueUsers = new Set(analytics.map(a => a.ip)).size;
        const clicksByDate = [];
        analytics.forEach((entry) => {
            const date = entry.timestamp.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
            const existingDate = clicksByDate.find(d => d.date === date);
            if (existingDate) {
                existingDate.clicks += 1;
            } else {
                clicksByDate.push({ date, clicks: 1 });
            }
        });
        const urlsAnalytics = urls.map(url => {
            const urlAnalytics = analytics.filter(a => a.alias === url.shortUrl);
            const urlClicks = urlAnalytics.length;
            const urlUniqueUsers = new Set(urlAnalytics.map(a => a.ip)).size;

            return {
                shortUrl: url.shortUrl,
                totalClicks: urlClicks,
                uniqueUsers: urlUniqueUsers
            };
        });
        res.status(200).json({
            totalClicks,
            uniqueUsers,
            clicksByDate,
            urls: urlsAnalytics
        });

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

async function fetchAnalytics(code = null) {
    const whereCondition = code
        ? { alias: code }
        : {};
    const analytics = await Analytics.findAll({ where: whereCondition });
    if (!analytics.length) {
        return {
            totalClicks: 0,
            uniqueUsers: 0,
            clicksByDate: [],
            osType: [],
            deviceType: []
        };
    }

    const totalClicks = analytics.length;
    const uniqueUsers = new Set(analytics.map((a) => a.ip)).size;

    const clicksByDate = analytics.reduce((acc, entry) => {
        const date = entry.timestamp.toISOString().split('T')[0];
        const existingDate = acc.find((d) => d.date === date);
        if (existingDate) {
            existingDate.clicks += 1;
        } else {
            acc.push({ date, clicks: 1 });
        }
        return acc;
    }, []);

    const osType = [];
    const deviceType = [];

    analytics.forEach((entry) => {
        const parser = new UAParser(entry.userAgent);
        const osName = parser.getOS().name || "Unknown";
        const deviceName = parser.getDevice().type || "Desktop";
        const existingOS = osType.find((os) => os.osName === osName);
        if (existingOS) {
            existingOS.uniqueClicks += 1;
            existingOS.uniqueUsers.add(entry.ip);
        } else {
            osType.push({ osName, uniqueClicks: 1, uniqueUsers: new Set([entry.ip]) });
        }
        const existingDevice = deviceType.find((dev) => dev.deviceName === deviceName);
        if (existingDevice) {
            existingDevice.uniqueClicks += 1;
            existingDevice.uniqueUsers.add(entry.ip);
        } else {
            deviceType.push({ deviceName, uniqueClicks: 1, uniqueUsers: new Set([entry.ip]) });
        }
    });

    osType.forEach((os) => {
        os.uniqueUsers = os.uniqueUsers.size;
    });

    deviceType.forEach((dev) => {
        dev.uniqueUsers = dev.uniqueUsers.size;
    });

    return {
        totalClicks,
        uniqueUsers,
        clicksByDate,
        osType,
        deviceType
    };
}

router.get('/overall', async (req, res) => {
    try {
        const data = await fetchAnalytics();
        const totalUrls = await Url.count();
        res.status(200).json({
            totalUrls,
            ...data
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const url = await Url.findOne({ where: { shortUrl: code } });
        if (!url) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const data = await fetchAnalytics(code);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;