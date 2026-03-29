import { OwnableEntity } from '@/core/entities/ownable-entity';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import type { ItemPowerArrayIdList } from './watched-lists/item-power-array-id-list';
import type { ItemPowerIdList } from './watched-lists/item-power-id-list';

export enum DurabilityStatus {
  INTACTO = 'INTACTO',
  DANIFICADO = 'DANIFICADO',
}

export enum ItemType {
  WEAPON = 'weapon',
  DEFENSIVE_EQUIPMENT = 'defensive-equipment',
  CONSUMABLE = 'consumable',
  ARTIFACT = 'artifact',
  ACCESSORY = 'accessory',
  GENERAL = 'general',
  UPGRADE_MATERIAL = 'upgrade-material',
}

export interface ItemBaseProps {
  userId?: string;
  characterId?: string;
  nome: string;
  descricao: string;
  dominio: Domain;
  custoBase: number;
  nivelItem: number;
  durabilidade: DurabilityStatus;
  powerIds: ItemPowerIdList;
  powerArrayIds: ItemPowerArrayIdList;
  icone?: string;
  isPublic: boolean;
  canStack: boolean;
  maxStack: number;
  notas?: string;
  userName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function validateItemBaseProps(props: ItemBaseProps): void {
  if (!props.nome || props.nome.trim().length < 2 || props.nome.trim().length > 100) {
    throw new DomainValidationError('Nome deve ter entre 2 e 100 caracteres', 'nome');
  }

  if (
    !props.descricao ||
    props.descricao.trim().length < 10 ||
    props.descricao.trim().length > 1000
  ) {
    throw new DomainValidationError('Descrição deve ter entre 10 e 1000 caracteres', 'descricao');
  }

  if (props.custoBase < 0) {
    throw new DomainValidationError('Custo base não pode ser negativo', 'custoBase');
  }

  if (props.nivelItem < 1) {
    throw new DomainValidationError('Nível do item deve ser pelo menos 1', 'nivelItem');
  }

  if (props.canStack && props.maxStack < 2) {
    throw new DomainValidationError('O limite de acúmulo (maxStack) deve ser pelo menos 2 se o item puder ser acumulado.', 'maxStack');
  }
}

export abstract class Item<Props extends ItemBaseProps> extends OwnableEntity<Props> {
  abstract get tipo(): ItemType;

  get userId(): string | undefined {
    return this.props.userId;
  }

  get characterId(): string | undefined {
    return this.props.characterId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get dominio(): Domain {
    return this.props.dominio;
  }

  get custoBase(): number {
    return this.props.custoBase;
  }

  get nivelItem(): number {
    return this.props.nivelItem;
  }

  get valorBase(): number {
    return this.props.custoBase * this.props.nivelItem;
  }

  get precoVenda(): number {
    return Math.floor(this.valorBase / 2);
  }

  get durabilidade(): DurabilityStatus {
    return this.props.durabilidade;
  }

  get powerIds(): ItemPowerIdList {
    return this.props.powerIds;
  }

  get powerArrayIds(): ItemPowerArrayIdList {
    return this.props.powerArrayIds;
  }

  get icone(): string | undefined {
    return this.props.icone;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  get canStack(): boolean {
    return this.props.canStack;
  }

  get maxStack(): number {
    return this.props.maxStack;
  }

  get notas(): string | undefined {
    return this.props.notas;
  }

  get userName(): string | undefined {
    return this.props.userName;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  isDanificado(): boolean {
    return this.props.durabilidade === DurabilityStatus.DANIFICADO;
  }

  abstract makePublic(): Item<Props>;
  abstract makePrivate(): Item<Props>;
  abstract copyForUser(userId: string): Item<Props>;
}
