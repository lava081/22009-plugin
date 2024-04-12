import fs from 'fs'
import chokidar from 'chokidar'
import Openid from '../model/openid.js'
/** 发送间隔 */
const sleep_time = 1000
const rootPath = './plugins/22009-plugin/config'
/** 发送参数的存储位置 */
const Path = `${rootPath}/config/msg.json`
/** 发送参数的参考存储位置 */
const defPath = `${rootPath}/defSet/msg.json`
/** 发送参数 */
let msg = ''

/** 发送参数热重载 */
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

/** 延迟函数，单位ms */
function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class QQBotVoluntarilyPush extends plugin {
  constructor () {
    super({
      name: 'QQBot主动推送',
      dsc: '适配铃音，需配合22009自带的dau，主动消息有限，且用且珍惜',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?(预览)?主动推送$',
          fnc: 'play',
          permission: 'master'
        }
      ]
    })
  }

  async play (e) {
    if (msg == '') { return e.reply(`未配置${Path}\r参考文件位于${defPath}`) }

    if (e.msg.match(/预览/)) { this.passive_send(e, msg) } else { this.active_send(e, msg) }
  }

  async passive_send (e, msg) {
    e.reply([...msg.msg, Bot.Button(msg.button)])
    const group_ids = []
    const limit = 100
    const where = { self_id: e.self_id }
    const cnt = await Openid.Group.count({ where })
    for (let offset = 0; offset < cnt; offset += limit) {
      const groups = await Openid.Group.findAll({
        where,
        limit,
        offset
      })
      for (const group of groups) {
        if (!msg.ignore_group.includes(group.group_id)) { group_ids.push(group.group_id) }
        await sleep(1)
      }
    }
    logger.mark(group_ids)
    await Bot.pickGroup(msg.notice).sendMsg(`目标群聊:${group_ids.length}群`)
  }

  async active_send (e, msg) {
    e.reply([...msg.msg, Bot.Button(msg.button)])
    /** 失败群聊 */
    const group_ids = []
    /** 存储异步操作 */
    const promises = []
    /** 单次读取群数 */
    const limit = 100
    /** 限制仅当前机器人 */
    const where = { self_id: e.self_id }
    /** 总群数 */
    const cnt = await Openid.Group.count({ where })
    /** 遍历数据库中的群组并发送 */
    for (let offset = 0; offset < cnt; offset += limit) {
      /** 一次读取 */
      const groups = await Openid.Group.findAll({
        where,
        limit,
        offset
      })
      for (const group of groups) {
        /** 一次发送 */
        if (!msg.ignore_group.includes(group.group_id)) {
          promises.push(Bot[e.self_id].pickGroup(group.group_id).sendMsg([...msg.msg, Bot.Button(msg.button)])
            .catch((error) => group_ids.push(group.group_id)))
        }
        await sleep(sleep_time)
      }
    }
    // 使用 Promise.all() 确保所有异步操作完成后执行回调
    Promise.all(promises)
    logger.mark(group_ids)
    await Bot.pickGroup(msg.notice).sendMsg(`成功群聊:${cnt - group_ids.length}群`)
  }
}
