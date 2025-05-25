import { Sequelize } from 'sequelize';

const isProduction = process.env.NODE_ENV === 'production';

// 添加调试日志
console.log('环境变量:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DATABASE_URL: process.env.DATABASE_URL
});

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    })
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'media_upload',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      logging: false
    });

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