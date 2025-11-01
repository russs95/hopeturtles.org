import crypto from 'crypto';
import path from 'path';
import turtlesModel from '../models/turtlesModel.js';
import telemetryModel from '../models/telemetryModel.js';
import photosModel from '../models/photosModel.js';
import missionsModel from '../models/missionsModel.js';

const createTurtleSecret = () => {
  const secret = crypto.randomBytes(32).toString('hex');
  const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
  return { secret, secretHash };
};

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
    const { secret, secretHash } = createTurtleSecret();
    const turtle = await turtlesModel.create({ ...req.body, secret_hash: secretHash });
    let turtleWithPhoto = turtle;

    if (req.file) {
      try {
        const uploadedByRaw = req.session?.user?.buwanaId ?? req.session?.user?.id ?? null;
        const uploadedByNumber =
          uploadedByRaw !== null && uploadedByRaw !== undefined
            ? Number(uploadedByRaw)
            : null;
        const photo = await photosModel.create({
          related_type: 'turtle',
          related_id: turtle.turtle_id,
          uploaded_by: Number.isFinite(uploadedByNumber) ? uploadedByNumber : null,
          url: path.posix.join('/uploads', req.file.filename)
        });
        turtleWithPhoto = await turtlesModel.update(turtle.turtle_id, {
          profile_photo_id: photo.photo_id
        });
        turtleWithPhoto.profile_photo_url = photo.url;
      } catch (photoError) {
        console.error('Failed to attach profile photo to turtle', photoError);
      }
    }

    return res.status(201).json({ success: true, data: turtleWithPhoto, secret });
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

export const regenerateTurtleSecret = async (req, res, next) => {
  try {
    const turtleId = req.params.id;
    const turtle = await turtlesModel.getById(turtleId);
    if (!turtle) {
      return res.status(404).json({ success: false, message: 'Turtle not found' });
    }

    const { secret, secretHash } = createTurtleSecret();
    const updated = await turtlesModel.update(turtleId, { secret_hash: secretHash });

    return res.json({ success: true, data: updated, secret });
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
  regenerateTurtleSecret,
  deleteTurtle,
  renderTurtlePage
};
