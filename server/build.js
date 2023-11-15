const fs = require('fs');
const { readdir } = require('fs/promises');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config.json"), { encoding: 'utf-8' }));

const basePage = fs.readFileSync(path.resolve(__dirname, "pages", "base.html"), { encoding: 'utf-8' }).replace("{{SERVER_ADDRESS}}", config.serverAddress);

fs.copyFileSync(path.resolve(__dirname, "scripts", "common.js"), path.resolve(__dirname, "static", "js", "common.js"));


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

const pagePath = path.resolve(__dirname, "pages");
getFiles(pagePath)
    .then(files => {

        files.forEach(file => {

            fs.stat(file, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (stats.isFile() && (!file.includes("base.html"))) {

                    let fileText = basePage.replace("{{content}}", fs.readFileSync(file, { encoding: 'utf-8' }));

                    let scriptFile = file.replace("pages", "scripts").replace(".html", ".js");
                    let headFile = file.replace("pages", "heads");
                    let styleFile = file.replace("pages", "static/styling").replace(".html", ".css");

                    if (fs.existsSync(headFile)) {
                        fileText = fileText.replace("{{head}}", fs.readFileSync(headFile, { encoding: 'utf-8' }));
                    } else {
                        fileText = fileText.replace("{{head}}", "<title>Citrahold Web</title>");
                    }

                    if (fs.existsSync(scriptFile)) {
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
                        let script = fs.readFileSync(scriptFile, { encoding: 'utf-8' });
                        if (script.includes("/*SPLIT*/")) {
                            script = script.split("/*SPLIT*/")[1];
                        }

                        ensureDirectoryExistence(file.replace("pages", "static/js"));

                        fs.writeFileSync(
                            file.replace("pages", "static/js").replace(".html", ".js"), script, { encoding: 'utf-8' }
                        );
                    }
                }
            });
        });
    })
    .catch(
        e => console.error(e)
    );