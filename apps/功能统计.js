import fs from 'fs'
import yaml from 'js-yaml'
export let FncCnt = {}
const rootPath = `./plugins/22009-plugin/data/` 
const Path = rootPath + 'FncCnt.yaml'
if (fs.existsSync(Path)){
  let form = {}
  form = yaml.load(fs.readFileSync(Path, 'utf8'))
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
    fs.writeFileSync(Path, yaml.dump(form), 'utf8')
  }

  async calc (e) {
    let msg = []
    for (const logFnc in FncCnt) {
      msg.push(`\r>${logFnc.replace(/\_/g,'-').replace(/\[/g,'(').replace(/\]/g,')')} ${FncCnt[logFnc].size}人`)
    }
    msg.sort()
    e.reply(['\r#功能统计',...msg])
  }
}

