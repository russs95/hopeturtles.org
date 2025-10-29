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
    let currentUser = req.session?.user || null;
    const buwanaId = currentUser?.buwanaId ?? currentUser?.id ?? null;

    const dashboardUser = buwanaId ? await usersModel.findByBuwanaId(buwanaId) : null;

    if (dashboardUser) {
      const firstName =
        dashboardUser.first_name ||
        (dashboardUser.full_name ? dashboardUser.full_name.split(/\s+/u)[0] : null) ||
        currentUser?.firstName ||
        null;

      currentUser = {
        ...currentUser,
        id: dashboardUser.buwana_id,
        buwanaId: dashboardUser.buwana_id,
        email: dashboardUser.email,
        name: dashboardUser.full_name || firstName || currentUser?.name || null,
        firstName,
        lastLogin: dashboardUser.last_login || currentUser?.lastLogin || null,
        role: dashboardUser.role
      };

      req.session.user = currentUser;
      res.locals.currentUser = currentUser;
    }

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
      canViewUserStats,
      dashboardUser
    });
  } catch (error) {
    return next(error);
  }
};

export const renderAdmin = async (req, res, next) => {
  try {
    const [missions, turtles, hubs, boats, alerts] = await Promise.all([
      missionsModel.getAllWithStats(),
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
