import { readApiConfig, writeApiConfig } from '../utils.js';

const clockify = "https://api.clockify.me/api/v1"; //base URL for any Clockify API requests
let apiData = await readApiConfig();

export async function getWorkspaceID() {
  apiData = await readApiConfig();

  let reqUrl = `${clockify}/user`;

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
  
  let user = await response.json();
  apiData.WORKSPACE_ID = user.activeWorkspace;
  apiData.USER_ID = user.id;
  await writeApiConfig(apiData);
}

export async function getClockifyData() {
  // get all useful data (projects, tasks, timeentries)


}

async function getProjects() {

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