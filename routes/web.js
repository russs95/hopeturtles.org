import { Router } from 'express';
import missionsController from '../controllers/missionsController.js';
import turtlesController from '../controllers/turtlesController.js';
import successController from '../controllers/successController.js';
import dashboardController from '../controllers/dashboardController.js';
import { ensureAdmin, ensureAdminOrFounder, ensureAuth } from '../middleware/auth.js';
import { getPlatformSummary } from '../models/summaryModel.js';
import missionsModel from '../models/missionsModel.js';
import successModel from '../models/successModel.js';
import { renderManagementPage } from '../controllers/usersController.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [summary, missions, successEntries] = await Promise.all([
      getPlatformSummary(),
      missionsModel.getAllWithHub({ status: 'active' }),
      successModel.getRecent(6)
    ]);
    return res.render('index', {
      pageTitle: 'HopeTurtles.org',
      summary,
      missions,
      successEntries
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/missions', missionsController.renderExplorer);
router.get('/turtles/:id', turtlesController.renderTurtlePage);
router.get('/success', successController.renderSuccessPage);

router.get('/login', (req, res) => {
  res.render('login', { pageTitle: 'Login' });
});

router.get('/dashboard', ensureAuth, dashboardController.renderDashboard);
router.get('/admin', ensureAuth, ensureAdmin, dashboardController.renderAdmin);
router.get('/admin/users', ensureAuth, ensureAdminOrFounder, renderManagementPage);

router.post('/theme', (req, res) => {
  const { theme } = req.body;
  res.cookie('theme', theme, { maxAge: 31536000000, sameSite: 'lax' });
  return res.json({ success: true, theme });
});

router.post('/language', (req, res) => {
  const { lang } = req.body;
  res.cookie('lang', lang, { maxAge: 31536000000, sameSite: 'lax' });
  return res.json({ success: true, lang });
});

export default router;
