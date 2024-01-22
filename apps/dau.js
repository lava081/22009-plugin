import fs from 'fs'
import yaml from 'js-yaml'

const groupPath = './plugins/22009-plugin/data/group_id.yaml'
const userPath = './plugins/22009-plugin/data/user_id.yaml'
const calcDays = 30 //计算天数
const days = 7 //显示天数
const sbtxOnly = true //仅统计官方机器人数据

let data = {}
if (fs.existsSync(userPath))
    data = fs.readFileSync(userPath, 'utf8');
else{
    fs.writeFileSync(userPath, yaml.dump(data), 'utf8');
}
let user_list = yaml.load(data) || {};
if (fs.existsSync(groupPath))
    data = fs.readFileSync(groupPath, 'utf8');
else{
    fs.writeFileSync(groupPath, yaml.dump(data), 'utf8');
}
let group_list = yaml.load(data) || {};

export class dau extends plugin {
    constructor() {
        super({
            name: "dau",
            dsc: "dau",
            event: "message",
            priority: -1000005,
            rule: [
                {
                    reg: "^#?(qqbot)?dau$",
                    fnc: "dau_read",
                },
                {
                    reg: "",
                    fnc: "dau_write",
                    log: false
                },
                {
                    reg: "^#?清理(过期)?(qqbot)?dau$",
                    fnc: "dau_cleanup",
                },
            ]
        })
        this.task = {
            name: '清理过期dau',
            fnc: () => this.dau_cleanup(),
            cron: `0 5 * * *`
        }
        
    }
    async dau_cleanup() {
        const today = new Date().toLocaleDateString()
        for (const date in user_list) {
            if (user_list[date]){
                if(date != today){
                    user_list[date] = user_list[date].length || user_list[date]
                    group_list[date] = group_list[date].length || group_list[date]
                }else{
                    user_list[date] = user_list[date]
                    group_list[date] = group_list[date]
                }
            }
        }
        fs.writeFileSync(userPath, yaml.dump(user_list), 'utf8')
        fs.writeFileSync(groupPath, yaml.dump(group_list), 'utf8')
        try {
            await this.reply('清理完成')
        }catch(error){}
        return
    }

    async dau_write (e){
      if(sbtxOnly && e.adapter != 'QQBot' && e.adapter != 'QQGuild')
        return false
      else {
        const today = new Date().toLocaleDateString(); // 获取今天的日期

        if (!user_list[today]) {
            user_list[today] = [];
        }
        if (!group_list[today]) {
            group_list[today] = [];
        }

        let yamlString
        if (!user_list[today].includes(e.user_id)) {
            user_list[today].push(e.user_id);
            yamlString = yaml.dump(user_list);
            fs.writeFileSync(userPath, yamlString, 'utf8');
        }
        let group_id
        group_id = e.guild_id || e.group_id
        console.log(group_id)
        if (!group_list[today].includes(group_id)) {
            group_list[today].push(group_id);
            yamlString = yaml.dump(group_list);
            fs.writeFileSync(groupPath, yamlString, 'utf8');
        }
        
        return false
      }
    }

    async dau_read (e){
        let user_sum = 0;
        let group_sum = 0;
        let day = 0;
        const today = new Date().getTime()
        const xDaysAgo = []
        const displayDays = []
        for(let i = calcDays; i >= 0; i--) {
            const dayNow = new Date(today - i * 24 * 60 * 60 * 1000).toLocaleDateString()
            xDaysAgo.push(dayNow)
            if(i < days)
                displayDays.push(dayNow)
        }
        const dayNow = new Date(today).toLocaleDateString()
        let userCounts = {};
        for (const date of xDaysAgo) {
            if (user_list[date]){
                if(displayDays.includes(date))
                    userCounts[date] = `${user_list[date].length || user_list[date]}人 ${group_list[date].length || group_list[date]}群`;
                if(date != dayNow){
                    user_sum += user_list[date].length || user_list[date]
                    group_sum += group_list[date].length || group_list[date]
                    day++
                }
            }
        }
        e.reply(`${yaml.dump(userCounts)}\n${day}日平均：${Math.floor(user_sum/day) || 0}人 ${Math.floor(group_sum/day) || 0}群`)
        this.dau_write(e)
    }
}
