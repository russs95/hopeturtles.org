import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const usersModel = createModel('users_tb', 'buwana_id');

usersModel.findByBuwanaId = async (buwanaId) => {
  return usersModel.getById(buwanaId);
};

usersModel.upsertFromBuwana = async (user) => {
  const existing = await usersModel.getById(user.buwana_id);
  if (existing) {
    await usersModel.update(user.buwana_id, {
      email: user.email,
      full_name: user.full_name,
      role: user.role || existing.role,
      last_login: user.last_login || existing.last_login
    });
    return usersModel.getById(user.buwana_id);
  }
  await usersModel.create({
    buwana_id: user.buwana_id,
    email: user.email,
    full_name: user.full_name,
    role: user.role || 'user',
    created_at: user.created_at || new Date()
  });
  return usersModel.getById(user.buwana_id);
};

usersModel.getActiveCount = async () => {
  const rows = await query('SELECT COUNT(*) AS total FROM users_tb WHERE account_status = "active"');
  return rows[0]?.total || 0;
};

export default usersModel;
