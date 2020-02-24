import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblems';
import Delivery from '../models/Deliveries';

class DeliveryProblemController {
  async index(req, res) {
    const { id } = req.params;

    const deliveryProblems = await DeliveryProblem.findAll({
      where: { delivery_id: id },
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['product'],
        },
      ],
    });

    if (!deliveryProblems || deliveryProblems.length === 0) {
      return res.status(401).json({ error: 'Delivery Problems not found' });
    }

    return res.status(200).json({ deliveryProblems });
  }

  async store(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { description } = req.body;

    /**
     * Check if delivery_id exists
     */
    const deliveryExists = await Delivery.findOne({
      where: { id },
    });

    if (!deliveryExists) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    return res.json({ deliveryProblem });
  }
}

export default new DeliveryProblemController();
