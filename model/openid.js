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

    /** 同步 */
    try {
      await sequelize.sync();
      console.log('数据库同步成功');
    } catch (error) {
      console.error('数据库同步出错:', error);
    }
  }

  static async UpdateUser (updatedData) {
    const user = await this.User.findOne({ where: { user_id: updatedData.user_id } })
    if(!user)
      return await this.User.create(updatedData)
    else 
      return await this.User.update(updatedData, { where: { user_id: updatedData.user_id } })
  }
}

export default User
