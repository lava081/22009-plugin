import Openid from '../model/openid.js'

const calcDays = 30 // 计算天数
const days = 7 // 显示天数

/** 另外起一个监听器，直接源头监听QQBot */
Bot.on('message', async data => {
  if (data.adapter == 'QQBot') {
    Openid.addUserToGroup(data.user_id, data.group_id, data.self_id)
  }
})

export class dau extends plugin {
  constructor () {
    super({
      name: 'dau',
      dsc: 'dau',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: /^#?dau$/i,
          fnc: 'dau_read'
        }
      ]
    })
  }

  async dau_read (e) {
    const today = await Openid.getLocaleDate(new Date())
    let msg = `当前日期: ${today}\r#日活统计\r\r>`
    const dates = []
    const order = [['DATE', 'DESC']]

    /** 获取日期列表 */
    const daysDAU = await Openid.DAU.findAll({ order, limit: calcDays })
    daysDAU.forEach((day) => {
      dates.push(day.DATE)
    })

    let UsersCnt = 0
    let GroupsCnt = 0
    for (var date in dates) {
      const UsersToday = await Openid.UserDAU.count({ where: { DATE: dates[date], self_id: e.self_id } })
      const GroupsToday = await Openid.GroupDAU.count({ where: { DATE: dates[date], self_id: e.self_id } })
      if (Number(date)) {
        UsersCnt += UsersToday
        GroupsCnt += GroupsToday
      }
      if (Number(date) < days) { msg += `${dates[date]}:  ${UsersToday}人  ${GroupsToday}群\r` }
    }

    msg += `\r${date}日平均:  ${Math.floor(UsersCnt / date)}人  ${Math.floor(GroupsCnt / date)}群`

    await this.reply(msg)
  }
}
