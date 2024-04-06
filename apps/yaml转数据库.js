import fs from 'fs'
import yaml from 'yaml'
import Openid from '../model/openid.js'
/** 初始化数据库 */
let sql = await Openid.init()

try {
  /** 兼容旧数据 */
  const columnsToAdd = {
    Groups: ['qq'],
    Users: ['other'],
    UserGroups: ['other']
  }
  await sql.transaction(async (t) => {
    for (const tableName in columnsToAdd) {
      for (const columnName of columnsToAdd[tableName]) {
        await addColumn(`\`${tableName}\``, `\`${columnName}\``, t)
      }
    }
  })
  console.log('所有列添加完成')
} catch (error) {
  console.error('添加列时出错:', error)
}
/** 异步执行转换操作 */
start()

async function start () {
  const folderPath = './plugins/22009-plugin/data/QQBotRelation/' // 数据存放路径
  const files = []
  if (fs.existsSync(folderPath)) { files.push(...fs.readdirSync(folderPath).filter(file => file.endsWith('.yaml'))) }
  logger.info(files)
  if (files.length > 0) {
    // 创建一个 Promise 对象的数组
    let promises = []

    for (let file of files) {
      const form = yaml.parse(fs.readFileSync(`${folderPath}/${file}`, 'utf8'))
      const self_id = file.replace('.yaml', '')

      for (let user in form) {
        const updatedData = {
          user_id: user,
          qq: Number(form[user].qq),
          nickname: form[user].nickname.replace('\\', ''),
          self_id
        }

        // 将每个 translate() 调用的结果添加到 promises 数组
        promises.push(Openid.UpdateUser(updatedData))
      }
    }

    // 使用 Promise.all() 确保所有异步操作完成后执行回调
    Promise.all(promises)
      .then(() => {
        const unlinkPromises = files.map(file => fs.promises.unlink(`${folderPath}/${file}`))
        return Promise.all(unlinkPromises)
      })
      .then(() => logger.info('[22009]用户转存为数据库完成，存放位置\'./data/22009-plugin/openid.db\''))
      .catch(err => logger.error('[22009]用户转存为数据库出错: ', err))
  }
}

async function addColumn (tableName, columnName, t) {
  const [results] = await sql.query(`PRAGMA table_info(${tableName})`, { transaction: t })
  const columnExists = results.some(column => `\`${column.name}\`` === columnName)
  if (!columnExists) {
    await sql.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} INTEGER`, { transaction: t })
    console.log(`已成功添加列 ${columnName}`)
  }
}
