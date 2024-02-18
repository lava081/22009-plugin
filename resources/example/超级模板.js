/**
*  模板源码
*  {{.text_0}}{{.text_1}}{{.text_2}}{{.text_3}}{{.text_4}}{{.text_5}}{{.text_6}}{{.text_7}}{{.text_8}}{{.text_9}}
*  正常设置模板ID 模式设置4：#QQBotMD4
*/

import plugin from '../Lain-plugin/adapter/QQBot/plugins.js'
import User from '../22009-plugin/model/openid.js'

Bot.Markdown = async function (e, data, button = []) {
  /** 原生 */
  if (!e.bot.config.markdown) {
    const all = []
    let content = ``
    for (let i of data) {
      switch (i.type) {
        case 'text':
          content += i.text.replace(/\n/g, '\r')
          break
        case 'image':
          content += `\r![Lain-plugin. #${i.image.width} #${i.image.height}](${i.image.file})`
          break
        default:
          break
      }
    }
    
    /** 转为md */
    const markdown = {
      type: 'markdown',
      content
    }

    logger.info(content)

    /** 按钮 */
    const but = await Button(e)
    let _button = but && but?.length ? [...but, ...button] : [...button]

    /** 添加全局按钮 */
    const button2 = [
      {label: '赞助',link: 'https://afdian.net/a/lava081'},
      {label: '交流群',link: 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=VyTqcH5UTmnnKmMwYR000_iy4fNQwWXS&authKey=AM6Utt2TRc%2F%2Fwd9KQuxBy01RJT52Kw%2B5kT%2FCcqdhYYKZbVUFHa4%2FIYtjmq5PXbjF&noverify=0&group_code=666260918'},
      {label: '拉群',link: 'https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854216359&robot_appid=102073196&biz_type=0'},
    ]
    // if (_button.length < 5)
    //   _button.unshift(...await Bot.Button(button2))

    all.push([markdown, ..._button])
    return all
  }
  
  let text = []
  const image = []
  const message = []

  for (let i of data) {
    switch (i.type) {
      case 'text':
        text.push(`${i.text.replace(/\n/g, '\r').trim()}喵～`)
        break
      case 'image':
        image.push(i)
        break
      default:
        break
    }
  }

  /** 处理二笔语法，分割为数组 */
  text = parseMD(text.join(''))

  /** 先分个组吧! */
  if (image.length > text.length) {
    for (const i in image) message.push({ text: text?.[i], image: image?.[i] })
  } else {
    for (const i in text) message.push({ text: text?.[i], image: image?.[i] })
  }
  CountFunction(e)

  return await combination(e, message, button)
}

async function CountFunction(e) {
  if (!(e?.sender.user_openid && e.logFnc && e.group_id && e.self_id)) return false
  User.addUserToFnc(`${e.self_id}-${e?.sender.user_openid}`, e.group_id, e.self_id, e.logFnc)
  return
}

/** 处理md标记 */
function parseMD (str) {
  /** 处理第一个标题 */
  str = str.replace(/^#/, '\r#')
  let msg = str.split(/(\*\*\*|\*\*|\*|__|_|~~|~|\`)/).filter(Boolean)

  let mdSymbols = ['***', '**', '*', '__', '_', '~~', '~', '\`']
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
function sort (arr) {
  const Array = []
  for (let i = 0; i < arr.length; i += 9) Array.push(arr.slice(i, i + 9))
  return Array
}

/** 组合 */
async function combination (e, data, but) {
  const all = []
  /** 按9分类 */
  data = sort(data)
  for (let p of data) {
    const params = []
    const length = p.length
    /** 头要特殊处理 */
    params.push({ key: 'text_0', values: [(p[0]?.text || '') + (p[0].image ? `${ p[0]?.text ? '\r' : '' }![Lain-plugin. #${Math.floor(p[0].image?.width/ 5)}px #${Math.floor(p[0].image?.height/ 5)}px` : '')] })
    for (let i = 1; i < length; i++) {
      let val = []
      /** 上一个图片的后续链接 */
      if (p[i - 1]?.image) val.push(`](${p[i - 1].image.file})`)
      /** 当前对象的文字和图片的开头 */
      val.push(p[i]?.image ? `${(p[i].text || '')}\r![Lain-plugin. #${Math.floor(p[i].image.width/ 5)}px #${Math.floor(p[i].image.height/ 5)}px` : (p[i].text || ''))
      params.push({ key: 'text_' + (i), values: [val.join('')] })
    }

    /** 尾巴也要! */
    if (p[length - 1]?.image) params.push({ key: `text_${length}`, values: [`](${p[length - 1].image.file})`] })

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

    /** 添加全局按钮 */
    const button2 = [
      {label: '赞助',link: 'https://afdian.net/a/lain52'},
      {label: '交流群',link: 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=VyTqcH5UTmnnKmMwYR000_iy4fNQwWXS&authKey=AM6Utt2TRc%2F%2Fwd9KQuxBy01RJT52Kw%2B5kT%2FCcqdhYYKZbVUFHa4%2FIYtjmq5PXbjF&noverify=0&group_code=666260918'},
      {label: '拉群',link: 'https://qun.qq.com/qunpro/robot/qunshare?robot_uin=2854216359&robot_appid=102073196&biz_type=0'},
    ]
    // if (_button.length < 5)
    //   _button.unshift(...await Bot.Button(button2))

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
          const button = await p[v.fnc](e)
          /** 无返回不添加 */
          if (button) return [...(Array.isArray(button) ? button : [button])]
          return false
        }
      }
    }
  } catch (error) {
    logger.error('Lain-plugin', error)
    return false
  }
}
