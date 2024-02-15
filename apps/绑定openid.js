import User from '../model/openid.js'

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
          reg: '^#?用户数量',
          fnc: 'transformerCounter'
        },
      ]
    })
  }

  async transformerCounter (e) {
    const count = await User.User.count({ where: { self_id: e.self_id } })
    const countGroup = await User.Group.count({ where: { self_id: e.self_id } })
    const countDAU = await User.DAU.count()
    this.reply(`收录用户数: ${count}\n收录群组数: ${countGroup}\n收录天数(全局): ${countDAU}`)
    return false
  }

  async transformer (e) {
    let search_id  = e.msg.replace(/^#?身份查询/,'').trim()
    if (search_id == '') 
      search_id = e.user_id
    let openid = []
    // 构建查询条件
    let where
    if(Number(search_id)) {
      where = { qq: Number(search_id) }
    } else if(search_id.match(/^(\d{9})-/)) {
      where = { user_id: search_id }
    } else {
      where = { nickname: search_id }
    }
    await User.User.findAll({ where })
    .then(users => {
      users.forEach(user => {
        openid.push(user)
      })
    })
    
    if (openid.length == 0) 
      this.reply(`暂未收录`)
    else 
      for(const i in openid){
        await this.reply([`\r#查询结果\r\r>QQ: ${openid[i].qq}\r\r>昵称: ${openid[i].nickname}\r活跃群聊数: ${await User.UserGroups.count({ where: { user_id: openid[i].user_id }})}\r活跃天数: ${await User.UserDAU.count({ where: { user_id: openid[i].user_id }})}\r所属机器人: ${openid[i].self_id}\r\rUserID: ${openid[i].user_id}\r头像: `,segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${openid[i].qq}&spec=640&img_type=jpg`)])
        if ( i == 10 ){
          await this.reply(`重名${openid.length}人，显示前十人`)
          return false
        }
      }
    return false
  }

  async transformerGroup (e) {
    let search_id  = e.msg.replace(/^#?群组查询/,'').trim()
    if (search_id == '') 
      search_id = e.group_id
    // 构建查询条件
    let where = { group_id: search_id }
    
    const group = await User.Group.findOne({ where })
    
    if (!group) 
      this.reply(`暂未收录`)
    else 
      await this.reply([`\r#查询结果\r\rGroupID: ${group.group_id}\r\r>活跃用户数: ${await User.UserGroups.count({ where: { group_id: group.group_id }})}\r活跃天数: ${await User.GroupDAU.count({ where: { group_id: group.group_id }})}`])
  }

  async writeOpenid (e) {
    let nickname = e.msg.replace(/^#?(id|ID)绑定/,'').trim().replace(/^\d+/,'').trim()
    const qq = e.msg.replace(/^#?(id|ID)绑定/,'').replace(`${nickname}`,'').replace(/ /,'')
    if (qq == ''){
      this.reply(`指令: [/ID绑定+qq号+昵称] (mqqapi://aio/inlinecmd?command=${encodeURIComponent(`/ID绑定`)}&reply=true&enter=false)`)
      return false
    }
    const updatedData = {
      user_id: e.user_id,
      qq: Number(qq),
      nickname,
      self_id: e.self_id
    }
    await User.UpdateUser(updatedData)
    await this.reply(`绑定中,如需更换绑定信息，重新绑定即可`)
    e.msg = `#身份查询${e.user_id}`
    this.transformer (e)
  }

  async deleteOpenid (e) {
    const user = await User.User.findOne({ where: { user_id: e.user_id } })
    if (user) {
      await user.destroy()
      await this.reply (`成功解绑`)
    } else {
      await this.reply (`未找到绑定信息`)
    }
  }
}
