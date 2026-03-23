import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('Tick Death Counter (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let characterId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'Death User',
      email: 'death@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'death@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    const createResponse = await request(app.getHttpServer())
      .post('/characters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        narrative: {
          identity: 'Hero',
          origin: 'Village',
          motivations: ['Justice'],
          complications: ['Enemies'],
        },
        attributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          keyPhysical: 'strength',
          keyMental: 'wisdom',
        },
        spiritualPrinciple: {
          isUnlocked: false,
        },
      });

    characterId = createResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /characters/:id/death-tick', async () => {
    await request(app.getHttpServer())
      .patch(`/characters/${characterId}/sync`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pvChange: -100 });

    const response = await request(app.getHttpServer())
      .post(`/characters/${characterId}/death-tick`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.death.counter).toBe(1);
  });
});
