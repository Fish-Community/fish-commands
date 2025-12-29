import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { execSync, spawnSync } from "node:child_process";
import { Octokit } from "@octokit/rest";
function fail(message) {
    console.error(message);
    process.exit(1);
}
function resolveRedirect(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
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
        https.get(url, (res) => {
            if (res.statusCode == 404) {
                reject(`File does not exist.`);
            }
            else if (res.statusCode != 200) {
                reject(`Expected status code 200, got ${res.statusCode}`);
            }
            const file = fs.createWriteStream(outputPath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
    });
}
const fcRootDirectory = path.join(process.argv[1], "..", "..");
const devServerDirectory = path.join(fcRootDirectory, "dev-server");
if (!fs.existsSync(devServerDirectory)) {
    console.log(`Dev server does not exist yet, creating one...`);
    fs.mkdirSync(devServerDirectory, {
        recursive: false
    });
    console.log(`Finding latest server jar...`);
    const octokit = new Octokit();
    const [release] = (await octokit.repos.listReleases({
        owner: 'Anuken',
        repo: 'Mindustry',
    })).data;
    console.log(`Using version ${release.tag_name}`);
    const file = release.assets.find(a => a.name == "server-release.jar")
        ?? fail(`Could not find the server-release.jar file in the latest release`);
    console.log(`Downloading latest server jar from ${file.browser_download_url}...`);
    const downloadURL = await resolveRedirect(file.browser_download_url);
    await downloadFile(downloadURL, path.join(devServerDirectory, "server-release.jar"));
    console.log(`Linking fish-commands...`);
    const modsFolder = path.join(devServerDirectory, "config", "mods");
    fs.mkdirSync(modsFolder, { recursive: true });
    const fishCommandsFolder = path.join(modsFolder, "fish-commands");
    const buildFolder = path.join(fcRootDirectory, "build");
    fs.symlinkSync(buildFolder, fishCommandsFolder);
    fs.writeFileSync(path.join(devServerDirectory, "config", ".debug"), "");
    console.log(`Successfully set up the development environment.`);
    runServer();
}
else {
    runServer();
}
function runServer() {
    console.log("Starting fish-commands Mindustry development server...");
    const { status } = spawnSync(`which`, ["rlwrap"]);
    const memory = "1G";
    try {
        execSync(`${status === 0 ? "rlwrap " : ""}java -Xmx${memory} -Xms${memory} -jar "server-release.jar"`, {
            stdio: "inherit",
            cwd: path.join(fcRootDirectory, "dev-server")
        });
    }
    catch { }
}
