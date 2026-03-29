import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('Remove from Inventory (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let characterId: string;
  let itemId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();

    await request(app.getHttpServer()).post('/users').send({
      name: 'Remove User',
      email: 'remove@example.com',
      password: '123456',
    });

    const authResponse = await request(app.getHttpServer()).post('/auth').send({
      email: 'remove@example.com',
      password: '123456',
    });

    accessToken = authResponse.body.access_token;

    const createCharResponse = await request(app.getHttpServer())
      .post('/characters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        narrative: {
          identity: 'Remove Tester',
          origin: 'Lab',
          motivations: ['Testing'],
          complications: ['Bugs'],
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
        spiritualPrinciple: { isUnlocked: false },
      });

    characterId = createCharResponse.body.id;

    const itemResponse = await request(app.getHttpServer())
      .post('/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipo: 'weapon',
        nome: 'Test Sword',
        descricao: 'A sword for testing controllers',
        dominio: { name: 'arma-branca' },
        custoBase: 100,
        danos: [{ dado: '1d8', base: 'corte', espiritual: false }],
        critMargin: 2,
        critMultiplier: 2,
        alcance: 'natural',
        isPublic: true,
      });

    const templateId = itemResponse.body.id;

    const cloneResponse = await request(app.getHttpServer())
      .post(`/characters/${characterId}/items`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ itemId: templateId, quantity: 2 });

    itemId = cloneResponse.body.inventory.bag[0].itemId;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /characters/:id/items/:itemId/remove', async () => {
    const response = await request(app.getHttpServer())
      .post(`/characters/${characterId}/items/${itemId}/remove`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ quantity: 1 });

    expect(response.statusCode).toBe(200);
    const inBag = response.body.inventory.bag.find((i: any) => i.itemId === itemId);
    expect(inBag.quantity).toBe(1);
  });
});
