import Openid from '../model/openid.js'

Bot.QQToOpenid = async function (qq, e, type = 'user') {
  switch (type) {
    case 'user': {
      if (!(typeof qq === 'number')) break
      const user = await Openid.User.findOne({ where: { qq, self_id: e.self_id } })
      if (user) {
        qq = user.user_id
      }
      break
    }
    case 'group': {
      if (!(typeof qq === 'number')) break
      const group = await Openid.Group.findOne({ where: { qq, self_id: e.self_id } })
      if (group) {
        qq = group.group_id
      }
      break
    }
  }
  qq = qq.trim().split('-')
  qq = qq[1] || qq[0]
  return qq
}

export class giveNickname extends plugin {
  constructor () {
    super({
      name: '补参数',
      dsc: '根据数据库补充e的内容',
      event: 'message',
      priority: -1000012,
      rule: [
        {
          reg: '@',
          fnc: 'segmentAt',
          log: false
        },
        {
          reg: '',
          fnc: 'giveNickname',
          log: false
        }
      ]
    })
  }

  async segmentAt (e) {
    if (e.adapter == 'QQBot') {
      if (e.group) {
        const qq = e.msg.split('@')
        qq.shift()
        for (let i in qq) {
          let user
          if (Number(qq[i])) {
            user = await Openid.User.findOne({ where: { qq: qq[i], self_id: e.self_id } })
          } else {
            user = await Openid.User.findOne({ where: { nickname: qq[i], self_id: e.self_id } })
          }
          if (user && user.qq != 8888) {
            this.e.msg = e.msg.replace(`@${qq[i]}`, '')
            this.e.message[0].text.replace(`@${qq[i]}`, '')
            this.e.message.push({ type: 'at', qq: user.qq, text: user.nickname })
          }
        }
      }
      return false
    }
  }

  async giveNickname (e) {
    if (e.adapter == 'QQBot') {
      const group = await Openid.Group.findOne({ where: { group_id: e.group_id } })
      if (group && group.qq) {
        this.e.group_id = group.qq
      }
      const user = await Openid.User.findOne({ where: { user_id: e.user_id } })
      if (user && user.qq != 8888) {
        this.e.sender.user_id = user.qq
        this.e.sender.nickname = user.nickname
        this.e.sender.card = user.nickname
        this.e.user_id = user.qq
        this.e.author.id = user.qq
      }
      this.e.group.getMemberMap = async () => await this.getMemberMap(e.group_id)
    }
    return false
  }

  async getMemberMap (group_id) {
    let group_Member = new Map()
    let member_list
    let group
    try {
      if (typeof group_id === 'number') {
        group = await Openid.Group.findOne({ where: { qq: group_id, self_id: this.e.self_id } })
      } else {
        group = await Openid.Group.findByPk(group_id)
      }
      member_list = await group.getUsers({})
    } catch (error) {
      Promise.reject(new Error('22009获取成员失败'))
    }
    member_list.forEach(user => {
      if (!user.qq || user.qq == 8888) user.qq = user.user_id
      group_Member.set(user.qq, {
        group_id,
        user_id: user.qq,
        user_openid: user.user_id,
        nickname: user.nickname,
        card: '',
        sex: 'unknown',
        age: 0,
        area: '',
        join_time: Math.floor(user.createdAt.getTime() / 1000),
        last_sent_time: Math.floor(user.updatedAt.getTime() / 1000),
        level: 1,
        role: 'member',
        unfriendly: true,
        title: '',
        title_expire_time: 0,
        shutup_time: 0,
        update_time: 0,
        card_changeable: false,
        uin: user.self_id
      })
    })
    return group_Member
  }
}
