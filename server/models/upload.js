import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const UploadHistory = sequelize.define('UploadHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_id'
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'upload_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

export default UploadHistory; 