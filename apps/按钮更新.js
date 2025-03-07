import { exec, execSync } from 'child_process'
import fs from 'fs'
const Path = './plugins/Lain-plugin/plugins/button/button'
const url = 'https://gitee.com/lava081/button'
export class UpdateButton extends plugin {
  constructor () {
    super({
      name: '更新按钮',
      dsc: '更新铃音按钮',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#(强制)?按钮(更新|下载)$',
          fnc: 'UpdateButton'
        }
      ]
    })
  }

  async UpdateButton (e) {
    let cmd = ''
    if (!fs.existsSync(Path) || this.e.msg.includes('下载')) {
      await this.reply(`开始下载${url}`)
      cmd = `git clone --depth=1 ${url} ${Path}`
      exec(cmd, { cwd: process.cwd(), stdio: 'inherit' }, (error) => {
        if (error) { return this.reply(`下载错误：\n${error}`) } else {
          this.reply('按钮下载完成')
        }
      })
    } else {
      await this.reply(`更新中，耐心等待，保存路径${Path}`)
      cmd = 'git pull'
      if (this.e.msg.includes('强制')) { execSync('git fetch && git reset --hard', { cwd: Path }) }
      exec(cmd, { cwd: Path, stdio: 'inherit' }, (output, error) => {
        if (error) {
          if (error.match(/Already up to date\./)) { this.reply('岩浆正在偷懒') } else {
            this.reply('按钮更新结束')
          }
        } else { return this.reply(`更新错误：${output}`) }
      })
    }
  }
}
