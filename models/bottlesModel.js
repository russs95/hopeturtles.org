import { query } from '../config/db.js';
import createModel from './baseModel.js';

const bottlesModel = createModel('bottles_tb', 'bottle_id');

bottlesModel.getForPackerWithDetails = async (packerId) => {
  if (!packerId) {
    return [];
  }

  const sql = `
    SELECT
      b.bottle_id,
      b.serial_number,
      b.contents,
      b.weight_grams,
      b.status,
      b.verified,
      b.mission_id,
      b.bottle_basic_pic,
      m.name AS mission_name,
      photo.url AS basic_photo_url
    FROM bottles_tb b
    LEFT JOIN missions_tb m ON b.mission_id = m.mission_id
    LEFT JOIN photos_tb photo ON photo.photo_id = b.bottle_basic_pic
    WHERE b.packed_by = ?
    ORDER BY b.updated_at DESC, b.created_at DESC
  `;

  return query(sql, [packerId]);
};

bottlesModel.getByIdForPacker = async (bottleId, packerId) => {
  if (!bottleId || !packerId) {
    return null;
  }

  const sql = `
    SELECT
      b.bottle_id,
      b.serial_number,
      b.contents,
      b.weight_grams,
      b.status,
      b.verified,
      b.mission_id,
      b.bottle_basic_pic,
      m.name AS mission_name,
      photo.url AS basic_photo_url
    FROM bottles_tb b
    LEFT JOIN missions_tb m ON b.mission_id = m.mission_id
    LEFT JOIN photos_tb photo ON photo.photo_id = b.bottle_basic_pic
    WHERE b.bottle_id = ? AND b.packed_by = ?
    LIMIT 1
  `;

  const rows = await query(sql, [bottleId, packerId]);
  return rows[0] ?? null;
};

export default bottlesModel;
