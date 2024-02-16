import { Sequelize, DataTypes } from 'sequelize'

class User {
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
      self_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '所属机器人'
      },
      other: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '预留'
      },
    }, {})

    /** 用户群组关联模型 */
    this.UserGroups = sequelize.define('UserGroups', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // 自增主键
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '用户ID',
      },
      group_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '群聊ID',
      },
    }, {
      indexes: [
        { unique: true, fields: ['user_id', 'group_id'] } // 创建联合唯一索引
      ]
    })

    /** 在User模型中添加关联 */
    this.User.belongsToMany(this.Group, {
      through: this.UserGroups,
      foreignKey: 'user_id',
    })

    /** 在Group模型中添加关联 */
    this.Group.belongsToMany(this.User, {
      through: this.UserGroups,
      foreignKey: 'group_id',
    })

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
      },
    }, {})

    /** 用户DAU关联模型 */
    this.UserDAU = sequelize.define('UserDAU', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // 自增主键
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '用户ID',
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
      },
    }, {
      indexes: [
        { unique: true, fields: ['user_id', 'DATE'] } // 创建联合唯一索引
      ]
    })
    
    /** 在User模型中添加关联 */
    this.User.belongsToMany(this.DAU, {
      through: this.UserDAU,
      foreignKey: 'user_id',
    })

    /** 在DAU模型中添加关联 */
    this.DAU.belongsToMany(this.User, {
      through: this.UserDAU,
      foreignKey: 'DATE',
    })

    /** 群组DAU关联模型 */
    this.GroupDAU = sequelize.define('GroupDAU', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // 自增主键
      },
      group_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '群组ID',
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
      },
    }, {
      indexes: [
        { unique: true, fields: ['group_id', 'DATE'] } // 创建联合唯一索引
      ]
    })

    /** 在Group模型中添加关联 */
    this.Group.belongsToMany(this.DAU, {
      through: this.GroupDAU,
      foreignKey: 'group_id',
    })

    /** 在DAU模型中添加关联 */
    this.DAU.belongsToMany(this.Group, {
      through: this.GroupDAU,
      foreignKey: 'DATE',
    })

    /** 同步 */
    try {
      await sequelize.sync();
      console.log('数据库同步成功');
    } catch (error) {
      console.error('数据库同步出错:', error);
    }
  }

  /** 更新用户模型 */
  static async UpdateUser (updatedData) {
    const user = await this.User.findOne({ where: { user_id: updatedData.user_id } })
    if(!user)
      return await this.User.create(updatedData)  // 如果用户不存在，直接创建用户
    else 
      return await this.User.update(updatedData, { where: { user_id: updatedData.user_id } })
  }

  /** 维护用户和群聊的多对多关系和DAU，自动创建所需用户和群组，带去重 */
  static async addUserToGroup (user_id, group_id, self_id) {
    const DATE = this.getLocaleDate(new Date())

    /** 载入 */
    let user = await this.User.findOne({ where: { user_id } })
    let group = await this.Group.findOne({ where: { group_id } })
    let date = await this.DAU.findOne({ where: { DATE } })


    /** 自动创建所需用户和群组和日期 */
    /** 自动创建日期 */
    if (!date) {
      const updatedData = { DATE }
      await this.DAU.create(updatedData)  // 创建日期
      date = await this.DAU.findOne({ where: { DATE } })  // 重新载入
    }
    if (!user) {
      /** 临时用户身份 */
      const updatedData = {
        user_id,
        qq: 8888,  // 正常qq最少5位
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

    return
  }

  /** 获取当前日期对象并调整为东八区时间 */
  static getLocaleDate (date) {
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).replace(/\//g, '-').split(' ')[0]
  }
}

export default User
