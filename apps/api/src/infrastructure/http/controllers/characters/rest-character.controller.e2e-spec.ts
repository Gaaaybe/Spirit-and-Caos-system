import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('Rest Character (e2e)', () => {
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
      name: 'Rest User',
      email: 'rest@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'rest@example.com',
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

  test('[POST] /characters/:id/rest', async () => {
    const syncResponse = await request(app.getHttpServer())
      .patch(`/characters/${characterId}/sync`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pvChange: -5 });

    const pvBeforeRest = syncResponse.body.health.currentPV;

    const response = await request(app.getHttpServer())
      .post(`/characters/${characterId}/rest`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ quality: 'CONFORTAVEL', durationHours: 8 });

    expect(response.statusCode).toBe(200);
    expect(response.body.health.currentPV).toBeGreaterThanOrEqual(pvBeforeRest);
    expect(response.body.health.currentPV).toBeLessThanOrEqual(response.body.health.maxPV);
  });
});
