const mysql = require('@models')
const axios = require('axios')

const isWeekday = async (date) => {
    const tmpDay = date.getDay()
    return (tmpDay > 0 && tmpDay < 6)
}

const lPadding = (d) => {
    if (d >= 10) {
        return d;
    }
    return `0${d}`;
}

const toFormatString = (date, delimiter = '') => {
    const year = date.getFullYear();
    const month = lPadding(date.getMonth() + 1);
    const day = lPadding(date.getDate());

    return [year, month, day].join(delimiter);
}

const isDayOff = (date) => {
    const targetDay = toFormatString(date)
    const found = (await HOLIDAYS.findOne({
        where: {
            DATE: targetDay,
        },
    })) || null

    if (found === null) {
        return {
            dayoff: false
        }
    }

    return {
        dayoff: true
    }
}

exports.todayOff = async () => {
    const today = new Date()
    if (isWeekday(today)) {
        return isDayOff(today)
    }

    return {
        dayoff: true
    } 
}

exports.tommorrowOff = async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (isWeekday(tomorrow)) {
        return isDayOff(today)
    }

    return {
        dayoff: true
    } 
}

exports.someDayOff = async (someday) => {
    return {}
}

exports.startDailyScrum = async () => {
    const { HOLIDAYS } = mysql

    const today = new Date()
    if (isWeekday(today)) {
        const targetDay = toFormatString(today)
        const found = (await HOLIDAYS.findOne({
            where: {
                DATE: targetDay,
            },
        })) || null
        if (found === null) {
            const message = {
                channel: '/* 채널명 입력 */',
                username: '/* 메세지 전달 할 사용자 이름 */',
                icon_emoji: ':ghost:',
                text: `${today.toLocaleString()} 오늘의 스크럼 시작!!!!!`
            }
            const res = await axios.post('/* slack Hook url */',
                    JSON.stringify(message), {
                    headers: {
                        'Content-Type': 'application/json',
                    }})
        }
    } else {
        __logger(`${today.toLocaleString()} is day-off.`)
    }
    
}

exports.syncHolidayInfo = async () => {
    const { sequelize, HOLIDAYS } = mysql
    const loopMonth = ['01','02','03','04','05','06','07','08','09','10','11','12']
    try {
        const nowTime = new Date()
        const loopYear = [nowTime.getFullYear(), nowTime.getFullYear() + 1]
        const t = await sequelize.transaction()
                    
        await HOLIDAYS.destroy({
            where: {},
            truncate: t
        })

        loopYear.forEach(year => {
            loopMonth.forEach(async month => {
                const res = await axios.get('http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo',
                { params: {
                    solYear: year,
                    solMonth: month,
                    ServiceKey: '/* OPEN API 서비스 토큰 */',
                    _type: 'json',
                    numOfRows: 50
                }})

                if (res.status === 200) {
                    if (res.data.response.body.totalCount > 0) {
                        if (res.data.response.body.totalCount === 1) {
                            const aday = res.data.response.body.items.item
                            __logger(aday)
                            if(aday.isHoliday === 'Y') {
                                await HOLIDAYS.create({
                                    DATE: aday.locdate,
                                    NAME: aday.dateName
                                },
                                {
                                    truncate: t
                                })
                            }
                        } else {
                            res.data.response.body.items.item.forEach(async e => {
                                __logger(e)
                                if(e.isHoliday === 'Y') {
                                    await HOLIDAYS.create({
                                        DATE: e.locdate,
                                        NAME: e.dateName
                                    },
                                    {
                                        truncate: t
                                    })
                                }
                                
                            })
                        }
                        
                    }
                }
            })
        })
        
        await t.commit()
    } catch (e) {
        __logger(e)
        await t.rollback()
    } finally {

        __logger('sync done.')
    }
}

