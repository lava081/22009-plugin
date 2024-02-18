import fs from 'fs'
import chokidar from 'chokidar'
import User from '../model/openid.js'
const rootPath = `./plugins/22009-plugin/config`
const Path = `${rootPath}/config/msg.json`
let msg = ''

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

    if (e.msg.match(/预览/)) 
      this.passive_send(e, msg)
    else
      this.active_send(e, msg)
    return
  }

  async passive_send(e, msg) {
    e.reply([...msg.msg, Bot.Button(msg.button)])
    const group_ids = []
    const limit = 100
    const where = { self_id: e.self.id }
    const cnt = await User.Group.count({where})
    for (let offset = 0; offset < cnt; offset += limit){
      const groups = await User.Group.findAll({
        where,
        limit,
        offset
      })
      for (const group of groups) {
        if (!msg.ignore_group.includes(group.group_id))
          group_ids.push(group.group_id)
        await sleep(1)
      }
    }
    logger.mark(group_ids)
    await Bot.pickGroup(msg.notice).sendMsg(`目标群聊:${group_ids.length}群`)
    return
  }

  async active_send(e, msg) {
    e.reply([...msg.msg, Bot.Button(msg.button)])
    const group_ids = []
    const promises = []
    const limit = 100
    const where = { self_id: e.self.id }
    const cnt = await User.Group.count({where})
    for (let offset = 0; offset < cnt; offset += limit){
      const groups = await User.Group.findAll({
        where,
        limit,
        offset
      })
      for (const group of groups) {
        if (!msg.ignore_group.includes(group.group_id)) {
          promises.push(Bot[e.self.id].pickGroup(group.group_id).sendMsg([...msg.msg, Bot.Button(msg.button)])
          .then(() => group_ids.push(group.group_id))
          .catch((error) => { }))
        }
        await sleep(200)
      }
    }
    // 使用 Promise.all() 确保所有异步操作完成后执行回调
    Promise.allSettled(promises)
    logger.mark(group_ids)
    await Bot.pickGroup(msg.notice).sendMsg(`成功群聊:${group_ids.length}群`)
    return
  }
}