import inquirer from "inquirer";
import {
  getWorkspaceID,
  getClockifyData,
  getProjects,
  getTasks,
  getTimeentries,
  startTimer,
  stopTimer,
  addNewProject,
  addTask
} from "./api.js";
import {
  readApiConfig,
  writeApiConfig,
  formatDuration,
  timeConvert,
  convertSecondToString
} from "./utils.js";
import{
  createTimesheet,
} from "./report.js";

const ACTIONS = {
  EXPORT_EXCEL: "exportExcel",
  SET_API_KEY: "setApiKey",
  START_TIMER: "startTimer",
  STOP_CURRENT_TIMER: "stopTimer",
  CHECK_PROJECTS: "checkProjects",
  EXIT: "exit",
};

let config;

const checkAPIConfig = async function () {
  config = await readApiConfig();
  //Ask the user to setup API key if it is not setup yet
  if (!config || !config.API_KEY || config.API_KEY === "") {
    console.log(
      "You may visit https://app.clockify.me/user/settings to get your api Key."
    );
    await callAPIKeyPrompt();
  }
};

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
      // call api to add new project
      .then(async (answers) => {
        const newProject = await addNewProject(answers.projectName);
        selectedProject = newProject;
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
      // call api to add new task
      .then(async (answers) => {
        const newTask = await addTask(selectedProject.id, answers.taskName);
        selectedTask = newTask;
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

  // Display timer on CLI

  let sec = 0;
  let displayString = "";

  // Interval to update timer every seconds
  let timerInterval = setInterval( function () {
    sec++;
    displayString = convertSecondToString(sec);
    process.stdout.write('Timer: '+ displayString +'\r');
  }, 1000);

  // Add event listener to the cli to stop the timer 
  console.log('Press any key to stop the timer');

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data',function() {
    process.stdin.setRawMode(false);
    clearInterval(timerInterval);
    process.stdin.removeAllListeners('data');
  });

  // Do not proceeds until users click sth
  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
  while (timerInterval._destroyed !== true) {
    await sleep(1000);
  }

  await stopTimer();
  console.log(`You have spent ${displayString} on ${description}.`)

};

export async function startCli() {

  //Ask the user to setup API key if it is not setup yet
  await checkAPIConfig();

  //Choiced for action prompt:
  let choices = [
    {
      name: "Start a New Timer",
      value: ACTIONS.START_TIMER,
    },
    {
      name: "Stop Current Timer",
      value: ACTIONS.STOP_CURRENT_TIMER,
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
  ];

  // Check whether there is running timer.
  let haveRunningTimer = false;
  let runningTimeEntry;
  let timeEntries = await getTimeentries();

  for (const entry of timeEntries) {
    // If there is a record without end value
    if (entry.timeInterval.end == null) {
      haveRunningTimer = true;
      runningTimeEntry = entry;
    } 
  };

  if (haveRunningTimer) {
    choices = choices.filter( c => c.value !== ACTIONS.START_TIMER);
  } else {
    choices = choices.filter( c => c.value !== ACTIONS.STOP_CURRENT_TIMER);
  };

  //Ask the user for the next actions
  let action;
  const actionPrompt = inquirer.createPromptModule();
  await actionPrompt([
    {
      type: "list",
      name: "action",
      message: "Please select an action:",
      choices: choices,
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
    case ACTIONS.STOP_CURRENT_TIMER:
      await stopTimer(); //API stop the running timer.
      console.log(`The timer has now stopped for ${runningTimeEntry.description} .`);
      break;
    case ACTIONS.CHECK_PROJECTS:
      await callProjectPrompt();
      break;
    case ACTIONS.EXPORT_EXCEL:
      await createTimesheet();
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

export async function startTimerFromCli(projectName, taskName, description) {

  await checkAPIConfig();

  //Find Project
  const projects = await getProjects();
  if ( !projects || projects == 0) {
    console.log("No project is found");
    return;
  };
  const project = projects.find( p => p.name == projectName);
  if (!project) {
    console.log(`${projectName} is not found.`);
    return;
  } 

  //Find Task
  const tasks = await getTasks(project.id);
  if ( !tasks || tasks == 0) {
    console.log(`No tasks are found in ${project.name}`);
    return;
  };
  const task = tasks.find( t => t.name == taskName);
  if (!task) {
    console.log(`${taskName} is not found.`);
    return;
  } 

  await startTimer(description, project.id, task.id);
  console.log(
    `A timer has been started for ${description} on ${project.name} - ${task.name}`
  );
}
