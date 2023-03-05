import inquirer from 'inquirer';
import { getWorkspaceID } from "../clockify_api/index.js";
import { readApiConfig, writeApiConfig } from '../utils.js';

const ACTIONS = {
  EXPORT_EXCEL: "exportExcel",
  SET_API_KEY: "setApiKey",
  EXIT: "exit"
};

let config;

const APIKeyPrompt = async function () {
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
      await getWorkspaceID();
    })
    .catch((error) => {
      console.log(error);
    });
};

export async function startCli(){

    config = await readApiConfig();

    //Ask the user to setup API key if it is not setup yet
    if (!config || !config.API_KEY || config.API_KEY === "") {
        await APIKeyPrompt();
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
        console.log("Exporting Excel File......");
          break;
      case ACTIONS.SET_API_KEY:
          await APIKeyPrompt();
          console.log("API Key is updated to", config.API_KEY);
          break;
      case ACTIONS.EXIT:
          console.log("Terminating Application......");
          process.exit();
  };

  // Back to the menu
  await startCli()
}