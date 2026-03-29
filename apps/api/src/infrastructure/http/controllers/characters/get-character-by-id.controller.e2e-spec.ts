import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('GetCharacterByIdController (e2e)', () => {
  let app: INestApplication;
  let characterId: string;
  let accessToken: string;

  const validCharacterBody = {
    narrative: {
      identity: 'Get Test Character',
      origin: 'Get Test Origin',
      motivations: ['Get Test Motivation'],
      complications: ['Get Test Complication'],
    },
    attributes: {
      strength: 3,
      dexterity: 1,
      constitution: 2,
      intelligence: 2,
      wisdom: 3,
      charisma: 1,
      keyPhysical: 'strength',
      keyMental: 'wisdom',
    },
    spiritualPrinciple: {
      isUnlocked: false,
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'Get User',
      email: 'getuser@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'getuser@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    const createResponse = await request(app.getHttpServer())
      .post('/characters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validCharacterBody);

    characterId = createResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /characters/:characterId — should return 200 with character', async () => {
    const response = await request(app.getHttpServer())
      .get(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: characterId,
      narrative: {
        identity: 'Get Test Character',
        origin: 'Get Test Origin',
      },
      attributes: {
        strength: { baseValue: 3 },
        dexterity: { baseValue: 1 },
        constitution: { baseValue: 2 },
        wisdom: { baseValue: 3 },
        keyPhysical: 'strength',
        keyMental: 'wisdom',
      },
    });
  });

  test('[GET] /characters/:characterId — should return character with original narrative', async () => {
    const response = await request(app.getHttpServer())
      .get(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.narrative.motivations).toEqual(['Get Test Motivation']);
    expect(response.body.narrative.complications).toEqual(['Get Test Complication']);
  });

  test('[GET] /characters/:characterId — should return 404 for non-existent character', async () => {
    const response = await request(app.getHttpServer())
      .get('/characters/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /characters/:characterId — should return character with all attributes', async () => {
    const response = await request(app.getHttpServer())
      .get(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.attributes).toMatchObject({
      strength: expect.objectContaining({ baseValue: expect.any(Number) }),
      dexterity: expect.objectContaining({ baseValue: expect.any(Number) }),
      constitution: expect.objectContaining({ baseValue: expect.any(Number) }),
      intelligence: expect.objectContaining({ baseValue: expect.any(Number) }),
      wisdom: expect.objectContaining({ baseValue: expect.any(Number) }),
      charisma: expect.objectContaining({ baseValue: expect.any(Number) }),
    });
  });
});
