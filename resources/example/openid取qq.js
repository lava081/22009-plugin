import User from '../22009-plugin/model/openid.js'
const prefix = '' //野生机器人前缀
const Delay_ms = 100 //指令延时
const group = Number(`goupId`) //触发的群聊
const QQBot_qq = {'self_id': Number('botqq')} //官方机器人qq号

/** 另外起一个监听器，直接源头监听QQBot */
Bot.on('message', async data => {
  if (data.self_id in QQBot_qq){
    const user_id = data.user_id
    const user = await User.User.findOne({ where: { user_id, self_id: data.self_id } })
    if (!user || user.qq == 8888)
      try{
        Bot.pickGroup(group).sendMsg([segment.at(QQBot_qq[data.self_id]),`自动转换qq号${user_id}`])
      } catch (error) {}}
  return
})

export class autoOpenIdtoId extends plugin {
  constructor () {
    super({
      name: '取qq号',
      dsc: '复读用户发送的内容，然后撤回',
      event: 'message',
      priority: -1000011,
      rule: [
        {
          reg: /^#?开始更新qq号$/i,
          fnc: 'sendOpenid',
        },
        {
          reg: '^#?对应关系',
          fnc: 'writeOpenid'
        },
        {
          reg: '^#?启动对应转换',
          fnc: 'startOpenid'
        },
        {
          reg: '^#?自动转换(qq|QQ)号',
          fnc: 'sendOpenid_auto',
        },
      ]
    })
    this.task = {
      name: '控制icqq发起转换',
      fnc: () => this.startOpenid(),
      cron: `0 2 * * *`
    }
  }

  async startOpenid () {
    for(let self_id in QQBot_qq){
      Bot.pickGroup(group).sendMsg([segment.at(QQBot_qq[self_id]),'开始更新qq号'])
      await sleep(5 * 60 * 1000)
    }
  }

  async sendOpenid_auto (e) {
    const openid = e.msg.replace(/^#?自动转换(qq|QQ)号/,'')
    await this.reply([`${prefix}对应关系\r${openid}`,segment.at(openid)])
  }

  async sendOpenid (e){
    const limit = 50  // 一次更新50个用户
    let today = new Date()
    const DATE = today.setDate(today.getDate() - 1)  // 固定更新前一天活跃的用户信息
    /** 固定根据日期和self_id筛选 */
    const where = { 
      DATE,  // 如果希望每次都更新全部用户，注释本行
      self_id: e.self_id 
    }
    const cnt = await  User.UserDAU.count({ where })  // 获取需要更新的数目
    for(let offset = 0; offset < cnt; offset += limit){  // offset为偏移量
      const users = await User.UserDAU.findAll({
        limit,
        offset,
        order: [ [ 'createdAt', 'DESC' ] ], // 按照createdAt字段降序排列
        where
      })
      let msg = [`${prefix}对应关系\r`]
      users.forEach(user => {
        msg.push(user.user_id)
        msg.push(segment.at(user.user_id))
      })
      await this.reply(msg)
      await sleep(Delay_ms)
    }
  }

  async writeOpenid (e) {
    for (let openid = 1; openid < e.message.length - 3; openid += 2) {
      const user_id = e.message[openid].text.replace(/(#|\/)?对应关系/, '').trim()
      const self_id = user_id.split('-')[0]
      const updatedData = {
        user_id,
        qq: Number(e.message[openid + 1].qq),
        nickname: e.message[openid + 1].text.replace(/^\@/, '').replace(/\\/g,''),
        self_id
      }
      User.UpdateUser(updatedData)
    }
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
