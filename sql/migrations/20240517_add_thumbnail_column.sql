-- Adds thumbnail_url support for turtle profile photos
ALTER TABLE `photos_tb`
  ADD COLUMN `thumbnail_url` VARCHAR(255) NULL AFTER `url`;
