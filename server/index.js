const fs = require('fs');
const { readdir } = require('fs').promises;
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


async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}


// iterate through ./pages, ignore base.html

const pagePath = path.resolve(__dirname, "pages");
getFiles(pagePath)
    .then(files => {

        // iterate through pages and construct them
        files.forEach(file => {

            fs.stat(file, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (stats.isFile() && (!file.includes("base.html"))) {

                    let fileText = basePage.replace("{{content}}", fs.readFileSync(file, { encoding: 'utf-8' }));

                    // check if ./scripts/file.js exists
                    let scriptFile = file.replace("pages", "scripts").replace(".html", ".js");
                    let styleFile = file.replace("pages", "static/styling").replace(".html", ".css");

                    if (fs.existsSync(path.resolve(__dirname, "scripts", scriptFile))) {
                        fileText = fileText.replace("{{script}}", `<script type="module" src="${scriptFile.replace(path.resolve(__dirname, "scripts"), "/js")}"></script>`);
                    } else {
                        fileText = fileText.replace("{{script}}", "");
                        scriptFile = "";
                    }

                    if (fs.existsSync(styleFile)) {
                        fileText = fileText.replace("{{style}}", `<link rel="stylesheet" href="${styleFile.replace(path.resolve(__dirname, "static"), "")}">`);
                    } else {
                        fileText = fileText.replace("{{style}}", "");
                        styleFile = "";
                    }

                    ensureDirectoryExistence(file.replace("pages", "static"));

                    fs.writeFileSync(
                        file.replace("pages", "static")
                        , fileText, { encoding: 'utf-8' });

                    if (scriptFile !== "") {
                        // copy ../scripts/file.js to ./static/js/file.js
                        // but first check if it contains /*SPLIT*/ and if so, split it, and use the second part
                        let script = fs.readFileSync(scriptFile, { encoding: 'utf-8' });
                        if (script.includes("/*SPLIT*/")) {
                            script = script.split("/*SPLIT*/")[1];
                        }

                        ensureDirectoryExistence(file.replace("pages", "static/js"));

                        fs.writeFileSync(
                            file.replace("pages", "static/js").replace(".html", ".js")
                            , script, { encoding: 'utf-8' });
                    }
                }
            });
        });
    })
    .catch(e => console.error(e));

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
