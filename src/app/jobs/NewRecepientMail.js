import Mail from '../../lib/Mail';

class NewRecipientMail {
  get key() {
    return 'NewRecipientMail';
  }

  async handle({ data }) {
    const { deliverymanExists, product } = data;

    await Mail.sendMail({
      to: `${deliverymanExists.name} <${deliverymanExists.email}>`,
      subject: 'Alerta para Nova Entrega',
      template: 'newRecipient',
      context: {
        deliveryman: deliverymanExists.name,
        product,
      },
    });
  }
}

export default new NewRecipientMail();
