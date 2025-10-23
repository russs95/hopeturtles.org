import photosModel from '../models/photosModel.js';

export const getPhotos = async (req, res, next) => {
  try {
    const { type, id } = req.query;
    if (!type || !id) {
      return res
        .status(400)
        .json({ success: false, message: 'type and id query parameters are required' });
    }
    const photos = await photosModel.getForEntity(type, Number(id));
    return res.json({ success: true, data: photos });
  } catch (error) {
    return next(error);
  }
};

export const createPhoto = async (req, res, next) => {
  try {
    const photo = await photosModel.create(req.body);
    return res.status(201).json({ success: true, data: photo });
  } catch (error) {
    return next(error);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    await photosModel.remove(req.params.id);
    return res.json({ success: true, data: null, message: 'Photo removed' });
  } catch (error) {
    return next(error);
  }
};

export default {
  getPhotos,
  createPhoto,
  deletePhoto
};
