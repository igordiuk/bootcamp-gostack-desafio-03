import * as Yup from 'yup';
import { startOfHour } from 'date-fns';
import DeliveryProblem from '../models/DeliveryProblems';
import Delivery from '../models/Deliveries';
import Deliveryman from '../models/Deliverymans';

// import Mail from '../../lib/Mail';
import CancelRecipientMail from '../jobs/CancelRecepientMail';
import Queue from '../../lib/Queue';

class ProblemController {
  async index(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll({
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

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Check if delivery problem exists
     */
    const deliveryProblemExists = await DeliveryProblem.findOne({
      where: { id },
    });

    if (!deliveryProblemExists) {
      return res.status(401).json({ error: 'Delivery Problem not found' });
    }

    const { description } = await deliveryProblemExists.update(req.body);

    return res.status(200).json({
      id,
      description,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    /**
     * Check for problem exists
     */
    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) {
      return res.status(401).json({ error: 'Problem not found' });
    }

    /**
     * Check for delivery exists
     */
    const delivery = await Delivery.findByPk(problem.delivery_id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    // get product to compose email message
    const { product } = delivery;

    // get deliveryman info to compose email message
    const deliveryman = await Deliveryman.findOne({
      where: {
        id: delivery.deliveryman_id,
      },
    });

    // get canceled date
    const canceledDate = startOfHour(new Date());

    const canceled = await delivery.update({ canceled_at: canceledDate });

    // send canceled email message
    await Queue.add(CancelRecipientMail.key, {
      deliveryman,
      product,
    });

    return res.status(200).json({ canceled });
  }
}

export default new ProblemController();
