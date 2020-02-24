import { Op } from 'sequelize';
import File from '../models/Files';
import Delivery from '../models/Deliveries';

class FileController {
  async store(req, res) {
    const { id } = req.params;
    const { originalname: name, filename: path } = req.file;

    /**
     * Check for Delivery exist and end_date is not null
     */
    const delivery = await Delivery.findOne({
      where: { id, end_date: { [Op.not]: null } },
    });

    if (!delivery) {
      return res
        .status(401)
        .json({ error: 'Delivery not found or end data is null' });
    }

    const file = await File.create({
      name,
      path,
    });

    // get file id
    const signature_id = file.id;

    // update delivery with signature_id
    const deliverySign = await delivery.update({ signature_id });

    return res.json({
      deliverySign,
      file,
    });
  }
}

export default new FileController();
