const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('user_management', 'postgres', 'root', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

sequelize.sync().then(() => {
    console.log('Database connected successfully');
}).catch(err => {
    console.log("There was a problem connecting to Database::: ", err);
});

var User = sequelize.define('user', {
    username: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    role: { type: Sequelize.ENUM("admin", "user"), defaultValue: "user" },
});

const Url = sequelize.define('url', {
    longUrl: { type: Sequelize.STRING, allowNull: false },
    shortUrl: { type: Sequelize.STRING, allowNull: false, unique: true },
    customAlias: { type: Sequelize.STRING, unique: true },
    topic: { type: Sequelize.STRING },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
});

const Analytics = sequelize.define('analytics', {
    alias: { type: Sequelize.STRING},
    ip: { type: Sequelize.STRING},
    userAgent: { type: Sequelize.STRING},
    timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW() },
})

module.exports = { User, Url, Analytics };
