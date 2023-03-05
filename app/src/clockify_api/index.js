import { readApiConfig, writeApiConfig } from '../utils.js';

const clockify = "https://api.clockify.me/api/v1"; //base URL for any Clockify API requests
let config = await readApiConfig();

export async function getWorkspaceID() {
  config = await readApiConfig();

  let reqUrl = `${clockify}/workspaces`;

  var response = await fetch(
    reqUrl,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": config.API_KEY
      }
    }
  );
  
  let workspaceID = await response.json();
  config.WORKSPACE_ID = workspaceID[0].id;
  await writeApiConfig(config);
}

export async function getProjects() {

  let reqUrl = `${clockify}/workspaces/${config.WORKSPACE_ID}/projects`;

  var response = await fetch(
    reqUrl,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": config.API_KEY
      }
    }
  );
  
  return await response.json();
}