import inquirer from 'inquirer';

let API_KEY = ""; //For dev only, it should be returned from the api module

export async function startCli(){

    //Ask the user to setup API key if it is not setup yet
    if (!API_KEY || API_KEY === "") {
        const APIKeyPrompt = inquirer.createPromptModule();
        await APIKeyPrompt([{
            type: "input",
            name: "key",
            message: "Please provide your api key"
        }]).then((answers) => {
            API_KEY = answers.key;
        }).catch((error) => {
            console.log(error)
        });
    };

    console.log("API_KEY:", API_KEY)

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