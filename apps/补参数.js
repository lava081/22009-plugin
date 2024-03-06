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
}
