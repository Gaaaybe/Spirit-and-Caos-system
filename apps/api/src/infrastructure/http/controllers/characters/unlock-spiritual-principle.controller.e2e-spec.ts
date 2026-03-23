import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('Unlock Spiritual Principle (e2e)', () => {
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
      name: 'Spiritual User',
      email: 'spiritual@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'spiritual@example.com',
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

  test('[POST] /characters/:id/spiritual-awakening', async () => {
    await request(app.getHttpServer())
      .post(`/characters/${characterId}/level-up`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    await request(app.getHttpServer())
      .post(`/characters/${characterId}/level-up`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    const response = await request(app.getHttpServer())
      .post(`/characters/${characterId}/spiritual-awakening`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ stage: 'DIVINE' });

    expect(response.statusCode).toBe(200);
    expect(response.body.spiritualPrinciple.isUnlocked).toBe(true);
    expect(response.body.spiritualPrinciple.stage).toBe('DIVINE');
  });
});
