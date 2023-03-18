import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_API_DATA = {
    API_KEY: "",
    WORKSPACE_ID: "",
    USER_ID: ""
}

export async function readApiConfig() {
    let data;
    try {
        data = JSON.parse(await fs.promises.readFile(__dirname + "/../config.json", "utf8"))
    } catch (err) {
        data = DEFAULT_API_DATA;
        await writeApiConfig(data);
    };
    return data;
};

export async function writeApiConfig(config) {
    console.log(`Configuration updated in ${__dirname}/config.json`);
    await fs.promises.writeFile(__dirname + "/../config.json", JSON.stringify(config, null, 2), function () {});
};
