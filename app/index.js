#!/usr/bin/env node
import { startCli, startTimerFromCli } from "./src/cli.js";

let argvs = process.argv.splice(2);

// Run command line for user inputs
if (argvs && argvs.length == 0) {
    await startCli();
} else if (argvs[0] == "start"){ // sample: timer start "Project A" "Create Timesheet" "Hello Found!"
    await startTimerFromCli(argvs[1], argvs[2], argvs[3]);
};

