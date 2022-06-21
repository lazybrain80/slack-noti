const schedule = require('node-schedule')
const { syncHolidayInfo, startDailyScrum } = require('@controllers')
//0 3 * * 0
const holidaySync = schedule.scheduleJob('0 3 * * 0', function(){
    __logger(`launch holiday sync: ${new Date().toLocaleString()}`)
    syncHolidayInfo()

})

//0 8 * * 1-5
//*/1 * * * *
const dailyScrum = schedule.scheduleJob('0 8 * * 1-5', function(){
    __logger(`start daily scrum: ${new Date().toLocaleString()}`);
    startDailyScrum()
})