/**
*  模板源码
*  {{.text_0}}{{.text_1}}{{.text_2}}{{.text_3}}{{.text_4}}{{.text_5}}{{.text_6}}{{.text_7}}{{.text_8}}{{.text_9}}
*  正常设置模板ID 模式设置4：#QQBotMD4
*/

import plugin from '../Lain-plugin/adapter/QQBot/plugins.js'
import Openid from '../22009-plugin/model/openid.js'

/** 违规关键字 */
let mdSymbols = ['](', '] (', '***', '**', '*', '__', '_', '~~', '~', '`']

Bot.ContentToMarkdown = async function (e, content, button = []) {
  /** 数组转字符串 */
  content = content.join('\r')
  /** 处理二笔语法，分割为数组 */
  content = parseMD(content)

  /** 22009功能统计 */
  CountFunction(e)

  return await combination(e, content, button)
}

async function CountFunction (e) {
  if (!(e.sender?.user_openid && e.logFnc && e.group_id && e.self_id)) return false
  Openid.addUserToFnc(`${e.self_id}-${e.sender?.user_openid}`, e.group_id, e.self_id, e.logFnc)
}

/** 处理md标记 */
function parseMD (str) {
  /** 处理第一个标题 */
  str = str.replace(/^#/, '\r#').replace(/\n/g, '\r')
  let msg = str.split(/(\]\(|\] \(|\*\*\*|\*\*|\*|__|_|~~|~|`)/).filter(Boolean)

  let result = []
  let temp = ''

  for (let i = 0; i < msg.length; i++) {
    if (mdSymbols.includes(msg[i])) {
      temp += msg[i]
    } else {
      if (temp !== '') {
        result.push(temp)
        temp = ''
      }
      temp += msg[i]
    }
  }

  if (temp !== '') result.push(temp)
  return result
}

/** 按9进行分类 */
async function sort (arr, e) {
  const Array = []
  for (let i = 0; i < arr.length; i += 9) {
    if (Array.length) {
      // 处理第九张图
      if (arr[i - 1].match(/\[/)) {
        Array[Array.length - 1][9] = arr[i].substring(0, arr[i].indexOf(')') + 1)
        arr[i] = arr[i].substring(arr[i].indexOf(')') + 1)
      } else {
        Array[Array.length - 1][9] = arr[i]
        i++
      }
    }
    if (!arr[i]) break
    Array.push(arr.slice(i, i + 9))

    /** 加入自适应的消息头部 */
    if (e.raw_message && e.sender?.user_openid) {
      Array[Math.floor(i / 9)][0] = `<@${e.sender?.user_openid}>\r\r> ${(e.raw_message.length > 10) ? e.raw_message.slice(0, 9) + '…' : e.raw_message}\r\r` + Array[Math.floor(i / 9)][0].replace(new RegExp(`^<@${e.sender?.user_openid}>`), '')
      if (Array[Math.floor(i / 9)].length < 9) {
        Array[Math.floor(i / 9)].unshift('>![Lain-plugin #25px #25px]')
        Array[Math.floor(i / 9)][1] = `(https://q.qlogo.cn/qqapp/${e.self_id}/${e.sender?.user_openid}/100)` + Array[Math.floor(i / 9)][1]
      }
    }
  }
  Array[Array.length - 1][Array[Array.length - 1].length - 1] += '喵～'
  return Array
}

/** 组合 */
async function combination (e, data, but) {
  const all = []
  /** 按9分类 */
  data = await sort(data, e)
  for (let p of data) {
    const params = []
    const length = p.length
    for (let i = 0; i < length; i++) {
      params.push({ key: 'text_' + (i), values: [p[i]] })
    }

    /** 转为md */
    const markdown = {
      type: 'markdown',
      custom_template_id: e.bot.config.markdown.id,
      params
    }

    logger.info(params)

    /** 按钮 */
    const button = await Button(e)
    let _button = button && button?.length ? [...button, ...but] : [...but]
    const button2 = [
      { label: '赞助', link: 'https://afdian.net/a/lava081' },
      { label: '交流群', link: 'https://qm.qq.com/q/tizfRnm6SO' },
      { label: '拉群', link: 'https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854216359&robot_appid=102073196&biz_type=0' },
      { label: '按钮中心', callback: ' ', style: 0 }
    ]
    if (_button.length < 5) { _button.unshift(...await Bot.Button(button2, 4)) }
    all.push([markdown, ..._button])
  }
  return all
}

/** 按钮添加 */
async function Button (e) {
  try {
    for (let p of plugin) {
      for (let v of p.plugin.rule) {
        const regExp = new RegExp(v.reg)
        if (regExp.test(e.msg)) {
          p.e = e
          const button = await p[v.fnc](e)
          /** 无返回不添加 */
          if (button) return [...(Array.isArray(button) ? button : [button])]
        }
      }
    }
    return false
  } catch (error) {
    logger.error('Lain-plugin', error)
    return false
  }
}
