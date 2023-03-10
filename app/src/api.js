import { readApiConfig, writeApiConfig } from './utils.js';

// Object constructors
function Timeentry(id, description, duration) {
  this.id = id;
  this.description = description;
  this.duration = duration;
}
function Task(id, name, timeentries = []) {
  this.id = id;
  this.name = name;
  this.timeentries = timeentries;
}
function Project(id, name, tasks = []) {
  this.id = id;
  this.name = name;
  this.tasks = tasks;
}

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

  if (response.status === 200) {
    let user = await response.json();
    apiData.WORKSPACE_ID = user.activeWorkspace;
    apiData.USER_ID = user.id;
    await writeApiConfig(apiData);
    return true;
  }
  else {
    //Remove invalid api key
    await writeApiConfig({});
    return false;
  }
}

export async function getClockifyData() {
  // get all useful data (projects, tasks, timeentries)
  var json_projects = await getProjects();
  for (const json_project of json_projects) {
    var projects = [];
    var json_tasks = await getTasks(json_project.id);
    for (const json_task of json_tasks) {
      var tasks = [];
      var json_timeentries = await getTimeentries(json_task.id);
      for (const json_timeentry of json_timeentries) {
        var timeentries = [];
        var timeentry = new Timeentry(json_timeentry.id, json_timeentry.description, json_timeentry.timeInterval.duration);
        timeentries.push(timeentry);
      };
      var task = new Task(json_task.id, json_task.name, timeentries);
      tasks.push(task);
    };
    var project = new Project(json_project.id, json_project.name, tasks);
    projects.push(project);
  };
  console.log(projects);
  return projects;
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

export async function getTasks(id) {
  let reqUrl = `${clockify}/workspaces/${apiData.WORKSPACE_ID}/projects/${id}/tasks`;

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

export async function getTimeentries(id = 0) {
  let reqUrl = `${clockify}/workspaces/${apiData.WORKSPACE_ID}/user/${apiData.USER_ID}/time-entries`;
  if (id != 0) {
    reqUrl += `?task=${id}`;
  }

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

// use await startTimer("Writing documentation","63ecf25eee569c5821aed6ff","63ecf2a3feb6c4526152291e") to test function;
export async function startTimer(description, projectId, taskId) {
  let reqUrl = `${clockify}/workspaces/${apiData.WORKSPACE_ID}/time-entries`;

  let now = new Date();
  let postRequest = {
    "start": now.toISOString(),
    "billable": "true",
    "description": description,
    "projectId": projectId,
    "taskId": taskId
  };

  var response = await fetch(
    reqUrl,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": apiData.API_KEY,
      },
      body: JSON.stringify(postRequest)
    }
  );
  
  return await response.json();
}

export async function stopTimer(taskId) {
  let reqUrl = `${clockify}/workspaces/${apiData.WORKSPACE_ID}/user/${apiData.USER_ID}/time-entries`;

  let now = new Date();
  let postRequest = {
    "end": now.toISOString(),
    "taskId": taskId
  };

  var response = await fetch(
    reqUrl,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": apiData.API_KEY,
      },
      body: JSON.stringify(postRequest)
    }
  );
}