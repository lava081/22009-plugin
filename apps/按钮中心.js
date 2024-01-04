const msg = segment.image('base64://UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAD8D+JaQAA3AA/ua1AAA=')
export class example3 extends plugin {
    constructor () {
      super({
        name: '按钮中心',
        dsc: '适用于铃音插件全局MD',
        event: 'message',
        priority: -1000001,
        rule: [
          {
            reg: '^#按钮中心$',
            fnc: 'buttonCenter'
          }
        ]
      })
    }
    
  async buttonCenter () {
      this.reply(msg)
      return false
    }
}