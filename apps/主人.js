import Cfg from '../../../lib/config/config.js'
export class find_Master extends plugin {
  constructor () {
    super({
      name: '找主人',
      dsc: '帮走丢的机器人找到回家的路',
      event: 'message',
      priority: -1000,
      rule: [
        {
          reg: '^#?你主人是谁$',
          fnc: 'like'
        }
      ]
    })
  }

  async like (e) {
    const msg = []
    msg.push('我的主人是')
    for (let master of Cfg.masterQQ) {
      switch (e?.adapter) {
        case undefined:
        case 'LagrangeCore':
        case 'shamrock': if (typeof master == 'number') msg.push(segment.at(+master)); break
        case 'WeXin':
        case 'ComWeChat': if (typeof master == 'string' && master.match(/^wxid_/)) msg.push(segment.at(master)); break
        case 'QQGuild': if (typeof master == 'string' && master.match(/^qg_/)) msg.push(segment.at(master)); break
        case 'QQBot': if (typeof master == 'string' && master.match(`${e.self_id}-`)) msg.push(segment.at(master)); break
        default: break
      }
    }
    if (msg == '我的主人是') { await this.reply('暂无主人或不支持的适配器') } else { await this.reply(msg) }
  }
}
