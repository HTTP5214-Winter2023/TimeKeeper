import { getClockifyData } from "./api.js";
import * as XLSX from "xlsx";
import { homedir } from "os";

/**
 * This function will create the timesheet excel file with the input filename in .xlsx extension
 * @param {string} filename
 */
async function createTimesheet(filename) {
	// create excel workbook
	const wb = XLSX.utils.book_new();
	// retrieve clockify data
	var jsonData = await getClockifyData();
	// Loops through each project
	for (const project of jsonData) {
		// create a worksheet for the current project
		var projectWorksheet = XLSX.utils.aoa_to_sheet([
			["task", "subtask", "time"], // header
		]);
		// set taskOrigin
		var taskOrigin = {
			r: 1,
			c: 0,
		};
		// Loops through each task
		for (const task of project.tasks) {
			XLSX.utils.sheet_add_aoa(
				projectWorksheet,
				[[task.name]], // only write the task name in the task column for now
				{ origin: taskOrigin }
			);
			// set timeentryOrigin, will always be on the same row as task and column + 1 (column: 0 => task, column: 1 => subtask)
			var timeentryOrigin = {
				r: taskOrigin.r,
				c: taskOrigin.c + 1,
			};
			// Loops through each time entry in the current task
			for (const timeentry of task.timeentries) {
				// Add subtask data to the worksheet
				XLSX.utils.sheet_add_aoa(
					projectWorksheet, // the current worksheet
					[[timeentry.description, timeentry.duration]], // subtask, time
					{ origin: timeentryOrigin } // specify the origin of the data write
				);
				// reset timeentryOrigin for next timeentry
				timeentryOrigin.r++;
			}
			// reset taskOrigin for next task
			taskOrigin.r += task.timeentries.length;
		}
		// Add this worksheet to the excel workbook and name it using the project name
		XLSX.utils.book_append_sheet(wb, projectWorksheet, project.name);
	}
	let timestamp = new Date();
	if (!filename) {
		filename =
			"timesheet_" +
			timestamp
				.toISOString()
				.split(".")[0]
				.replaceAll(":", "")
				.replaceAll("-", "");
	}
	// create the excel file with the input filename in the Downloads folder
	await XLSX.writeFile(wb, homedir() + "/Downloads/" + filename + ".xlsx");
}

// Testing:
createTimesheet();
