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

/* button文件参考 */
/*
export default class Button {
  constructor() {
    this.plugin = {
      name: "按钮中心",
      dsc: "按钮中心",
      priority: 100,
      rule: [
        {
          reg: '^#按钮中心$',
          fnc: 'buttonCenter'
        }
      ]
    }
  }
  async buttonCenter(e){
    const list = [
      [
        { label: '绑定uid', data: `/原神绑定` },
        { label: '扫码登录', data: `/扫码登录` }, 
        { label: '更新面板', data: `/原神更新面板` },
      ],[
        { label: '体力', data: `/原神体力` },
        { label: '签到', data: `/原神签到` },
        { label: '深渊', data: `/喵喵深渊` },
        { label: '转生', data: `/转生` },
      ],[
        { label: '今日素材', data: `/今日素材` },
        { label: '帮助', data: `/帮助` },
        { label: '模拟抽卡', data: `/十连` },
        { label: '推荐群聊', enter: true}
      ]
    ]
    return Bot.Button(list)
  }
}
*/