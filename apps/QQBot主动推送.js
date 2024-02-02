import fs from 'fs'
import yaml from 'yaml'
import chokidar from 'chokidar'
const rootPath = `./plugins/22009-plugin/config`
const Path = `${rootPath}/config/msg.json`
let msg = ''
const group = new Set()

if (fs.existsSync(Path)) {
  msg = JSON.parse(fs.readFileSync(Path, 'utf8'))
}
try {
  const watcher = chokidar.watch(Path)

  watcher.on('change', async () => {
    await sleep(1500)
    msg = JSON.parse(fs.readFileSync(Path, 'utf8'))
    logger.mark(`[QQBot主动推送]${Path}成功重载`)
  })

  watcher.on('error', (error) => {
    logger.error(`[QQBot主动推送]发生错误: ${error}`)
    watcher.close()
  })
} catch (err) {
  logger.error(err)
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class QQBotVoluntarilyPush extends plugin {
  constructor() {
    super({
      name: "QQBot主动推送",
      dsc: "适配铃音，需配合22009自带的dau，主动消息有限，且用且珍惜",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: "^#?(预览)?主动推送$",
          fnc: "play",
          permission: "master",
        },
      ]
    })
  }

  async play (e) {
    if (msg == '')
      return e.reply(`未配置${Path}`)
    const message = [
      {
        type: 'markdown', // 这里添加多一个类型，其他按照官方文档来。
        custom_template_id: e.bot.config.markdown.id,
        params: msg.msg
      },Bot.Button(msg.button)
    ]
    
    let yamlPath = './plugins/22009-plugin/data/group_id.yaml'
    const today = new Date().toLocaleDateString()
    let group_list = yaml.parse(fs.readFileSync(yamlPath, 'utf8'))
    group_list = group_list[today]
    for (let item of group_list) 
      group.add(item)
    // yamlPath = './plugins/hanhan-plugin/config/config.json'
    // group_list = yaml.parse(fs.readFileSync(yamlPath, 'utf8'))
    // group_list = group_list.buttonWhiteGroups
    // for (let item of group_list) 
    //   group.add(item)

    if (e.msg.match(/预览/)) 
      this.passive_send(e, msg, message)
    else
      this.active_send(e, msg, message)
  }

  async passive_send(e, msg, message) {
    await e.reply(message)
    await sleep(Math.floor(Math.random()*10000)+1000)
    await Bot.pickGroup(msg.notice).sendMsg(`目标群聊:${group.size}群`)
    for (const openid of group) {
      logger.info(openid)
    }
    logger.info(msg.ignore_group)
  }

  async active_send(e, msg, message) {
    const success_group = []
    for (const openid of group){
      if(!(msg.ignore_group.includes(openid)))
        try{
          Bot[e.self_id].pickGroup(openid).sendMsg(message)
          await sleep(100)
          success_group.push(openid)
        }catch(error){}
    }
    await Bot.pickGroup(msg.notice).sendMsg(`总：${group.size}群\n发送完成：${success_group.length}群`)
  }
}