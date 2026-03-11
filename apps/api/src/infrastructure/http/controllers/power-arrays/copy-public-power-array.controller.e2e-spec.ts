import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('CopyPublicPowerArrayController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let otherToken: string;
  let publicArrayId: string;
  let privateArrayId: string;

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
      name: 'Array Copy Owner',
      email: 'arraycopyowner@example.com',
      password: '123456',
    });
    await request(app.getHttpServer()).post('/users').send({
      name: 'Array Copy Other',
      email: 'arraycopyother@example.com',
      password: '123456',
    });

    ownerToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'arraycopyowner@example.com',
        password: '123456',
      })
    ).body.access_token;

    otherToken = (
      await request(app.getHttpServer()).post('/auth').send({
        email: 'arraycopyother@example.com',
        password: '123456',
      })
    ).body.access_token;

    const powerBase = {
      dominio: { name: 'natural' },
      parametros: { acao: 1, alcance: 1, duracao: 0 },
      effects: [{ effectBaseId: 'dano', grau: 2, modifications: [] }],
      globalModifications: [],
    };

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        ...powerBase,
        nome: 'Poder do Acervo',
        descricao: 'Poder que pertence ao acervo copiável pelo usuário.',
        isPublic: true,
      });

    const publicArray = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        nome: 'Acervo Copiável',
        descricao: 'Este acervo público pode ser copiado por qualquer usuário do sistema.',
        dominio: { name: 'natural' },
        powerIds: [powerRes.body.id],
        isPublic: true,
      });
    publicArrayId = publicArray.body.id;

    const privateArray = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        nome: 'Acervo Privado',
        descricao: 'Este acervo privado não pode ser copiado por outros usuários do sistema.',
        dominio: { name: 'natural' },
        powerIds: [powerRes.body.id],
        isPublic: false,
      });
    privateArrayId = privateArray.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /power-arrays/:id/copy — should return 201 with copied power array', async () => {
    const response = await request(app.getHttpServer())
      .post(`/power-arrays/${publicArrayId}/copy`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      nome: 'Acervo Copiável',
      isPublic: false,
    });
    expect(response.body.id).not.toBe(publicArrayId);
    expect(response.body.powers).toHaveLength(1);
    expect(response.body.powers[0].id).not.toBe(expect.stringContaining(''));
  });

  test('[POST] /power-arrays/:id/copy — should return 403 for private power array', async () => {
    const response = await request(app.getHttpServer())
      .post(`/power-arrays/${privateArrayId}/copy`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('[POST] /power-arrays/:id/copy — should return 404 for nonexistent power array', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-arrays/00000000-0000-0000-0000-000000000000/copy')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[POST] /power-arrays/:id/copy — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).post(`/power-arrays/${publicArrayId}/copy`);

    expect(response.statusCode).toBe(401);
  });
});
