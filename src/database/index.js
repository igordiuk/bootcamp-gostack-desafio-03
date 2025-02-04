import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Recipient from '../app/models/Recipients';
import File from '../app/models/Files';
import Deliveryman from '../app/models/Deliverymans';
import Delivery from '../app/models/Deliveries';
import DeliveryProblem from '../app/models/DeliveryProblems';

import databaseConfig from '../config/database';

const models = [User, Recipient, File, Deliveryman, Delivery, DeliveryProblem];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
