import Delivery from '../models/Deliveries';

class DeliveryFinishController {
  async update(req, res) {
    const { id } = req.params;

    /**
     * Check for delivery exists
     */
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found!' });
    }

    const { end_date } = await delivery.update(req.body);

    return res.status(200).json({
      id,
      end_date,
    });
  }
}

export default new DeliveryFinishController();
