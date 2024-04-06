import Openid from '../model/openid.js'
import { Op } from 'sequelize'

/** 24小时前 */
let DATE = new Date()
DATE.setDate(DATE.getDate() - 1)
DATE = DATE.toISOString()

export class OpenIdtoId extends plugin {
  constructor () {
    super({
      name: '绑定qq号',
      dsc: '供QQBot用户绑定自己的信息',
      event: 'message',
      priority: -1000012,
      rule: [
        {
          reg: '^#?(id|ID)绑定',
          fnc: 'writeOpenid'
        },
        {
          reg: /^#?id解绑$/i,
          fnc: 'deleteOpenid'
        },
        {
          reg: '^#?身份查询',
          fnc: 'transformer'
        },
        {
          reg: '^#?群组查询',
          fnc: 'transformerGroup'
        },
        {
          reg: '^#?身份数量',
          fnc: 'transformerCounter'
        }
      ]
    })
  }

  async transformerCounter (e) {
    let where
    where = { self_id: e.self_id }
    const total = {
      User: await Openid.User.count({ where }),
      Group: await Openid.Group.count({ where }),
      DAU: await Openid.DAU.count()
    }
    where = {
      self_id: e.self_id,
      createdAt: {
        [Op.gte]: DATE
      }
    }
    const yesterday = {
      User: await Openid.User.count({ where }),
      Group: await Openid.Group.count({ where })
    }

    this.reply(`>收录用户数: ${total.User}  (24h新增: ${yesterday.User})\n收录群组数: ${total.Group}  (24h新增: ${yesterday.Group})\n收录天数: ${total.DAU}`)
    return false
  }

  async transformer (e) {
    let search_id = e.msg.replace(/^#?身份查询/, '').trim()
    if (search_id == '') { search_id = e.user_id }
    let openid = []
    // 构建查询条件
    let where
    if (Number(search_id)) {
      where = { qq: Number(search_id) }
    } else if (search_id.match(/^(\d{9})-/)) {
      where = { user_id: search_id }
    } else {
      where = { nickname: search_id }
    }
    await Openid.User.findAll({ where, limit: 10 })
      .then(async users => {
        for (const user of users) {
          openid.push(user)
          this.e.search_id = user.user_id
          await this.reply([`\r#查询结果\r\r>QQ: ${user.qq}\r\r>昵称: ${user.nickname}\r活跃群聊数: ${await Openid.UserGroups.count({ where: { user_id: user.user_id } })}\r活跃天数: ${await Openid.UserDAU.count({ where: { user_id: user.user_id } })}\r所属机器人: ${user.self_id}\r\rUserID: ${user.user_id}\r头像: `, segment.image(`https://q.qlogo.cn/qqapp/${user.user_id.replace('-', '/')}/0`)])
          if (openid.length >= 10) {
            await this.reply(`重名${await Openid.User.count({ where })}人，显示前十人`)
            return false
          }
        }
      })

    if (openid.length == 0) { this.reply('暂未收录') }
  }

  async transformerGroup (e) {
    const openid = []
    let search_id = e.msg.replace(/^#?群组查询/, '').trim()
    if (search_id == '') { search_id = e.group_id }
    // 构建查询条件
    let where = { group_id: search_id }
    if (Number(search_id)) {
      where = { qq: Number(search_id) }
    }

    await Openid.Group.findAll({ where })
      .then(async groups => {
        for (const group of groups) {
          this.e.search_id = group.group_id
          openid.push(group)
          const msg = [`\r#查询结果\r\rGroupID: ${group.group_id}\r\r>QQ: ${group.qq}\r\r>用户数: ${await Openid.UserGroups.count({ where: { group_id: group.group_id } })}人\r新增群员: ${await Openid.UserGroups.count({ where: { group_id: group.group_id, createdAt: { [Op.gte]: DATE } } })}人\r活跃天数: ${await Openid.GroupDAU.count({ where: { group_id: group.group_id } })}`]
          if (group.qq) msg.push(segment.image(`https://p.qlogo.cn/gh/${group.qq}/${group.qq}/0`))
          await this.reply(msg)
        }
      })

    if (openid.length === 0) { await this.reply('暂未收录') }
  }

  async writeOpenid (e) {
    let nickname = e.msg.replace(/^#?(id|ID)绑定/, '').trim().replace(/^\d+/, '').trim()
    const qq = e.msg.replace(/^#?(id|ID)绑定/, '').replace(`${nickname}`, '').replace(/ /, '')
    if (qq == '') {
      this.reply(`指令: [/ID绑定+qq号+昵称] (mqqapi://aio/inlinecmd?command=${encodeURIComponent('/ID绑定')}&reply=true&enter=false)`)
      return false
    }
    const updatedData = {
      user_id: e.user_id,
      qq: Number(qq),
      nickname,
      self_id: e.self_id
    }
    await Openid.UpdateUser(updatedData)
    await this.reply('绑定中,如需更换绑定信息，重新绑定即可')
    e.msg = `#身份查询${e.user_id}`
    this.transformer(e)
  }

  async deleteOpenid (e) {
    const user = await Openid.User.findOne({ where: { user_id: e.user_id } })
    if (user) {
      await user.destroy()
      await this.reply('成功解绑')
    } else {
      await this.reply('未找到绑定信息')
    }
  }
}
