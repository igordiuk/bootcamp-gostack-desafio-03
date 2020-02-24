import Delivery from '../models/Deliveries';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { id } = req.params;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
      order: ['start_date', 'id'],
    });

    if (!deliveries) {
      return res.status(401).json({
        error: `Deliveries not found for Deliveryman ID: ${id}`,
      });
    }

    return res.status(200).json(deliveries);
  }
}

export default new DeliverymanDeliveryController();
