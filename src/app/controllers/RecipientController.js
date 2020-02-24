import * as Yup from 'yup';
import Recipient from '../models/Recipients';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll();

    if (!recipients || recipients.length === 0) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    return res.status(200).json({ recipients });
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findOne({ where: { id } });

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }
    return res.status(200).json({ recipient });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zipcode: Yup.number()
        .required()
        .min(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.create(req.body);

    return res.status(201).json({
      recipient,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zipcode: Yup.number()
        .required()
        .min(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findOne({ where: { id } });

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    const {
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    } = await recipient.update(req.body);

    return res.status(200).json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    recipient.destroy(id);

    return res.status(200).json();
  }
}

export default new RecipientController();
