import User from '../model/openid.js'

Bot.QQToOpenid = async function (qq, e) {
  const user = await User.User.findOne({ where: { qq, self_id: e.self_id } })
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
          fnc: 'segmentAt'
        },
        {
          reg: "",
          fnc: "giveNickname",
          log: false
        },
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
          const user = await User.User.findOne({ where: { qq: qq[i], self_id: e.self_id } })
          const nickname = user ? user.nickname : ''
          this.e.message.push({type: 'at', qq: Number(qq[i]), text: nickname})
        } else {
          const user = await User.User.findOne({ where: { nickname: qq[i], self_id: e.self_id } })
          if (user && user.qq != 8888) {
            this.e.message.push({type: 'at', qq: user.qq, text: user.nickname})
          }
        }
      }
    }
    return false
  }

  async giveNickname (e) {
    if (e.adapter == 'QQBot') {
      const user = await User.User.findOne({ where: { user_id: e.user_id } })
      if(user && user.qq != 8888) {
        this.e.sender.user_id = user.qq
        this.e.sender.nickname = user.nickname
        this.e.sender.card = user.nickname
        this.e.user_id = user.qq
        this.e.author.id = user.qq
        /** 获取对应用户头像 */
        this.e.getAvatarUrl = (size = 0, id = user.qq) => `https://q1.qlogo.cn/g?b=qq&s=${size}&nk=${id}`
        this.e.group.pickMember = (userId) => {
          return this.pickMember(userId)
        }
      }
    }
    return false
  }

  pickMember (userID) {
    return {
      member: this.member(userID),
      getAvatarUrl: (size = 640,id = userID) => `https://q1.qlogo.cn/g?b=qq&s=${size}&nk=${id}`
    }
  }

  member (userId) {
    const member = {
      info: {
        group_id: this.e.group_id,
        user_id: userId,
        nickname: '',
        last_sent_time: ''
      },
      group_id: this.e.group_id,
      is_admin: false,
      is_owner: false,
      /** 获取头像 */
      getAvatarUrl: (size = 640,id = userId) => `https://q1.qlogo.cn/g?b=qq&s=${size}&nk=${id}`,
      mute: async (time) => ''
    }
    return member
  }
}
