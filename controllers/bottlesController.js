import bottlesModel from '../models/bottlesModel.js';

const getCurrentUserId = (req) => req.session?.user?.buwanaId ?? req.session?.user?.id ?? null;

const normalizeStatus = (status) => {
  if (!status) {
    return 'please ship';
  }

  const allowedStatuses = [
    'please ship',
    'shipping',
    'hub received',
    'verifying',
    'delivering to boat',
    'boat transit',
    'hopeturtle transit',
    'arrived'
  ];

  const normalized = status.toLowerCase();
  return allowedStatuses.includes(normalized) ? normalized : 'please ship';
};

export const listBottles = async (req, res, next) => {
  try {
    const bottles = await bottlesModel.getAll();
    return res.json({ success: true, data: bottles });
  } catch (error) {
    return next(error);
  }
};

export const getBottle = async (req, res, next) => {
  try {
    const bottle = await bottlesModel.getById(req.params.id);
    if (!bottle) {
      return res.status(404).json({ success: false, message: 'Bottle not found' });
    }
    return res.json({ success: true, data: bottle });
  } catch (error) {
    return next(error);
  }
};

export const createBottle = async (req, res, next) => {
  try {
    const bottle = await bottlesModel.create(req.body);
    return res.status(201).json({ success: true, data: bottle });
  } catch (error) {
    return next(error);
  }
};

export const updateBottle = async (req, res, next) => {
  try {
    const bottle = await bottlesModel.update(req.params.id, req.body);
    if (!bottle) {
      return res.status(404).json({ success: false, message: 'Bottle not found' });
    }
    return res.json({ success: true, data: bottle });
  } catch (error) {
    return next(error);
  }
};

export const deleteBottle = async (req, res, next) => {
  try {
    await bottlesModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Bottle removed' });
  } catch (error) {
    return next(error);
  }
};

export const listMyBottles = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const bottles = await bottlesModel.getForPackerWithDetails(userId);
    return res.json({ success: true, data: bottles });
  } catch (error) {
    return next(error);
  }
};

export const registerMyBottle = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {
      serial_number: serialNumber,
      brand,
      volume_ml: volume,
      mission_id: missionId,
      contents,
      weight_grams: weight,
      status
    } = req.body ?? {};

    if (!serialNumber || !String(serialNumber).trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Serial number is required to register a bottle.' });
    }

    const payload = {
      serial_number: String(serialNumber).trim(),
      packed_by: userId,
      status: normalizeStatus(status),
      verified: 0,
      date_packed: new Date()
    };

    if (brand) {
      payload.brand = String(brand);
    }

    if (volume !== undefined && volume !== null && String(volume).trim() !== '') {
      const parsedVolume = Number(volume);
      if (!Number.isNaN(parsedVolume) && parsedVolume >= 0) {
        payload.volume_ml = parsedVolume;
      }
    }

    if (missionId !== undefined && missionId !== null && String(missionId).trim() !== '') {
      const parsedMission = Number(missionId);
      if (!Number.isNaN(parsedMission)) {
        payload.mission_id = parsedMission;
      }
    }

    if (contents && String(contents).trim()) {
      payload.contents = String(contents).trim();
    }

    if (weight !== undefined && weight !== null && String(weight).trim() !== '') {
      const parsedWeight = Number(weight);
      if (!Number.isNaN(parsedWeight) && parsedWeight >= 0) {
        payload.weight_grams = parsedWeight;
      }
    }

    const created = await bottlesModel.create(payload);
    const bottleWithDetails = await bottlesModel.getByIdForPacker(created.bottle_id, userId);

    const responseBottle = bottleWithDetails
      ? bottleWithDetails
      : {
          ...created,
          mission_name: null,
          basic_photo_url: null
        };

    return res.status(201).json({ success: true, data: responseBottle });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ success: false, message: 'A bottle with this serial number already exists.' });
    }

    return next(error);
  }
};

export default {
  listBottles,
  getBottle,
  createBottle,
  updateBottle,
  deleteBottle,
  listMyBottles,
  registerMyBottle
};
