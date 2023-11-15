const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const https = require('https');
const app = express();

var key = fs.readFileSync(path.resolve(__dirname, "certs", "selfsigned.key"));
var cert = fs.readFileSync(path.resolve(__dirname, "certs", "selfsigned.crt"));
var credentials = {
    key: key,
    cert: cert
};

app.use(express.static(path.resolve(__dirname, "static")));

app.get("/*", (req, res, next) => {
    let file = req.path.replace("/", "");
    if (file === "") {
        file = "index.html";
    } else {
        file = file + ".html";
    }

    if (fs.existsSync(path.resolve(__dirname, "static", file))) {
        res.redirect(req.path + ".html");
        return;
    }

    next();
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3001);
httpsServer.listen(3444);
