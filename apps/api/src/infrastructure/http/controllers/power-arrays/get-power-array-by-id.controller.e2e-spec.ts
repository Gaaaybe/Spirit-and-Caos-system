import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

describe('GetPowerArrayByIdController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let powerArrayId: string;

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
      name: 'Array Getter',
      email: 'arraygetter@example.com',
      password: '123456',
    });

    const auth = await request(app.getHttpServer()).post('/auth').send({
      email: 'arraygetter@example.com',
      password: '123456',
    });
    accessToken = auth.body.access_token;

    const powerRes = await request(app.getHttpServer())
      .post('/powers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Escudo Mágico',
        descricao: 'Cria uma barreira protetora ao redor do usuário.',
        dominio: { name: 'sagrado' },
        parametros: { acao: 1, alcance: 0, duracao: 2 },
        effects: [{ effectBaseId: 'dano', grau: 1, modifications: [] }],
        globalModifications: [],
        isPublic: false,
      });

    const arrayRes = await request(app.getHttpServer())
      .post('/power-arrays')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nome: 'Kit Defensivo',
        descricao: 'Conjunto de poderes voltados para proteção e defesa em combate.',
        dominio: { name: 'sagrado' },
        powerIds: [powerRes.body.id],
        isPublic: false,
      });

    powerArrayId = arrayRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /power-arrays/:id — should return 200 with correct shape', async () => {
    const response = await request(app.getHttpServer())
      .get(`/power-arrays/${powerArrayId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: powerArrayId,
      nome: 'Kit Defensivo',
      dominio: { name: 'sagrado' },
      custoTotal: { pda: expect.any(Number), pe: expect.any(Number), espacos: expect.any(Number) },
      powers: expect.any(Array),
    });
  });

  test('[GET] /power-arrays/:id — should return 404 for nonexistent id', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-arrays/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('[GET] /power-arrays/:id — should return 401 without token', async () => {
    const response = await request(app.getHttpServer()).get(`/power-arrays/${powerArrayId}`);
    expect(response.statusCode).toBe(401);
  });
});
