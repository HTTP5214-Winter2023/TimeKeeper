import { getClockifyData } from "./api.js";
import * as XLSX from "xlsx";
import { exportTime } from './utils.js';
import * as XLSXStyle from "xlsx-style";


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
			["Task", "Subtask", "Time(Hr)"], // header
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
					[[timeentry.description, {t: "n", v: exportTime(timeentry.duration)}]], // subtask, time
					{ origin: timeentryOrigin } // specify the origin of the data write

				);
				// reset timeentryOrigin for next timeentry
				timeentryOrigin.r++;
			}
			// reset taskOrigin for next task
			taskOrigin.r += task.timeentries.length;
			// The total numbers of the data
			var totalRow = taskOrigin.r;
		}
		//Adding the TOTAL number of the hours
		XLSX.utils.sheet_add_aoa(
			projectWorksheet,
			[["TOTAL:","",{f:`SUM(C2:C${totalRow})`}]],
			{ origin: taskOrigin });
		
		// Trying to style the cell with colors
		// const cellB2 = XLSX.utils.encode_cell({r: 1, c: 1});
		// const styleB2 = {fill: {fgColor: {rgb: "3399ff"}}};
		// projectWorksheet[cellB2] = Object.assign({}, projectWorksheet[cellB2], {s: styleB2});

		// Add this worksheet to the excel workbook and name it using the project name
		XLSX.utils.book_append_sheet(wb, projectWorksheet, project.name);
	}

	

	// create the excel file with the input filename
	await XLSX.writeFile(wb, filename + ".xlsx");

	// var workbook = XLSX.readFile(filename + ".xlsx");
	// const cellB2 = XLSX.utils.encode_cell({r: 1, c: 1});
	// const styleB2 = {fill: {fgColor: {rgb: "3399ff"}}};
	// worksheet = workbook["HTTP5213"];
	// worksheet[cellB2] = Object.assign({}, worksheet[cellB2], {s: styleB2});

	// const cellB2 = XLSX.utils.encode_cell({r: 1, c: 1});
	// const styleB2 = {fill: {fgColor: {rgb: "3399ff"}}};
	// var worksheet = wb["HTTP5213"];
	// worksheet[cellB2] = Object.assign({}, worksheet[cellB2], {s: styleB2});

	// await XLSXStyle.default.write(wb);
}

// Testing:
createTimesheet("test");
