import Openid from '../model/openid.js'

Bot.QQToOpenid = async function (qq, e) {
  const user = await Openid.User.findOne({ where: { qq, self_id: e.self_id } })
  if (user && user.qq != 8888) {
    qq = user.user_id
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
      const qq = e.msg.split('@')
      qq.shift()
      for (let i in qq) {
        this.e.msg = e.msg.replace(`@${qq[i]}`, '')
        this.e.message[0].text.replace(`@${qq[i]}`, '')
        if (Number(qq[i])) {
          const user = await Openid.User.findOne({ where: { qq: qq[i], self_id: e.self_id } })
          const nickname = user ? user.nickname : ''
          this.e.message.push({ type: 'at', qq: Number(qq[i]), text: nickname })
        } else {
          const user = await Openid.User.findOne({ where: { nickname: qq[i], self_id: e.self_id } })
          if (user && user.qq != 8888) {
            this.e.message.push({ type: 'at', qq: user.qq, text: user.nickname })
          }
        }
      }
    }
    return false
  }

  async giveNickname (e) {
    if (e.adapter == 'QQBot') {
      Bot[e.self_id].pickGroup = async (group_id) => await this.pickGroup(e.self_id, group_id)
      this.e.group = Bot[e.self_id].pickGroup
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
    }
    return false
  }

  async pickGroup (self_id, group_id) {
    let ret
    if (typeof group_id === 'number') {
      const group = await Openid.Group.findOne({ where: { qq: group_id } })
      ret = Bot[self_id].pickGroup(group.group_id)
      ret.getMemberMap = async () => await this.getMemberMap(group.group_id)
    } else {
      ret = Bot[self_id].pickGroup(group_id)
      ret.getMemberMap = async () => await this.getMemberMap(group_id)
    }
    return ret
  }

  async getMemberMap (group_id) {
    let group_Member = new Map()
    let member_list
    try {
      const group = await Openid.Group.findByPk(group_id)
      member_list = await group.getUsers({})
    } catch (error) {
      Promise.reject(new Error('22009获取成员失败'))
    }
    member_list.forEach(user => {
      if (user && user.qq != 8888) {
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
      }
    })
    return group_Member
  }
}
