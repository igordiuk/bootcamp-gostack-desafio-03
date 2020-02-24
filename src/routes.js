import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';

import RecipientController from './app/controllers/RecipientController';

import FileController from './app/controllers/FileController';

import DeliveryController from './app/controllers/DeliveryController';
import DeliveryStartController from './app/controllers/DeliveryStartController';
import DeliveryFinishController from './app/controllers/DeliveryFinishController';
import DeliverySignController from './app/controllers/DeliverySignController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import ProblemController from './app/controllers/ProblemController';

import DeliverymanController from './app/controllers/DeliverymanController';
import DeliverymanDeliveryController from './app/controllers/DeliverymanDeliveryController';
import DeliverymanDeliveryFinishController from './app/controllers/DeliverymanDeliveryFinishController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
// apply multer config
const upload = multer(multerConfig);

// autenticacao
routes.post('/sessions', SessionController.store);

// apply authenticate method to all routes after it
routes.use(authMiddleware);

// recipients routes
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

// files routes
routes.post('/files', upload.single('file'), FileController.store);

// deliveryman routes
routes.get('/deliveryman', DeliverymanController.index);
routes.get('/deliveryman/:id', DeliverymanController.show);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

// deliveryman x delivery routes
routes.get('/deliveryman/:id/deliveries', DeliverymanDeliveryController.index);
routes.get(
  '/deliveryman/:id/deliveries/finish',
  DeliverymanDeliveryFinishController.index
);

// delivery routes
routes.get('/delivery', DeliveryController.index);
routes.get('/delivery/:id', DeliveryController.show);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery/:id', DeliveryController.update);
routes.delete('/delivery/:id', DeliveryController.delete);

// delivery status update
routes.put('/delivery/:id/start', DeliveryStartController.update);
routes.put('/delivery/:id/finish', DeliveryFinishController.update);
routes.post(
  '/delivery/:id/sign',
  upload.single('file'),
  DeliverySignController.store
);

// delivery problem routes
routes.get('/delivery/:id/problems', DeliveryProblemController.index);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);

// problem routes
routes.get('/problem', ProblemController.index);
routes.put('/problem/:id', ProblemController.update);
routes.delete('/problem/:id/cancel-delivery', ProblemController.delete);

export default routes;
