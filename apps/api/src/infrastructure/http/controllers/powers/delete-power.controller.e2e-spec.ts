import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('DeletePowerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let otherToken: string;

  const powerBody = {
    nome: 'Poder para Deletar',
    descricao: 'Este poder será deletado durante o teste de deleção.',
    dominio: { name: 'sagrado' },
    parametros: { acao: 2, alcance: 1, duracao: 0 },
    effects: [{ effectBaseId: 'dano', grau: 1, modifications: [] }],
    globalModifications: [],
    isPublic: false,
  };

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
      name: 'Delete Owner',
      email: 'deleteowner@example.com',
      password: '123456',
    });
    await request(app.getHttpServer()).post('/users').send({
      name: 'Delete Other',
      email: 'deleteother@example.com',
      password: '123456',
    });

    ownerToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'deleteowner@example.com',
        password: '123456',
      })
    ).body.access_token;

    otherToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'deleteother@example.com',
        password: '123456',
      })
    ).body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[DELETE] /powers/:powerId — should return 403 when user does not own the power', async () => {
    const created = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(powerBody);

    const response = await request(app.getHttpServer())
      .delete(`/powers/${created.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('[DELETE] /powers/:powerId — should return 204 and delete the power', async () => {
    const created = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(powerBody);

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/powers/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await request(app.getHttpServer())
      .get(`/powers/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(getResponse.statusCode).toBe(404);
  });

  test('[DELETE] /powers/:powerId — should return 404 for nonexistent id', async () => {
    const response = await request(app.getHttpServer())
      .delete('/powers/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[DELETE] /powers/:powerId — should return 401 without token', async () => {
    const created = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(powerBody);

    const response = await request(app.getHttpServer()).delete(`/powers/${created.body.id}`);

    expect(response.statusCode).toBe(401);
  });
});
