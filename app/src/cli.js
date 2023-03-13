import inquirer from 'inquirer';
import { getWorkspaceID, getClockifyData, getProjects, getTasks, startTimer, stopTimer } from "./api.js";
import { readApiConfig, writeApiConfig } from './utils.js';

const ACTIONS = {
  EXPORT_EXCEL: "exportExcel",
  SET_API_KEY: "setApiKey",
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
  ])
    .then(async (answers) => {
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
        // console.log(error)
    });

    //Switch based on usre resposne
    switch(action){
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
}