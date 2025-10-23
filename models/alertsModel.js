import { query } from '../config/db.js';
import { createModel } from './baseModel.js';

const alertsModel = createModel('alerts_tb', 'alert_id');

alertsModel.getActive = async () => {
  return query('SELECT * FROM alerts_tb WHERE status = "active" ORDER BY created_at DESC');
};

export default alertsModel;
