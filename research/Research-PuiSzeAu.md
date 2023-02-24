# Research on Timesheet Automation

## Research
1. Downloaded the Clockify extension and tried to use Clockify on VS Code, and view data on Clockify webpage, just to get familiar with Clockify.
2. Researched ways to export the data automatically
  - Clockify export
  - Google Sheet
3. Explored Clockify and its API by Node.js
  ```
  let reqUrl = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/projects`;
  var response = await fetch(
    reqUrl,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "X-Api-Key": process.env.CLOCKIFY_CLIENT_ID
      }
    }
  );
  return await response.json();
  ```

## Idea
1. Export Clockify data into Excel
2. Clockify API