export class toPrivate extends plugin {
  constructor () {
    super({
      name: '群聊转私聊',
      dsc: '适用于没有私聊功能的QQBot将群聊环境转换成私聊，请确保群聊环境可信',
      event: 'message',
      priority: -999999,
      rule: [
        {
          reg: '^#私聊',
          fnc: 'toPrivate'
        }
      ]
    })
  }

  async toPrivate (e) {
    this.e.isGroup = false
    this.e.friend = e.group
    this.e.msg = e.msg.replace(/^#私聊( )?/, '')
    return false
  }
}
