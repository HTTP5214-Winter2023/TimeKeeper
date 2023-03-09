var XLSX = require("xlsx");

function createExcel(filename) {
	// create excel workbook
	const wb = XLSX.utils.book_new();
	// create an empty sheet using an empty array
	var worksheet = XLSX.utils.aoa_to_sheet([]);
	// add the sheet to the workbook
	XLSX.utils.book_append_sheet(wb, worksheet, "sheet 1");
	// create the excel file with the input filename
	XLSX.writeFile(wb, filename);
}
