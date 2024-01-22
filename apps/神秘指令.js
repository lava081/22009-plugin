const msg = '使用前缀 #原神 和 #星铁 以及 #绝区 区分游戏\n如看不到本消息，请升级或更换NTQQ'
export class example3 extends plugin {
  constructor () {
    super({
      name: '按钮中心',
      dsc: '适用于铃音插件全局MD',
      event: 'message',
      priority: -1000002,
      rule: [
        {
          reg: '^#?按钮中心$',
          fnc: 'buttonCenter'
        },
        {
          reg: '',
          fnc: 'test',
          log: false
        },
      ]
    })
  }
  
  async test (e) {
    if( e.bot.config?.markdown )
      if( e.message.length == 1 && e.message[0].type == 'text' && e.message[0].text == '' ){
        this.e.msg = '#按钮中心'
        this.reply(msg)
      }
    return false
  }

  async buttonCenter (e) {
    this.reply(msg)
    return
  }
}
