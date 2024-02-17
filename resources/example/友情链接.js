export class example extends plugin {
  constructor() {
    super({
      name: '友情链接',
      dsc: '友情链接',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?友情链接',
          fnc: 'yqlj',
        },
      ],
    });
  }

  async yqlj(e) {
    if(!e.bot.config.markdown?.id)
      return
    const buttons = [
      [
        { label: 'Bailu-Bot', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854210584&robot_appid=102049088` },
        { label: '风间菜菜', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=3889000138&robot_appid=102072007` },
        { label: '喵喵喵拳', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_appid=102070541&robot_uin=2854204877` },
      ],
      [
        { label: '泡泡泡泡', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854201052&robot_appid=102056968` },
        { label: '原事通', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854208988&robot_appid=102074120` },
        { label: '圆环之理', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=3889000418&robot_appid=102072389` },
      ],
      [
        { label: '小吉祥草王呀', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854200865&robot_appid=102057294` },
        { label: '回家照顾驮兽', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854216359&robot_appid=102073196` },
      ],
      [
        { label: '鱼鱼枕邦邦', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=3889000431&robot_appid=102072401` },
        { label: '纳西妲Nahida', link: `https://web.qun.qq.com/qunrobot/data.html?robot_uin=3889000417` },
      ],
      [
        { label: '憨憨Bot', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854203740&robot_appid=102051169` },
        { label: '依涵Bot', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854211146&robot_appid=102056754` },
        { label: '珊珊', link: `https://qun.qq.com/qunpro/robot/qunshare?robot_uin=3889004815&robot_appid=102081872` },
      ],
    ]
    await this.reply([e.msg, Bot.Button(buttons)])
    return true
  }

}
