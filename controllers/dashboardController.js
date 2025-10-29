import missionsModel from '../models/missionsModel.js';
import turtlesModel from '../models/turtlesModel.js';
import telemetryModel from '../models/telemetryModel.js';
import successModel from '../models/successModel.js';
import alertsModel from '../models/alertsModel.js';
import hubsModel from '../models/hubsModel.js';
import boatsModel from '../models/boatsModel.js';
import usersModel from '../models/usersModel.js';

export const renderDashboard = async (req, res, next) => {
  try {
    const currentUser = req.session?.user;
    const canViewUserStats = Boolean(currentUser && currentUser.role === 'admin');

    const [missions, turtles, telemetry, successEntries, alerts, userStats] = await Promise.all([
      missionsModel.getAll(),
      turtlesModel.getAll(),
      telemetryModel.getLatest(),
      successModel.getRecent(10),
      alertsModel.getActive(),
      canViewUserStats ? usersModel.getDashboardStats() : Promise.resolve(null)
    ]);
    return res.render('dashboard', {
      pageTitle: 'Dashboard',
      missions,
      turtles,
      telemetry,
      successEntries,
      alerts,
      userStats,
      canViewUserStats
    });
  } catch (error) {
    return next(error);
  }
};

export const renderAdmin = async (req, res, next) => {
  try {
    const [missions, turtles, hubs, boats, alerts] = await Promise.all([
      missionsModel.getAll(),
      turtlesModel.getAll(),
      hubsModel.getAll(),
      boatsModel.getAll(),
      alertsModel.getAll()
    ]);
    return res.render('admin', {
      pageTitle: 'Admin Tools',
      missions,
      turtles,
      hubs,
      boats,
      alerts
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  renderDashboard,
  renderAdmin
};
