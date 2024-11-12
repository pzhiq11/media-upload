import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sequelize = new Sequelize(
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL 
    : {
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'),
        logging: false
      }
);

if (process.env.NODE_ENV === 'production') {
  sequelize.options.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

export async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync();
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

export default sequelize; 