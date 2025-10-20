"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_https_1 = __importDefault(require("node:https"));
const node_child_process_1 = require("node:child_process");
function fail(message) {
    console.error(message);
    process.exit(1);
}
function resolveRedirect(url) {
    return new Promise((resolve, reject) => {
        node_https_1.default.get(url, (res) => {
            if (res.statusCode != 302) {
                if (res.statusCode == 404) {
                    reject("Version does not exist.");
                }
                else {
                    reject(`Error: Expected status 302, got ${res.statusCode}`);
                }
            }
            if (res.headers.location) {
                resolve(res.headers.location);
            }
            else {
                reject(`Error: Server did not respond with redirect location.`);
            }
        });
    });
}
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        node_https_1.default.get(url, (res) => {
            if (res.statusCode == 404) {
                reject(`File does not exist.`);
            }
            else if (res.statusCode != 200) {
                reject(`Expected status code 200, got ${res.statusCode}`);
            }
            const file = node_fs_1.default.createWriteStream(outputPath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
    });
}
const fcRootDirectory = node_path_1.default.join(process.argv[1], "..", "..");
const devServerDirectory = node_path_1.default.join(fcRootDirectory, "dev-server");
if (!node_fs_1.default.existsSync(devServerDirectory)) {
    console.log(`Dev server does not exist yet, creating one...`);
    node_fs_1.default.mkdirSync(devServerDirectory, {
        recursive: false
    });
    console.log(`Finding latest server jar...`);
    fetch(`https://api.github.com/repos/Anuken/Mindustry/releases`).then(r => r.json()).then(r => {
        const release = r[0];
        console.log(`Using version ${release.tag_name}`);
        const file = release.assets.find(a => a.name == "server-release.jar") ?? fail(`Could not find the server-release.jar file in the latest release`);
        console.log(`Downloading latest server jar from ${file.browser_download_url}...`);
        return resolveRedirect(file.browser_download_url);
    }).then(downloadURL => {
        return downloadFile(downloadURL, node_path_1.default.join(devServerDirectory, "server-release.jar"));
    }).catch(e => fail(`Failed to download the file: ${e}`)).then(() => {
        console.log(`Linking fish-commands...`);
        const modsFolder = node_path_1.default.join(devServerDirectory, "config", "mods");
        node_fs_1.default.mkdirSync(modsFolder, { recursive: true });
        const fishCommandsFolder = node_path_1.default.join(modsFolder, "fish-commands");
        const buildFolder = node_path_1.default.join(fcRootDirectory, "build");
        node_fs_1.default.symlinkSync(buildFolder, fishCommandsFolder);
        node_fs_1.default.writeFileSync(node_path_1.default.join(devServerDirectory, "config", ".debug"), "");
        console.log(`Successfully set up the development environment.`);
        runServer();
    });
}
else {
    runServer();
}
function runServer() {
    console.log("Starting fish-commands Mindustry development server...");
    const { status } = (0, node_child_process_1.spawnSync)(`which`, ["rlwrap"]);
    const memory = "1G";
    try {
        (0, node_child_process_1.execSync)(`${status === 0 ? "rlwrap " : ""}java -Xmx${memory} -Xms${memory} -jar "server-release.jar"`, {
            stdio: "inherit",
            cwd: node_path_1.default.join(fcRootDirectory, "dev-server")
        });
    }
    catch { }
}
