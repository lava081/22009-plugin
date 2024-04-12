import { Sequelize, DataTypes } from 'sequelize'

class Openid {
  static async init () {
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
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {})

    /** 群组模型 */
    this.Group = sequelize.define('Group', {
      group_id: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
        allowNull: false,
        comment: 'OpenID，主键'
      },
      qq: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '真实qq群号'
      },
      self_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '所属机器人'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {})

    /** 日期模型 */
    this.DAU = sequelize.define('DAU', {
      DATE: {
        type: DataTypes.DATEONLY,
        unique: true,
        primaryKey: true,
        allowNull: false,
        comment: '日期，主键'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {})

    /** 功能统计模型 */
    this.Fnc = sequelize.define('Fnc', {
      logFnc: {
        type: DataTypes.STRING,
        primaryKey: true,
        comment: '功能名称，主键'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {})

    /** 关联模型 */

    /** 用户群组关联模型 */
    this.UserGroups = sequelize.define('UserGroups', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // 自增主键
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '用户ID'
      },
      group_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '群聊ID'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {
      indexes: [
        { unique: true, fields: ['user_id', 'group_id'] } // 创建联合唯一索引
      ]
    })

    /** 用户DAU关联模型 */
    this.UserDAU = sequelize.define('UserDAU', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // 自增主键
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '用户ID'
      },
      DATE: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '日期'
      },
      self_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '所属机器人'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {
      indexes: [
        { unique: true, fields: ['user_id', 'DATE'] } // 创建联合唯一索引
      ]
    })

    /** 群组DAU关联模型 */
    this.GroupDAU = sequelize.define('GroupDAU', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // 自增主键
      },
      group_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '群组ID'
      },
      DATE: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '日期'
      },
      self_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '所属机器人'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {
      indexes: [
        { unique: true, fields: ['group_id', 'DATE'] } // 创建联合唯一索引
      ]
    })

    /** 用户功能关联模型 */
    this.UserFnc = sequelize.define('UserFnc', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // 自增主键
        comment: '自增主键'
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '用户ID'
      },
      DATE: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '日期'
      },
      logFnc: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '功能名称'
      },
      self_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '所属机器人'
      },
      UserDAU_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'UserDAU主键'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      }
    }, {
      indexes: [
        { unique: true, fields: ['UserDAU_id', 'logFnc'] } // 创建联合唯一索引
      ]
    })

    /** 添加关联 */

    /** 在User模型中添加Group关联 */
    this.User.belongsToMany(this.Group, {
      through: this.UserGroups,
      foreignKey: 'user_id'
    })

    /** 在User模型中添加DAU关联 */
    this.User.belongsToMany(this.DAU, {
      through: this.UserDAU,
      foreignKey: 'user_id'
    })

    /** 在Group模型中添加User关联 */
    this.Group.belongsToMany(this.User, {
      through: this.UserGroups,
      foreignKey: 'group_id'
    })

    /** 在Group模型中添加DAU关联 */
    this.Group.belongsToMany(this.DAU, {
      through: this.GroupDAU,
      foreignKey: 'group_id'
    })

    /** 在DAU模型中添加User关联 */
    this.DAU.belongsToMany(this.User, {
      through: this.UserDAU,
      foreignKey: 'DATE'
    })

    /** 在DAU模型中添加Group关联 */
    this.DAU.belongsToMany(this.Group, {
      through: this.GroupDAU,
      foreignKey: 'DATE'
    })

    /** 在Fnc模型中添加UserDAU关联 */
    this.Fnc.belongsToMany(this.UserDAU, {
      through: this.UserFnc,
      foreignKey: 'logFnc'
    })

    /** 在UserDAU模型中添加UserDAU关联 */
    this.UserDAU.belongsToMany(this.Fnc, {
      through: this.UserFnc,
      foreignKey: 'UserDAU_id'
    })

    /** 同步 */
    try {
      await sequelize.sync()
      console.log('数据库同步成功')
    } catch (error) {
      console.error('数据库同步出错:', error)
    }

    return sequelize
  }

  /** 更新用户模型 */
  static async UpdateUser (updatedData) {
    const user = await this.User.findOne({ where: { user_id: updatedData.user_id } })
    if (!user) {
      return await this.User.create(updatedData) // 如果用户不存在，直接创建用户
    } else {
      return await this.User.update(updatedData, { where: { user_id: updatedData.user_id } })
    }
  }

  /** 更新群组模型 */
  static async UpdateGroup (updatedData) {
    const group = await this.Group.findOne({ where: { group_id: updatedData.group_id } })
    if (!group) {
      return await this.Group.create(updatedData) // 如果群组不存在，直接创建群组
    } else {
      return await this.Group.update(updatedData, { where: { group_id: updatedData.group_id } })
    }
  }

  /** 维护用户和群聊的多对多关系和DAU，自动创建所需用户和群组，带去重 */
  static async addUserToGroup (user_id, group_id, self_id) {
    /** 防止缺参数 */
    if (!(user_id && group_id && self_id)) { return false }

    const DATE = this.getLocaleDate(new Date())

    /** 载入 */
    let user = await this.User.findOne({ where: Number(user_id) ? { qq: user_id, self_id } : { user_id } })
    let group = await this.Group.findOne({ where: Number(group_id) ? { qq: group_id, self_id } : { group_id } })
    let date = await this.DAU.findOne({ where: { DATE } })

    /** 自动创建所需用户和群组和日期 */
    if (!date) {
      const updatedData = { DATE }
      await this.DAU.create(updatedData) // 创建日期
      date = await this.DAU.findOne({ where: { DATE } }) // 重新载入
    }
    if (!user) {
      /** 临时用户身份 */
      const updatedData = {
        user_id,
        qq: 8888, // 正常qq最少5位
        nickname: '',
        self_id
      }
      await this.User.create(updatedData)
      user = await this.User.findOne({ where: { user_id } })
    }
    if (!group) {
      const updatedData = {
        group_id,
        self_id
      }
      await this.Group.create(updatedData)
      group = await this.Group.findOne({ where: { group_id } })
    }

    /** 建立关联，有唯一索引所以不用去重 */
    try {
      await group.addUser(user)
      await date.addUser(user, { through: { self_id } })
      await date.addGroup(group, { through: { self_id } })
    } catch (error) { logger.info(error) }
  }

  /** 维护用户功能统计的多对多关系 */
  static async addUserToFnc (user_id, group_id, self_id, logFnc) {
    if (!(logFnc && user_id && group_id && self_id)) { return false }
    const DATE = this.getLocaleDate(new Date())
    if (Number(user_id)) {
      user_id = (await this.User.findOne({ where: { qq: user_id, self_id } })).user_id
    }
    /** 载入 */
    let fnc = await this.Fnc.findOne({ where: { logFnc } })
    let user = await this.UserDAU.findOne({ where: { DATE, user_id } })
    if (!fnc) {
      const updatedData = { logFnc }
      await this.Fnc.create(updatedData)
      fnc = await this.Fnc.findOne({ where: { logFnc } }) // 重新载入
    }
    if (!user) {
      await this.addUserToGroup(user_id, group_id, self_id)
      user = await this.UserDAU.findOne({ where: { DATE, user_id } }) // 重新载入
    }

    /** 建立关联，有唯一索引所以不用去重 */
    try {
      await fnc.addUserDAU(user, { through: { user_id, self_id, DATE } })
    } catch (error) { logger.info(error) }
  }

  /** 获取当前日期对象并调整为东八区时间 */
  static getLocaleDate (date) {
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).replace(/\//g, '-').split(' ')[0]
  }

  /** 延时，单位ms */
  static sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export default Openid
