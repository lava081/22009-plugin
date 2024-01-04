export class example3 extends plugin {
  constructor () {
    super({
      name: '神秘指令',
      dsc: '适用于铃音插件全局MD',
      event: 'message',
      priority: -1000002,
      rule: [
        {
          reg: '',
          fnc: 'buttonCenter',
          log: false
        },
      ]
    })
  }
  
  async buttonCenter (e) {
    if(e.bot.config?.markdown && e.message.length == 1 && e.message[0].type == 'text' && e.message[0].text == '' ){
      this.e.msg = '#按钮中心'
    }
    return false
  }
}
