const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

async function uploadVehicleImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded.', 400));
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.vehicleId } });
    if (!vehicle) return next(new AppError('Vehicle not found.', 404));

    // Check if this vehicle already has a primary image
    const hasPrimary = await prisma.vehicleImage.findFirst({
      where: { vehicleId: vehicle.id, isPrimary: true },
    });

    const images = await prisma.vehicleImage.createMany({
      data: req.files.map((file, index) => ({
        vehicleId: vehicle.id,
        url: `/uploads/${file.filename}`,
        isPrimary: !hasPrimary && index === 0, // first upload becomes primary
      })),
    });

    res.status(201).json({ success: true, message: `${req.files.length} image(s) uploaded.` });
  } catch (err) { next(err); }
}

async function deleteVehicleImage(req, res, next) {
  try {
    const image = await prisma.vehicleImage.findFirst({
      where: { id: req.params.imageId, vehicleId: req.params.vehicleId },
    });
    if (!image) return next(new AppError('Image not found.', 404));

    // Delete file from disk
    const filePath = path.join(process.cwd(), image.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.vehicleImage.delete({ where: { id: image.id } });
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) { next(err); }
}

async function setPrimaryImage(req, res, next) {
  try {
    const image = await prisma.vehicleImage.findFirst({
      where: { id: req.params.imageId, vehicleId: req.params.vehicleId },
    });
    if (!image) return next(new AppError('Image not found.', 404));

    // Unset all primary for this vehicle, then set the new one
    await prisma.$transaction([
      prisma.vehicleImage.updateMany({
        where: { vehicleId: req.params.vehicleId },
        data: { isPrimary: false },
      }),
      prisma.vehicleImage.update({
        where: { id: image.id },
        data: { isPrimary: true },
      }),
    ]);

    res.json({ success: true, message: 'Primary image updated.' });
  } catch (err) { next(err); }
}

module.exports = { uploadVehicleImages, deleteVehicleImage, setPrimaryImage };
