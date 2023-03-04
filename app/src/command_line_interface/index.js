import inquirer from 'inquirer';
import { readApiConfig, writeApiConfig } from '../utils.js';

let apiData;

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
      apiData.API_KEY = answers.key;
      await writeApiConfig(apiData);
    })
    .catch((error) => {
      console.log(error);
    });
};

export async function startCli(){

    apiData = await readApiConfig();

    //Ask the user to setup API key if it is not setup yet
    if (!apiData || !apiData.API_KEY || apiData.API_KEY === "") {
        await APIKeyPrompt();
    };

    //Ask the user for the next actions
    const actionPrompt = inquirer.createPromptModule();
    await actionPrompt([{
        type: "",
        name: "",
        message: ""
    }]).then((answers) => {

    }).catch((error) => {
        // console.log(error)
    });

}