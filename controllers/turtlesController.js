import turtlesModel from '../models/turtlesModel.js';
import telemetryModel from '../models/telemetryModel.js';
import photosModel from '../models/photosModel.js';
import missionsModel from '../models/missionsModel.js';

export const getTurtles = async (req, res, next) => {
  try {
    const turtles = await turtlesModel.getAllDetailed();
    return res.json({ success: true, data: turtles });
  } catch (error) {
    return next(error);
  }
};

export const getTurtleById = async (req, res, next) => {
  try {
    const turtle = await turtlesModel.getById(req.params.id);
    if (!turtle) {
      return res.status(404).json({ success: false, message: 'Turtle not found' });
    }
    return res.json({ success: true, data: turtle });
  } catch (error) {
    return next(error);
  }
};

export const createTurtle = async (req, res, next) => {
  try {
    const turtle = await turtlesModel.create(req.body);
    return res.status(201).json({ success: true, data: turtle });
  } catch (error) {
    return next(error);
  }
};

export const updateTurtle = async (req, res, next) => {
  try {
    const turtle = await turtlesModel.update(req.params.id, req.body);
    return res.json({ success: true, data: turtle });
  } catch (error) {
    return next(error);
  }
};

export const deleteTurtle = async (req, res, next) => {
  try {
    await turtlesModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Turtle removed' });
  } catch (error) {
    return next(error);
  }
};

export const renderTurtlePage = async (req, res, next) => {
  try {
    const turtle = await turtlesModel.getById(req.params.id);
    if (!turtle) {
      return res.status(404).render('error', {
        pageTitle: 'Turtle not found',
        message: 'The requested turtle could not be located.'
      });
    }
    const telemetry = await telemetryModel.getByTurtleId(req.params.id, 100);
    const photos = await photosModel.getForEntity('turtle', req.params.id);
    const mission = turtle.mission_id
      ? await missionsModel.getById(turtle.mission_id)
      : null;
    return res.render('turtle', {
      pageTitle: turtle.name,
      turtle,
      telemetry,
      photos,
      mission
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getTurtles,
  getTurtleById,
  createTurtle,
  updateTurtle,
  deleteTurtle,
  renderTurtlePage
};
