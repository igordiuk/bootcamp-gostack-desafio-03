import Mail from '../../lib/Mail';

class CancelRecipientMail {
  get key() {
    return 'CancelRecipientMail';
  }

  async handle({ data }) {
    const { deliveryman, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Alerta para Cancelemento de Entrega',
      template: 'cancelRecipient',
      context: {
        deliveryman: deliveryman.name,
        product,
      },
    });
  }
}

export default new CancelRecipientMail();
