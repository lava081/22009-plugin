import fs from 'fs'
import yaml from 'js-yaml'
import chokidar from 'chokidar'
const rootPath = `./plugins/22009-plugin/data` 
const folderPath = `${rootPath}/QQBotRelation`  //数据存放路径

export class OpenIdtoId extends plugin {
  constructor () {
    super({
      name: '绑定qq号',
      dsc: '复读用户发送的内容，然后撤回',
      event: 'message',
      priority: -1000012,
      rule: [
        {
          reg: '^#?(id|ID)绑定',
          fnc: 'writeOpenid'
        },
        {
          reg: '^#?身份查询',
          fnc: 'transformer'
        },
        {
          reg: '^#?用户数量',
          fnc: 'transformerCounter'
        },
        {
          reg: "",
          fnc: "giveNickname",
          log: false
        },
      ]
    })
  }

  async giveNickname (e) {
    if (IdtoQQ[e.self_id])
      if(IdtoQQ[e.self_id][e.user_id]){
        this.e.sender.user_id = IdtoQQ[e.self_id][e.user_id]?.qq
        this.e.sender.nickname = `${IdtoQQ[e.self_id][e.user_id]?.nickname}`
        this.e.sender.card = `${IdtoQQ[e.self_id][e.user_id]?.nickname}`
      }
    return false
  }

  async transformerCounter (e) {
    let count = 0;
    for (var User in IdtoQQ[e.self_id])
      count++
    this.reply(`收录用户数: ${count}`)
    return false
  }
  async transformer (e) {
    let search_id  = e.msg.replace(/^#?身份查询/,'').replace(/ /g, '')
    if (search_id == '') 
      search_id = e.user_id
    let openid = []
    let self_id
    self_id = search_id.match(/^(\d{9})-/)
    if ( self_id ) {
      self_id = self_id[1].replace(/-/,'')
      if(IdtoQQ[self_id][search_id]?.qq)
        openid.push([IdtoQQ[self_id][search_id], search_id])
    }
    else {
      for (self_id in IdtoQQ)
        for (const User in IdtoQQ[self_id])
          if (IdtoQQ[self_id][User].nickname.match(search_id) || IdtoQQ[self_id][User].qq == (+search_id))
            openid.push([IdtoQQ[self_id][User], User])
    }
    if (openid.length == 0) 
      this.reply(`暂未收录`)
    else 
      for(const i in openid){
        await this.reply([`\r#查询结果\r\r>QQ: ${openid[i][0].qq}\r\r>昵称: ${openid[i][0].nickname}\r\rUserID: ${openid[i][1]}\r头像: `,segment.image(`http://q.qlogo.cn/headimg_dl?dst_uin=${openid[i][0].qq}&spec=640&img_type=jpg`)])
        if ( i == 10 ){
          await this.reply(`重名${openid.length}人，显示前十人`)
          return false
        }
      }
    return false
  }

  async writeOpenid (e) {
    const filePath = `${folderPath}/${e.self_id}.yaml`
    let nickname = e.msg.replace(/^#?(id|ID)绑定/,'').replace(/ /,'').replace(/^\d+/,'')
    const qq = e.msg.replace(/^#?(id|ID)绑定/,'').replace(/ /,'').replace(`${nickname}`,'')
    if (qq == ''){
      this.reply(`请输入qq号和昵称`)
      return false
    }
    if(!IdtoQQ[e.self_id])
      IdtoQQ[e.self_id] = {}
    IdtoQQ[e.self_id][e.user_id] = {}
    IdtoQQ[e.self_id][e.user_id].qq = +qq
    IdtoQQ[e.self_id][e.user_id].nickname = nickname
    fs.writeFileSync(filePath, yaml.dump(IdtoQQ[e.self_id]), 'utf8')
    await this.reply(`绑定成功！如需更换绑定信息，重新绑定即可`)
    e.msg = `#身份查询${e.user_id}`
    this.transformer (e)
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export let IdtoQQ = {}

if (!fs.existsSync(folderPath))
  fs.mkdirSync(folderPath, { recursive: true })
const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.yaml'))
// logger.info(files)
for (let file of files) {
  const form = yaml.load(fs.readFileSync(`${folderPath}/${file}`, 'utf8'))
  const self_id = file.replace('.yaml', '')
  IdtoQQ[self_id] = form
  try {
    const watcher = chokidar.watch(`${folderPath}/${file}`)
  
    watcher.on('change', async () => {
        await sleep(1500)
        const form = yaml.load(fs.readFileSync(`${folderPath}/${file}`, 'utf8'))
        const self_id = file.replace('.yaml', '')
        IdtoQQ[self_id] = form
        logger.mark(`[绑定openid]${file}成功重载`)
      })
  
    watcher.on('error', (error) => {
        logger.error(`[绑定openid]发生错误: ${error}`)
        watcher.close()
    })
  } catch (err) {
    logger.error(err)
  }
}
