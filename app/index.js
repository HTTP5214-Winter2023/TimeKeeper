import { startCli } from "./src/command_line_interface/index.js";
import { getWorkspaceID } from "./src/clockify_api/index.js";

// Run command line for user inputs
await startCli();

// Get workspace id (first workspace)
await getWorkspaceID();