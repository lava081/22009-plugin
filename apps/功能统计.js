import Openid from '../model/openid.js'
/** 计算天数 */
const calcDays = 7
export class FunctionCounter extends plugin {
  constructor () {
    super({
      name: '功能统计',
      dsc: 'FncCnt',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?功能统计$',
          fnc: 'calc',
          permission: 'master'
        }
      ]
    })
  }

  async calc (e) {
    /** 实际发送的消息 */
    let msg = ''
    /** 功能列表 */
    const FncCnt = []
    /** 日期列表 */
    const dates = []

    /** 获取日期列表 */
    await Openid.DAU.findAll({ order: [['DATE', 'DESC']], limit: calcDays })
      .then((days) => {
        days.forEach((day) => {
          dates.push(day.DATE)
        })
      })

    msg += `\r#${dates.length}日功能统计\r`

    /** 获取功能列表 */
    await Openid.Fnc.findAll()
      .then(async (fncs) => {
        for (const fnc of fncs) {
          const logFnc = fnc.logFnc.replace(/_/g, '-').replace(/\[/g, '(').replace(/\]/g, ')')
          let cnt = 0
          for (const DATE of dates) {
            cnt += await Openid.UserFnc.count({ where: { DATE, logFnc: fnc.logFnc, self_id: e.self_id } })
          }
          FncCnt.push({ logFnc, cnt })
        }
      })

    // 按照count从大到小进行排序
    FncCnt.sort((a, b) => b.cnt - a.cnt)
    for (let i = 0; i < FncCnt.length && i < 25; i++) {
      msg += `\r>${i + 1}.${FncCnt[i].logFnc}:  ${FncCnt[i].cnt}人`
    }

    await this.reply(msg)
  }
}
