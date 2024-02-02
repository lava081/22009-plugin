import fs from 'fs'
import yaml from 'yaml'
export let FncCnt = {}
const rootPath = `./plugins/22009-plugin/data/` 
const Path = rootPath + 'FncCnt.yaml'
if (fs.existsSync(Path)){
  let form = {}
  form = yaml.parse(fs.readFileSync(Path, 'utf8'))
  for (const logFnc in form)
    FncCnt[logFnc] = new Set(form[logFnc])
}

export class FunctionCounter extends plugin {
  constructor() {
    super({
      name: "功能统计",
      dsc: "FncCnt",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: "^#?写入功能统计$",
          fnc: "write",
          permission: "master",
        },
        {
          reg: "^#?功能统计$",
          fnc: "calc",
          permission: "master",
        },
      ]
    })
    this.task = {
      name: '[功能统计]写入文件',
      fnc: () => this.write(),
      cron: `13/30 * * * *`
    }
  }

  async write () {
    let form = {}
    for (const logFnc in FncCnt)
      form[logFnc] = Array.from(FncCnt[logFnc])
    fs.writeFileSync(Path, yaml.stringify(form), 'utf8')
  }

  async calc (e) {
    let msg = []
    for (const logFnc in FncCnt) {
      // 将每个功能名称和对应人数转换为格式化的字符串并推入数组
      const count = FncCnt[logFnc].size;
      msg.push({ name: `${logFnc.replace(/\_/g,'-').replace(/\[/g,'(').replace(/\]/g,')')}`, count });
    }

    // 按照count属性进行排序
    msg.sort((a, b) => b.count - a.count)

    // 构造最终回复消息
    const replyMsg = ['\r#功能统计'];
    msg.forEach(item => {
      replyMsg.push(`\r>${item.name} ${item.count}人`);
    })

    e.reply(replyMsg);
  }
}

