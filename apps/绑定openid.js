import User from '../model/openid.js'

Bot.QQToOpenid = async function (qq, e) {
  const user = await User.User.findOne({ where: { qq, self_id: e.self_id } })
  if (user) {
    qq = user.user_id
  }
  qq = qq.trim().split('-')
  qq = qq[1] || qq[0]
  return qq
}

export class OpenIdtoId extends plugin {
  constructor () {
    super({
      name: '绑定qq号',
      dsc: '复读用户发送的内容，然后撤回',
      event: 'message',
      priority: -1000012,
      rule: [
        {
          reg: '^#?(id|ID)绑定',
          fnc: 'writeOpenid'
        },
        {
          reg: '^#?身份查询',
          fnc: 'transformer'
        },
        {
          reg: '^#?用户数量',
          fnc: 'transformerCounter'
        },
        {
          reg: "",
          fnc: "giveNickname",
          log: false
        },
      ]
    })
  }

  async giveNickname (e) {
    if (e.adapter == 'QQBot') {
      const user = await User.User.findOne({ where: { user_id: e.user_id } })
      if(user) {
        this.e.sender.user_id = user.qq
        this.e.sender.nickname = user.nickname
        this.e.sender.card = user.nickname
        this.e.user_id = user.qq
      }
    }
    return false
  }

  async transformerCounter (e) {
    const count = await User.User.count({ where: { self_id: e.self_id } })
    this.reply(`收录用户数: ${count}`)
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
        await this.reply([`\r#查询结果\r\r>QQ: ${openid[i].qq}\r\r>昵称: ${openid[i].nickname}\r所属机器人: ${openid[i].self_id}\r\rUserID: ${openid[i].user_id}\r头像: `,segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${openid[i].qq}&spec=640&img_type=jpg`)])
        if ( i == 10 ){
          await this.reply(`重名${openid.length}人，显示前十人`)
          return false
        }
      }
    return false
  }

  async writeOpenid (e) {
    let nickname = e.msg.replace(/^#?(id|ID)绑定/,'').replace(/^\d+/,'').trim()
    const qq = e.msg.replace(/^#?(id|ID)绑定/,'').replace(`${nickname}`,'').replace(/ /,'')
    if (qq == ''){
      this.reply(`请输入qq号和昵称`)
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
}
