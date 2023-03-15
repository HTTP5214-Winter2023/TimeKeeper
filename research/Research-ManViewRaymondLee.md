# Research on Timesheet Automation

## Research

1. Track time with Clockify on VS Code
2. How to create excel file using javascript, [example](https://code-boxx.com/create-excel-file-javascript/)
3. Check [Clockify API documentation](https://clockify.me/developers-api) to see what API calls might be useful. GET /User and GET /workspaces/{workspaceId}/user/{userId}/time-entries seem to match our needs.
4. Make API calls to clockify to retrieve the time tracked

```
const workspaceId = "63ecf21dcf0b257026be1780";
const baseUrl = "https://api.clockify.me/api/v1";
const APIKey = "YmJjYTYzYTAtNzM0NS00ZDgzLTkzN2YtYmJmMDk3NGI1YWVl";
const userId = "63ecf21dcf0b257026be177f";

async function getLoggedInUser() {
	const reqUrl = `${baseUrl}/user`;
	var response = await fetch(reqUrl, {
		method: "GET",
		headers: {
			"content-type": "application/json",
			"X-Api-Key": APIKey,
		},
	});
	return await response.json();
}

async function getTimeEntries() {
	const reqUrl = `${baseUrl}/workspaces/${workspaceId}/user/${userId}/time-entries`;
	var response = await fetch(reqUrl, {
		method: "GET",
		headers: {
			"content-type": "application/json",
			"X-Api-Key": APIKey,
		},
	});
	return await response.json();
}

async function print() {
	let userInfo = await getLoggedInUser();
	let timeEntriesInfo = await getTimeEntries();
	// console.log(userInfo);
	console.log(timeEntriesInfo);
}

print();
```

5. Research on what nodejs module (sheetjs/exceljs/xlsx) should be used for maniplulating excel files, xlsx is used because it is the most recently updated and has the most amount of downloads
6. Reading xlsx documentation on how to create excel file and log data in specific format

## Idea

1. Write the data in excel file in a specific format requried by Bernie
2. Go for the excel file instead of google sheet
