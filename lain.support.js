export default class Button {
  constructor() {
    this.plugin = {
      name: "状态",
      dsc: "状态",
      priority: 99,
      rule: [
        {
          reg: /^#?(功能统计|用户数量|dau)$/i,
          fnc: 'dau'
        },
        {
          reg: '^#?(身份|群组)查询',
          fnc: 'OpenIdtoId'
        },
        {
          reg: '^#?(id|ID)绑定',
          fnc: 'writeOpenid'
        },
        {
          reg: '^#?(id|ID)$',
          fnc: 'Id'
        },
      ]
    }
  }

  dau (e) {
    if (!e.isMaster) return false
    const button = [
      { label: '功能统计', data: `/功能统计` },
      { label: '用户数量', data: `/用户数量` },
      { label: '日活', data: `dau` },
    ]
    return Bot.Button(button)
  }

  OpenIdtoId (e) {
    const button = [
      [
        { label: '用户查询', data: `/身份查询` },
        { label: '群组查询', data: `/群组查询` },
      ],[
        { label: '用户绑定', data: `/id绑定` },
        { label: '用户解绑', data: `/id解绑` },
        { label: '用户ID', data: `${e.search_id}` },
      ]
    ]
    return Bot.Button(button)
  }
  
  writeOpenid () {
    return false
  }

  Id (e) {
    const button = [
      { label: '群聊ID', data: `${e.group_id}` },
      { label: '用户ID', data: `${e.user_id}` },
    ]
    return Bot.Button(button)
  }
}