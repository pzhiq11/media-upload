import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false // 设置为 true 可以看到 SQL 查询日志
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步所有模型
    await sequelize.sync();
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

export default sequelize; 