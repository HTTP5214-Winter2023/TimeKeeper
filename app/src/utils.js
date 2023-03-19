import fs from 'fs'

const DEFAULT_API_DATA = {
    API_KEY: "",
    WORKSPACE_ID: "",
    USER_ID: "",
    USERNAME: ""
}

export async function readApiConfig() {
    let data;
    try {
        data = JSON.parse(await fs.promises.readFile( "config.json", "utf8"))
    } catch (err) {
        data = DEFAULT_API_DATA;
        await writeApiConfig(data);
    };
    return data;
};

export async function writeApiConfig(config) {
    await fs.promises.writeFile("config.json", JSON.stringify(config, null, 2), function () {});
};

// change duration format 'PT1H4M' to '01:04'
export function formatDuration(durationStr) {
    if (!durationStr) {
      return "N/A";
    }
    var duration = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/g.exec(durationStr);
    var hours = parseInt(duration[2]) || 0;
    var minutes = parseInt(duration[3]) || 0;
    var timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return timeString;
  }
  
  // change startTime || endTime format '2023-03-14T01:49:59Z' to '2023-03-14 01:49:59'
    export function timeConvert(dateString) {
    if (!dateString) {
      return "N/A";
    }
    var date = dateString.slice(0, 10);
    var time = dateString.slice(11, 19);
    return date +" "+ time;
  }



  export function formatClockifyTimeToRoundedDecimalTime(time) {
    const [hours, minutes] = time.split(':').map(Number); // split time into hours and minutes
    const totalMinutes = hours * 60 + minutes; // convert hours to minutes and add to minutes
    const decimalTime = totalMinutes / 60; // convert total minutes to decimal time
    const roundedDecimalTime = Math.ceil(decimalTime * 4) / 4; // round decimal time up to nearest quarter-hour
    return roundedDecimalTime.toFixed(2); // format decimal time to two decimal places
  }

  export function exportTime(timeString){
    var duration = formatDuration(timeString);
    var decimalTimeByQuarter = formatClockifyTimeToRoundedDecimalTime(duration) ;
    return decimalTimeByQuarter;
  }


  








