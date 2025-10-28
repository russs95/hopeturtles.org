import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const usersModel = createModel('users_tb', 'buwana_id');

const selectableFields = [
  'buwana_id',
  'email',
  'full_name',
  'role',
  'account_status',
  'created_at',
  'last_login'
];

usersModel.listUsers = async (filters = {}) => {
  const allowedFilters = ['account_status', 'role'];
  const clauses = [];
  const values = [];

  allowedFilters.forEach((field) => {
    const value = filters[field];
    if (value === undefined || value === null || value === '') {
      return;
    }
    clauses.push(`\`${field}\` = ?`);
    values.push(value);
  });

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT ${selectableFields.map((field) => `\`${field}\``).join(', ')} FROM \`users_tb\` ${where} ORDER BY \`buwana_id\` DESC`;
  return query(sql, values);
};

usersModel.createUser = async (userData) => {
  const payload = {
    buwana_id: userData.buwana_id,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name ?? null,
    full_name:
      userData.full_name ??
      (userData.last_name ? `${userData.first_name} ${userData.last_name}` : userData.first_name),
    username: userData.username ?? null,
    account_status: userData.account_status ?? 'active',
    created_at: userData.created_at ?? new Date(),
    last_login: userData.last_login ?? null,
    role: userData.role ?? 'user',
    language_id: userData.language_id,
    location_watershed: userData.location_watershed,
    location_full: userData.location_full ?? null,
    country_id: userData.country_id ?? null,
    watershed_id: userData.watershed_id ?? null,
    notes: userData.notes ?? null,
    flagged: userData.flagged ?? 0,
    profile_pic: userData.profile_pic ?? 'null',
    earthen_newsletter_join: userData.earthen_newsletter_join ?? 1,
    login_count: userData.login_count ?? 0,
    birth_date: userData.birth_date ?? null,
    deleteable: userData.deleteable ?? 0,
    continent_code: userData.continent_code ?? null,
    earthling_emoji: userData.earthling_emoji ?? null,
    location_lat: userData.location_lat ?? null,
    location_long: userData.location_long ?? null,
    community_id: userData.community_id ?? null,
    time_zone: userData.time_zone ?? null,
    tour_taken: userData.tour_taken ?? 0,
    last_sync_ts: userData.last_sync_ts ?? null
  };

  return usersModel.create(payload);
};

usersModel.updateRole = async (buwanaId, role) => {
  const existing = await usersModel.getById(buwanaId);
  if (!existing) {
    return null;
  }
  return usersModel.update(buwanaId, { role });
};

usersModel.updateStatus = async (buwanaId, accountStatus) => {
  const existing = await usersModel.getById(buwanaId);
  if (!existing) {
    return null;
  }
  return usersModel.update(buwanaId, { account_status: accountStatus });
};

usersModel.deactivateUser = async (buwanaId) => {
  return usersModel.updateStatus(buwanaId, 'suspended');
};

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
