import path from 'path';
import bottlesModel from '../models/bottlesModel.js';
import photosModel from '../models/photosModel.js';

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
      brand,
      volume_ml: volume,
      mission_id: missionId,
      hub_id: hubId,
      turtle_id: turtleId,
      contents,
      weight_grams: weight,
      status
    } = req.body ?? {};

    const tempSerial = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
      serial_number: tempSerial,
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

    if (hubId !== undefined && hubId !== null && String(hubId).trim() !== '') {
      const parsedHub = Number(hubId);
      if (!Number.isNaN(parsedHub)) {
        payload.hub_id = parsedHub;
      }
    }

    if (turtleId !== undefined && turtleId !== null && String(turtleId).trim() !== '') {
      const parsedTurtle = Number(turtleId);
      if (!Number.isNaN(parsedTurtle)) {
        payload.turtle_id = parsedTurtle;
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
    const generatedSerial = String(created.bottle_id).padStart(7, '0');
    await bottlesModel.update(created.bottle_id, { serial_number: generatedSerial });
    const bottleWithDetails = await bottlesModel.getByIdForPacker(created.bottle_id, userId);

    const responseBottle = bottleWithDetails
      ? bottleWithDetails
      : {
          ...created,
          serial_number: generatedSerial,
          mission_name: null,
          basic_photo_url: null,
          selfie_photo_url: null,
          hub_name: null,
          hub_mailing_address: null
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

export const deleteMyBottle = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const bottleIdRaw = req.params.id;
    const bottleId = Number(bottleIdRaw);
    if (!Number.isFinite(bottleId)) {
      return res.status(400).json({ success: false, message: 'Invalid bottle identifier.' });
    }

    const bottle = await bottlesModel.getByIdForPacker(bottleId, userId);
    if (!bottle) {
      return res.status(404).json({ success: false, message: 'Bottle not found.' });
    }

    await bottlesModel.remove(bottleId);
    return res.json({ success: true, data: null, message: 'Bottle deleted.' });
  } catch (error) {
    return next(error);
  }
};

export const submitBottleDeliveryDetails = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const bottleIdRaw = req.params.id;
    const bottleId = Number(bottleIdRaw);
    if (!Number.isFinite(bottleId)) {
      return res.status(400).json({ success: false, message: 'Invalid bottle identifier.' });
    }

    const bottle = await bottlesModel.getByIdForPacker(bottleId, userId);
    if (!bottle) {
      return res.status(404).json({ success: false, message: 'Bottle not found.' });
    }

    const files = req.files ?? {};
    const basicPhoto = Array.isArray(files.bottle_basic_photo) ? files.bottle_basic_photo[0] : null;
    const selfiePhoto = Array.isArray(files.bottle_selfie_photo) ? files.bottle_selfie_photo[0] : null;

    if (!basicPhoto) {
      return res
        .status(400)
        .json({ success: false, message: 'Please upload a photo of your aid bottle.' });
    }

    const uploadedByRaw = req.session?.user?.buwanaId ?? req.session?.user?.id ?? null;
    const uploadedByNumber =
      uploadedByRaw !== null && uploadedByRaw !== undefined ? Number(uploadedByRaw) : null;
    const uploadedBy = Number.isFinite(uploadedByNumber) ? uploadedByNumber : null;

    const updates = {};

    const savePhoto = async (file) => {
      const photo = await photosModel.create({
        related_type: 'bottle',
        related_id: bottleId,
        uploaded_by: uploadedBy,
        url: path.posix.join('/uploads', file.filename)
      });
      return photo;
    };

    const savedBasicPhoto = await savePhoto(basicPhoto);
    updates.bottle_basic_pic = savedBasicPhoto.photo_id;
    updates.status = 'please ship';

    if (selfiePhoto) {
      try {
        const savedSelfiePhoto = await savePhoto(selfiePhoto);
        updates.bottle_selfie_pic = savedSelfiePhoto.photo_id;
      } catch (selfieError) {
        console.error('Failed to attach bottle selfie photo', selfieError);
      }
    }

    await bottlesModel.update(bottleId, updates);

    const updatedBottle = await bottlesModel.getByIdForPacker(bottleId, userId);

    return res.json({ success: true, data: updatedBottle });
  } catch (error) {
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
  registerMyBottle,
  deleteMyBottle,
  submitBottleDeliveryDetails
};
