import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const photosModel = createModel('photos_tb', 'photo_id');

photosModel.getForEntity = async (type, id) => {
  return query(
    'SELECT * FROM photos_tb WHERE related_type = ? AND related_id = ? ORDER BY uploaded_at DESC',
    [type, id]
  );
};

export default photosModel;
