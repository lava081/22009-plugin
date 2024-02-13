import { Sequelize, DataTypes } from 'sequelize'

class User {
  static init () {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './data/22009-plugin/openid.db',
      logging: false
    })

    /** 用户模型 */
    this.User = sequelize.define('User', {
      user_id: {
        /** 字符类型 */
        type: DataTypes.STRING,
        /** 唯一性 */
        unique: true,
        /** 主键 */
        primaryKey: true,
        /** 禁止为空 */
        allowNull: false,
        /** 描述 */
        comment: 'OpenID，主键'
      },
      qq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '真实qq'
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '用户昵称'
      },
      self_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '所属机器人'
      },
    }, {})

    /** 同步 */
    sequelize.sync().then(() => {
      console.log('数据库同步成功')
    }).catch(error => {
      console.error('数据库同步出错:', error)
    })
  }
}

/** 初始化数据库 */
User.init()

export default User
