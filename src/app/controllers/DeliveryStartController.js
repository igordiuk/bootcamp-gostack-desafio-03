import {
  startOfHour,
  isBefore,
  getHours,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';
import { Op } from 'sequelize';
import Delivery from '../models/Deliveries';

class DeliveryStartController {
  async update(req, res) {
    const { id } = req.params;
    const { start_date } = req.body;

    /**
     * Check if Delivery exists
     */
    const delivery = await Delivery.findOne({
      where: {
        id,
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    /**
     * Check for past date
     */
    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted ' });
    }

    /**
     * Check for Delivery start_date between 8h and 18h
     */
    const hour = getHours(parseISO(start_date));
    if (hour < 8 || hour > 18) {
      return res
        .status(401)
        .json({ error: 'Withdraws permited only between 8 and 18 hours' });
    }

    /**
     * Check for daily limit of deliveries by deliveryman
     */
    const dateStart = startOfDay(parseISO(start_date));
    const dateEnd = endOfDay(parseISO(start_date));
    const { deliveryman_id } = delivery;
    const { count } = await Delivery.findAndCountAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [dateStart, dateEnd],
        },
      },
    });
    if (count >= 5) {
      return res.status(400).json({
        error: `Daily withdrawal limit by deliveryman ${deliveryman_id} reached`,
      });
    }

    const { product } = await delivery.update(req.body);

    return res.status(200).json({
      id,
      deliveryman_id,
      product,
      start_date,
    });
  }
}

export default new DeliveryStartController();
