import { readApiConfig, writeApiConfig } from '../utils.js';

const clockify = "https://api.clockify.me/api/v1"; //base URL for any Clockify API requests
let apiData = await readApiConfig();

export async function getWorkspaceID() {
  let reqUrl = `${clockify}/workspaces`;

  var response = await fetch(
    reqUrl,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": apiData.API_KEY
      }
    }
  );
  
  let workspaceID = await response.json();
  apiData.WORKSPACE_ID = workspaceID[0].id;
  await writeApiConfig(apiData);
}

export async function getProjects() {

  let reqUrl = `${clockify}/workspaces/${apiData.WORKSPACE_ID}/projects`;

  var response = await fetch(
    reqUrl,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": apiData.API_KEY
      }
    }
  );
  
  return await response.json();
}