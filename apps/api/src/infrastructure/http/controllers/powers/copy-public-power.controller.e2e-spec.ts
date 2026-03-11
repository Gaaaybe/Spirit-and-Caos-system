import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('CopyPublicPowerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let otherToken: string;
  let publicPowerId: string;
  let privatePowerId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();

    await prisma.effectBase.upsert({
      where: { id: 'dano' },
      create: {
        id: 'dano',
        nome: 'Dano',
        custoBase: 2,
        descricao: 'Causa dano a um alvo.',
        categorias: ['Ataque'],
        parametrosPadraoAcao: 1,
        parametrosPadraoAlcance: 1,
        parametrosPadraoDuracao: 0,
        requerInput: false,
      },
      update: {},
    });

    await request(app.getHttpServer()).post('/users').send({
      name: 'Copy Owner',
      email: 'copyowner@example.com',
      password: '123456',
    });
    await request(app.getHttpServer()).post('/users').send({
      name: 'Copy Other',
      email: 'copyother@example.com',
      password: '123456',
    });

    ownerToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'copyowner@example.com',
        password: '123456',
      })
    ).body.access_token;

    otherToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'copyother@example.com',
        password: '123456',
      })
    ).body.access_token;

    const powerBase = {
      dominio: { name: 'natural' },
      parametros: { acao: 1, alcance: 1, duracao: 0 },
      effects: [{ effectBaseId: 'dano', grau: 2, modifications: [] }],
      globalModifications: [],
    };

    const publicPower = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        ...powerBase,
        nome: 'Poder Copiável',
        descricao: 'Este poder público pode ser copiado por qualquer usuário.',
        isPublic: true,
      });
    publicPowerId = publicPower.body.id;

    const privatePower = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        ...powerBase,
        nome: 'Poder Privado',
        descricao: 'Este poder privado não pode ser copiado por outros usuários.',
        isPublic: false,
      });
    privatePowerId = privatePower.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /powers/:powerId/copy — should return 201 with copied power', async () => {
    const response = await request(app.getHttpServer())
      .post(`/powers/${publicPowerId}/copy`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      nome: 'Poder Copiável',
      isPublic: false,
    });
    expect(response.body.id).not.toBe(publicPowerId);
  });

  test('[POST] /powers/:powerId/copy — should return 403 for private power', async () => {
    const response = await request(app.getHttpServer())
      .post(`/powers/${privatePowerId}/copy`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('[POST] /powers/:powerId/copy — should return 404 for nonexistent power', async () => {
    const response = await request(app.getHttpServer())
      .post('/powers/00000000-0000-0000-0000-000000000000/copy')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[POST] /powers/:powerId/copy — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post(`/powers/${publicPowerId}/copy`);

    expect(response.statusCode).toBe(401);
  });
});
