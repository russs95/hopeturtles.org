import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const usersModel = createModel('users_tb', 'buwana_id');

usersModel.findByBuwanaId = async (buwanaId) => {
  return usersModel.getById(buwanaId);
};

usersModel.upsertFromBuwana = async (user) => {
  const existing = await usersModel.getById(user.buwana_id);

  const placeholderEmail = `user-${user.buwana_id}@placeholder.local`;

  if (existing) {
    const updateData = {
      role: user.role ?? existing.role ?? 'user',
      last_login: user.last_login ?? new Date()
    };

    if (user.email !== undefined) {
      updateData.email = user.email ?? existing.email ?? placeholderEmail;
    }

    if (user.full_name !== undefined) {
      updateData.full_name = user.full_name ?? existing.full_name ?? null;
    }

    await usersModel.update(user.buwana_id, updateData);
    return usersModel.getById(user.buwana_id);
  }

  await usersModel.create({
    buwana_id: user.buwana_id,
    email: user.email ?? placeholderEmail,
    full_name: user.full_name ?? null,
    role: user.role ?? 'user',
    created_at: user.created_at ?? new Date(),
    last_login: user.last_login ?? new Date()
  });

  return usersModel.getById(user.buwana_id);
};

usersModel.getActiveCount = async () => {
  const rows = await query('SELECT COUNT(*) AS total FROM users_tb WHERE account_status = "active"');
  return rows[0]?.total || 0;
};

export default usersModel;
