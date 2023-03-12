import { getClockifyData } from "./api.js";
import * as XLSX from "xlsx";

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
		// Loops through each task
		for (const task of project.tasks) {
			// create a worksheet for the current project
			var projectWorksheet = XLSX.utils.aoa_to_sheet([
				["task", "subtask", "time"], // header
				[task.name], // only write the task name in the task column for now
			]);
			// Loops through each time entry in the current task
			for (const timeentry of task.timeentries) {
				// Add subtask data to the worksheet
				XLSX.utils.sheet_add_aoa(
					projectWorksheet, // the current worksheet
					[[timeentry.description, timeentry.duration]], // subtask, time
					{ origin: { r: 1, c: 1 } } // specify the origin of the data write, { row: 1, column: 1 } => cell B2
				);
			}
			// Add this worksheet to the excel workbook and name it using the project name
			XLSX.utils.book_append_sheet(wb, projectWorksheet, project.name);
		}
	}
	// create the excel file with the input filename
	await XLSX.writeFile(wb, filename + ".xlsx");
}

// Testing:
// createExcel("test");
