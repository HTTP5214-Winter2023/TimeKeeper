import { startCli } from "./src/command_line_interface/index.js";
import { getWorkspaceID } from "./src/clockify_api/index.js";
import { getClockifyData } from "./src/clockify_api/index.js";

// Run command line for user inputs
await startCli();

// Get workspace id (active workspace)
await getWorkspaceID();

// Get all useful data for timesheet
await getClockifyData();