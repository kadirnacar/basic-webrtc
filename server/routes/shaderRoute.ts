import ShaderService from '../services/shader';
import { Request, Response, Router } from 'express';
import { Shader } from '../models/shader';
import { uuidv4 } from '../../tools';

export class ShaderRouter {
  router: Router;
  shaderService: ShaderService;

  constructor() {
    this.shaderService = new ShaderService();
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const data = this.shaderService.allT<Shader>();
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async getItem(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const data = this.shaderService.get(id.toString());
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async deleteItem(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      this.shaderService.delete(id);
      res.status(200).send({ status: 'success' });
    } catch (err) {
      next(err);
    }
  }

  //   public async updateItem(req: Request, res: Response, next) {
  //     try {
  //       const values = { ...req.body };
  //       const data = Services.Lang.save(values);
  //       res.status(200).send(null);
  //     } catch (err) {
  //       next(err);
  //     }
  //   }

  public async createItem(req: Request, res: Response, next) {
    try {
      const values = { ...req.body };
      values.id = uuidv4();
      this.shaderService.save(values);
      res.status(200).send(this.shaderService.all());
    } catch (err) {
      next(err);
    }
  }

  //   public async createItems(req: Request, res: Response, next) {
  //     try {
  //       var values: any[] = req.body;
  //       let data = await Services.Data.getList('Translate');
  //       for (let index = 0; index < values.length; index++) {
  //         const hasTranslate = data.find((x) => x.Value == values[index]);
  //         if (!hasTranslate) {
  //           await Services.Data.save('Translate', {
  //             Value: values[index],
  //             Trans: values[index],
  //           });
  //         }
  //       }
  //       data = await Services.Data.getList('Translate');
  //       res.status(200).send(data);
  //     } catch (err) {
  //       next(err);
  //     }
  //   }

  async init() {
    this.router.get('/list', this.getList.bind(this));
    this.router.get('/item/:id', this.getItem.bind(this));
    this.router.delete('/:id', this.deleteItem.bind(this));
    // this.router.patch('/', this.updateItem.bind(this));
    this.router.post('/', this.createItem.bind(this));
    // this.router.post('/translate', this.createItems.bind(this));
  }
}
