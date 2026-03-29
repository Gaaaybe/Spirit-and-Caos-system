import { Peculiarity } from '@/domain/power-manager/enterprise/entities/peculiarity';

export class PeculiarityPresenter {
  static toHTTP(peculiarity: Peculiarity) {
    return {
      id: peculiarity.id.toString(),
      userId: peculiarity.userId,
      nome: peculiarity.nome,
      descricao: peculiarity.descricao,
      espiritual: peculiarity.espiritual,
      isPublic: peculiarity.isPublic,
      icone: peculiarity.icone ?? null,
      createdAt: peculiarity.createdAt,
      updatedAt: peculiarity.updatedAt ?? null,
      userName: peculiarity.userName ?? null,
    };
  }
}
