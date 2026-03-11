import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('GetPowerByIdController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let createdPowerId: string;

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
      name: 'Get Power User',
      email: 'getpower@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'getpower@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const created = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Raio do Caos',
        descricao: 'Um raio de energia pura do caos primordial.',
        dominio: { name: 'natural' },
        parametros: { acao: 1, alcance: 2, duracao: 0 },
        effects: [{ effectBaseId: 'dano', grau: 2, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });

    createdPowerId = created.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /powers/:powerId — should return 200 with correct shape', async () => {
    const response = await request(app.getHttpServer())
      .get(`/powers/${createdPowerId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: createdPowerId,
      nome: 'Raio do Caos',
      dominio: { name: 'natural' },
      parametros: { acao: 1, alcance: 2, duracao: 0 },
      custoTotal: { pda: expect.any(Number), pe: expect.any(Number), espacos: expect.any(Number) },
      effects: expect.arrayContaining([expect.objectContaining({ effectBaseId: 'dano', grau: 2 })]),
    });
  });

  test('[GET] /powers/:powerId — should return 404 for nonexistent id', async () => {
    const response = await request(app.getHttpServer())
      .get('/powers/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /powers/:powerId — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get(`/powers/${createdPowerId}`);

    expect(response.statusCode).toBe(401);
  });
});
