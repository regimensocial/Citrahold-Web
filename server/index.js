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

// get config.json
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config.json"), { encoding: 'utf-8' }));

// read ./pages/base.html to variable basePage
const basePage = fs.readFileSync(path.resolve(__dirname, "pages", "base.html"), { encoding: 'utf-8' }).replace("{{SERVER_ADDRESS}}", config.serverAddress);

// iterate through ./pages, ignore base.html

const pagePath = path.resolve(__dirname, "pages");
fs.readdir(pagePath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // iterate through pages and construct them
    files.forEach(file => {
        const filePath = path.join(pagePath, file);
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error('Error getting file stats:', err);
                return;
            }

            if (stats.isFile() && (file !== "base.html")) {

                let fileText = basePage.replace("{{content}}", fs.readFileSync(filePath, { encoding: 'utf-8' }));

                // check if ./scripts/file.js exists
                let scriptFile = file.replace(".html", ".js");
                let styleFile = file.replace(".html", ".css");
                if (fs.existsSync(path.resolve(__dirname, "scripts", scriptFile))) {
                    fileText = fileText.replace("{{script}}", `<script type="module" src="/js/${scriptFile}"></script>`);
                } else {
                    fileText = fileText.replace("{{script}}", "");
                    scriptFile = "";
                }

                if (fs.existsSync(path.resolve(__dirname, "static", "styling", styleFile))) {
                    fileText = fileText.replace("{{style}}", `<link rel="stylesheet" href="/styling/${styleFile}">`);
                } else {
                    fileText = fileText.replace("{{style}}", "");
                    styleFile = "";
                }

                // write fileText to ./static/file.html
                fs.writeFileSync(path.resolve(__dirname, "static", file), fileText, { encoding: 'utf-8' });

                if (scriptFile !== "") {
                    // copy ../scripts/file.js to ./static/js/file.js
                    // but first check if it contains /*SPLIT*/ and if so, split it, and use the second part
                    let script = fs.readFileSync(path.resolve(__dirname, "scripts", scriptFile), { encoding: 'utf-8' });
                    if (script.includes("/*SPLIT*/")) {
                        script = script.split("/*SPLIT*/")[1];
                    }

                    fs.writeFileSync(path.resolve(__dirname, "static", "js", scriptFile), script, { encoding: 'utf-8' });
                }
            }
        });
    });
});

app.use(express.static(path.resolve(__dirname, "static")));

app.get("/*", (req, res, next) => {
    // check if request.html exists
    let file = req.path.replace("/", "");
    if (file === "") {
        file = "index.html";
    } else {
        file = file + ".html";
    }

    if (fs.existsSync(path.resolve(__dirname, "static", file))) {
        // redirect to ./static/request.html if it exists
        res.redirect(req.path + ".html");
        return;
    }

    next();
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3001);
httpsServer.listen(3444);
