import inquirer from "inquirer";
import {
  getWorkspaceID,
  getClockifyData,
  getProjects,
  getTasks,
  getTimeentries,
  startTimer,
  stopTimer,
} from "./api.js";
import {
  readApiConfig,
  writeApiConfig,
  formatDuration,
  timeConvert,
} from "./utils.js";

const ACTIONS = {
  EXPORT_EXCEL: "exportExcel",
  SET_API_KEY: "setApiKey",
  START_TIMER: "startTimer",
  STOP_CURRENT_TIMER: "stopTimer",
  CHECK_PROJECTS: "checkProjects",
  EXIT: "exit",
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
        console.log(
          "The provided API Key is invalid, please visit https://app.clockify.me/user/settings to get your api Key."
        );
        await callAPIKeyPrompt();
      } else {
        console.log("API Key is updated to", config.API_KEY);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const callProjectPrompt = async function (projects) {
  const projectPrompt = inquirer.createPromptModule();
  var projects = await getProjects();

  const answer = await projectPrompt([
    {
      type: "list",
      name: "project",
      message: "Please select a project:",
      choices: projects.map((project) => ({
        name: project.name,
        value: project.id,
      })),
    },
  ]);

  // Call the getTasks() function to retrieve the list of tasks for the selected project
  const tasks = await getTasks(answer.project);
  // create an array to store the task details data objects
  var tasksData = [];

  for (const task of tasks) {
    const timeentries = await getTimeentries(task.id);

    console.log("\x1b[36m%s\x1b[0m", "Task Name: " + task.name);

    for (const entry of timeentries) {
      var duration = formatDuration(entry.timeInterval.duration);
      var startTime = entry.timeInterval.start;
      var endTime = entry.timeInterval.end;
      var description = entry.description || "No description";

      // add the time entry data object to the array
      tasksData.push({
        Start: timeConvert(startTime),
        End: timeConvert(endTime),
        Duration: duration,
        Description: description,
      });
    }
    // display the task data in a table format
    console.table(tasksData);
    tasksData = [];
  }
};

const callStartTimerPrompt = async function () {
  const startTimerPrompt = inquirer.createPromptModule();

  //Let users to select the projects
  const projects = await getProjects();

  let selectedProject;
  let projectChoices = [];
  let taskChoices = [];
  let stopTimerChoices = stopTimer;
  projects.forEach((p) => projectChoices.push({ name: p.name, value: p }));
  projectChoices.push({
    name: "New Project",
    value: null,
  });

  await startTimerPrompt([
    {
      type: "list",
      name: "project",
      message: "Which project would you like to work on?",
      choices: projectChoices,
    },
  ])
    .then(async (answers) => {
      selectedProject = answers.project;
    })
    .catch((error) => {
      console.log(error);
    });

  //If New Project is selected, create a new project
  if (!selectedProject) {
    const addNewProjectPrompt = inquirer.createPromptModule();
    await addNewProjectPrompt([
      {
        type: "input",
        name: "projectName",
        message: "What is the new project name?",
      },
    ])
      .then(async (answers) => {
        // call api to add new project
      })
      .catch((error) => {
        console.log(error);
      });
  }

  //Let users to select the tasks
  let selectedTask;
  let tasks = await getTasks(selectedProject.id);
  tasks.forEach((t) => {
    taskChoices.push({ name: t.name, value: t });
  });
  taskChoices.push({ name: "New Task", value: null });

  const selectTasksPrompt = inquirer.createPromptModule();
  await selectTasksPrompt([
    {
      type: "list",
      name: "task",
      message: "Which task would you like to work on?",
      choices: taskChoices,
    },
  ])
    .then(async (answers) => {
      selectedTask = answers.task;
    })
    .catch((error) => {
      console.log(error);
    });

  //If New Task is selected, create a new task
  if (!selectedTask) {
    const addNewTaskPrompt = inquirer.createPromptModule();
    await addNewTaskPrompt([
      {
        type: "input",
        name: "taskName",
        message: "What is the new task name?",
      },
    ])
      .then(async (answers) => {
        // call api to add new task
      })
      .catch((error) => {
        console.log(error);
      });
  }

  //Start a new time entries
  let description;
  const addNewEntryPrompt = inquirer.createPromptModule();
  await addNewEntryPrompt([
    {
      type: "input",
      name: "entryDescription",
      message: "Please provide a brief description?",
    },
  ])
    .then(async (answers) => {
      description = answers.entryDescription;
      await startTimer(description, selectedProject.id, selectedTask.id);
    })
    .catch((error) => {
      console.log(error);
    });

  console.log(
    `A timer has been started for ${description} on ${selectedProject.name} - ${selectedTask.name}`
  );
  // when user have started their timer, stop timer shows up
  const stopTimerPrompt = inquirer.createPromptModule();
  await stopTimerPrompt([
    {
      type: "input",
      name: "stopTimer",
      message: "Are you sure you want to stop the timer?",
    },
  ])
    .then(async () => {
      await stopTimer;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(`The timer has been stopped for ${selectedProject.name}!`);
};

export async function startCli() {
  config = await readApiConfig();

  //Ask the user to setup API key if it is not setup yet
  if (!config || !config.API_KEY || config.API_KEY === "") {
    console.log(
      "You may visit https://app.clockify.me/user/settings to get your api Key."
    );
    await callAPIKeyPrompt();
  }

  //Ask the user for the next actions
  let action;
  const actionPrompt = inquirer.createPromptModule();
  await actionPrompt([
    {
      type: "list",
      name: "action",
      message: "Please select an action:",
      choices: [
        {
          name: "Start a New Timer",
          value: ACTIONS.START_TIMER,
        },
        {
          name: "Check Projects List",
          value: ACTIONS.CHECK_PROJECTS,
        },
        {
          name: "Export Timesheet to Excel File",
          value: ACTIONS.EXPORT_EXCEL,
        },
        {
          name: "Update API Key",
          value: ACTIONS.SET_API_KEY,
        },
        {
          name: "Exit",
          value: ACTIONS.EXIT,
        },
      ],
    },
  ])
    .then((answers) => {
      action = answers.action;
    })
    .catch((error) => {
      console.log(error);
    });

  //Switch based on usre resposne
  switch (action) {
    case ACTIONS.START_TIMER:
      await callStartTimerPrompt();
      break;
    case ACTIONS.CHECK_PROJECTS:
      await callProjectPrompt();
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
  }

  // Back to the menu
  await startCli();
}
