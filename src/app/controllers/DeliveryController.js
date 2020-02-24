import * as Yup from 'yup';
import Delivery from '../models/Deliveries';
import Recipient from '../models/Recipients';
import Deliveryman from '../models/Deliverymans';
import File from '../models/Files';

import Notification from '../schemas/Notification';

// import Mail from '../../lib/Mail';
import NewRecipientMail from '../jobs/NewRecepientMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      order: ['start_date'],
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'start_date',
        'end_date',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'zipcode',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!deliveries || deliveries.length === 0) {
      return res.status(401).json({ error: 'Deliveries not found' });
    }

    return res.status(200).json({ deliveries });
  }

  async show(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findOne({
      where: { id },
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!delivery || delivery.length === 0) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    return res.status(200).json({ delivery });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    /**
     * Check if recipient_id exists
     */
    const recipientExists = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipientExists) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    /**
     * Check if deliveryman exists
     * Use name and email information to send a email message
     */
    const deliverymanExists = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    const delivery = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    /**
     * Notify deliveryman
     */
    await Notification.create({
      content: `Alerta para Nova Entrega para ${deliverymanExists.name} do Produto: ${product}`,
      user: deliveryman_id,
    });

    // await Mail.sendMail({
    //   to: `${deliverymanExists.name} <${deliverymanExists.email}>`,
    //   subject: 'Alerta para Nova Entrega',
    //   template: 'newRecipient',
    //   context: {
    //     deliveryman: deliverymanExists.name,
    //     product,
    //   },
    // });

    await Queue.add(NewRecipientMail.key, {
      deliverymanExists,
      product,
    });

    return res.json({ delivery });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    /**
     * Check if recipient_id exists
     */
    const recipientExists = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipientExists) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    /**
     * Check if deliveryman exists
     */
    const deliverymanExists = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findOne({ where: { id } });

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    const { product } = await delivery.update(req.body);

    return res.status(200).json({
      id,
      recipient_id,
      deliveryman_id,
      product,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    delivery.destroy(id);

    return res.status(200).json();
  }
}

export default new DeliveryController();
