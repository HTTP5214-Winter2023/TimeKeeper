import inquirer from 'inquirer';
import { getWorkspaceID, getClockifyData, getProjects, getTasks, startTimer, stopTimer } from "./api.js";
import { readApiConfig, writeApiConfig } from './utils.js';

const ACTIONS = {
  EXPORT_EXCEL: "exportExcel",
  SET_API_KEY: "setApiKey",
  START_TIMER: "startTimer",
  EXIT: "exit"
};

let config;

const callAPIKeyPrompt = async function () {
  const APIKeyPrompt = inquirer.createPromptModule();
  await APIKeyPrompt([
    {
      type: "input",
      name: "key",
      message: "Please provide your api key",
    },
  ]).then(async (answers) => {
      //Update API_KEY in JSON file
      config.API_KEY = answers.key;
      await writeApiConfig(config);
      let isValid = await getWorkspaceID();
      if (!isValid) {
        console.log("The provided API Key is invalid, please visit https://app.clockify.me/user/settings to get your api Key.")
        await callAPIKeyPrompt();
      } else { 
        console.log("API Key is updated to", config.API_KEY);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const callStartTimerPrompt = async function () {
  const startTimerPrompt = inquirer.createPromptModule();

  //Let users to select the projects
  const projects = await getProjects();

  let selectedProjectId;
  let projectChoices = [];
  let taskChoices = [];
  projects.forEach( p => projectChoices.push({ name: p.name, value: p.id}));
  projectChoices.push({
    name: "New Project",
    value: null
  });

  await startTimerPrompt([{
    type: 'list',
    name: 'projectId',
    message: 'Which project would you like to work on?',
    choices: projectChoices,
  }]).then(async(answers) => {
    selectedProjectId = answers.projectId;
  }).catch((error) => {
    console.log(error)
  });

  //If New Project is selected, create a new project
  if (!selectedProjectId) {
    const addNewProjectPrompt = inquirer.createPromptModule();
    await addNewProjectPrompt([{
      type: "input",
      name: "projectName",
      message: "What is the new project name?",
    }]).then(async(answers) => {
      // call api to add new project
    }).catch((error) => {
      console.log(error)
    });
  }

  //Let users to select the tasks
  let selectedTaskId;
  let tasks = await getTasks(selectedProjectId);
  tasks.forEach( t => {
    taskChoices.push({ name: t.name, value: t.id});
  });
  taskChoices.push({name: "New Task", value: null});

  const selectTasksPrompt = inquirer.createPromptModule();
  await selectTasksPrompt([{
    type: 'list',
    name: 'taskId',
    message: 'Which task would you like to work on?',
    choices: taskChoices,
  }]).then(async(answers) => {
    selectedTaskId = answers.taskId;
  }).catch((error) => {
      console.log(error)
  });

  //If New Task is selected, create a new task
  if (!selectedTaskId) {
    const addNewTaskPrompt = inquirer.createPromptModule();
    await addNewTaskPrompt([{
      type: "input",
      name: "taskName",
      message: "What is the new task name?",
    }]).then(async (answers) => {
      // call api to add new task
    }).catch((error) => {
      console.log(error)
    });
  }

  //Start a new time entries
  const addNewEntryPrompt = inquirer.createPromptModule();
  await addNewEntryPrompt([{
    type: "input",
    name: "entryDescription",
    message: "Please provide a brief description?",
  }]).then(async (answers) => {
    await startTimer(answers.entryDescription, selectedProjectId, selectedTaskId);
  }).catch((error) => {
    console.log(error)
  });
};

export async function startCli(){

    config = await readApiConfig();

    //Ask the user to setup API key if it is not setup yet
    if (!config || !config.API_KEY || config.API_KEY === "") {
      console.log("You may visit https://app.clockify.me/user/settings to get your api Key.")
      await callAPIKeyPrompt();
    };

    //Ask the user for the next actions
    let action;
    const actionPrompt = inquirer.createPromptModule();
    await actionPrompt([{
      type: 'list',
      name: 'action',
      message: 'Please select an action:',
      choices: [
        {
          name: "Start a New Timer", 
          value: ACTIONS.START_TIMER
        },{
            name: "Export Timesheet to Excel File", 
            value: ACTIONS.EXPORT_EXCEL
        },{
            name: "Update API Key", 
            value: ACTIONS.SET_API_KEY
        },{
            name: "Exit", 
            value: ACTIONS.EXIT
        }
    ],
    }]).then((answers) => {
      action = answers.action;
    }).catch((error) => {
      console.log(error)
    });

    //Switch based on usre resposne
    switch(action){
      case ACTIONS.START_TIMER:
        await callStartTimerPrompt();
        break;
      case ACTIONS.EXPORT_EXCEL:
        await getClockifyData();
        console.log("Exporting Excel File......");
        break;
      case ACTIONS.SET_API_KEY:
        await callAPIKeyPrompt();
        break;
      case ACTIONS.EXIT:
        console.log("Terminating Application......");
        process.exit();
  };

  // Back to the menu
  await startCli()
};