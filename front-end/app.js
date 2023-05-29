const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const redis = require("redis");
const path = require("path");
const app = express();

var redisClient = redis.createClient({
	password: process.env.REDIS_PASSWORD
});

redisClient.on("connect", () => {
	console.log("Redis client connected");
});

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'build')));

app.get("/csrf", (req, res) => {
	if (req.cookies.clientdek === undefined) {
		res.status(403).send("Unauthorized request for CSRF token");
	} else {
		var csrfToken = uuidv4();
		redisClient.set(`csrf:${csrfToken}`, "", (err, reply) => {
			if (err) throw err;
		});
		res.json({ CSRFToken: csrfToken });
	}
});

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(9000);



