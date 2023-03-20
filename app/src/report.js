import { getClockifyData } from "./api.js";
import * as XLSX from "xlsx";
import { homedir } from "os";
import { exportTime } from "./utils.js";
import * as XLSXStyle from "xlsx-style";

/**
 * This function will create the timesheet excel file with the input filename in .xlsx extension
 * @param {string} filename
 */
export async function createTimesheet(filename) {
	// create excel workbook
	const wb = XLSX.utils.book_new();
	// retrieve clockify data
	var jsonData = await getClockifyData();
	// Loops through each project
	for (const project of jsonData) {
		const styleYellow = { fill: { fgColor: { rgb: "ffcc00" } } };
		const styleBlue = { fill: { fgColor: { rgb: "cce6ff" } } };
		// create a worksheet for the current project
		var projectWorksheet = XLSX.utils.aoa_to_sheet([
			[
				{ v: "Task", s: styleBlue },
				{ v: "Subtask", s: styleBlue },
				{ v: "Time(Hr)", s: styleBlue },
			], // header
		]);
		// set taskOrigin
		var taskOrigin = {
			r: 1,
			c: 0,
		};
		var totalTime = 0;
		// Loops through each task
		for (const task of project.tasks) {
			XLSX.utils.sheet_add_aoa(
				projectWorksheet,
				[[{ v: task.name, s: styleYellow }]], // only write the task name in the task column for now
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
					[
						[
							timeentry.description,
							{ t: "n", v: exportTime(timeentry.duration) },
						],
					], // subtask, time
					{ origin: timeentryOrigin } // specify the origin of the data write
				);
				totalTime += Number(exportTime(timeentry.duration));
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
			[
				[
					{ v: "TOTAL:", s: styleYellow },
					{ v: "", s: styleYellow },
					{ v: totalTime, s: styleYellow },
				],
			],
			{ origin: taskOrigin }
		);
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
	await XLSXStyle.default.writeFile(
		wb,
		homedir() + "/Downloads/" + filename + ".xlsx"
	);
}
