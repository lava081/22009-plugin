let ignone_qq = []// 手工过滤的机器人
export class ignore_bot extends plugin {
  constructor () {
    super({
      name: 'ignore_bot',
      dsc: '手工过滤机器人',
      event: 'message',
      priority: -1000010,
      rule: [
        {
          reg: '',
          fnc: 'ignore_bot',
          log: false
        },
        {
          reg: '^#?看QQ号',
          fnc: 'check_id',
          log: false
        }
      ]
    })
  }

  async ignore_bot (e) {
    if (ignone_qq.includes(e.at));

    // 按号码段过滤群机器人
    else if ((e.at > 2854000000 && e.at < 2855000000));
    else if ((e.at > 3889000000 && e.at < 3890000000));
    else return false
  }

  async check_id (e) {
    let qq = e.at || e.sender?.user_openid || e.sender?.user_id
    qq = String(qq)
    await e.reply(qq)
  }
}
