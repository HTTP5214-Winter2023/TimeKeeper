import fs from 'fs'

const DEFAULT_API_DATA = {
    API_KEY: "",
    WORKSPACE_ID: "",
    USER_ID: ""
}

export async function readApiConfig() {
    let data;
    try {
        data = JSON.parse(await fs.promises.readFile( "config.json", "utf8"))
    } catch (err) {
        data = DEFAULT_API_DATA;
        await writeApiConfig(data);
    };
    return data;
};

export async function writeApiConfig(config) {
    await fs.promises.writeFile("config.json", JSON.stringify(config, null, 2), function () {});
};