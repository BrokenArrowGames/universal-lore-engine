import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InitTestNestApp } from './util/app-init';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await InitTestNestApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'tst', password: '1234' })
      .expect(200)
      .expect('');
  });

  // TODO: probably needs mock db calls
  it.skip('/user (GET)', () => {
    return request(app.getHttpServer()).get('/user').expect(200).expect('');
  });
});
