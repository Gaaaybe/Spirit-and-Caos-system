import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import { DurabilityStatus, Item, ItemType, validateItemBaseProps, type ItemBaseProps } from './item';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

interface ArtifactProps extends ItemBaseProps {
  isAttuned: boolean;
}

export class Artifact extends Item<ArtifactProps> {
  get tipo(): ItemType {
    return ItemType.ARTIFACT;
  }

  get isAttuned(): boolean {
    return this.props.isAttuned;
  }

  /**
   * Sintoniza o artefato ao portador.
   * Requer um Descanso Longo (8h) — este método modela o estado resultante.
   * A condição do descanso é validada na camada de aplicação/ficha.
   */
  sintonizar(): Artifact {
    if (this.props.isAttuned) {
      throw new DomainValidationError('Artefato já está sintonizado', 'isAttuned');
    }

    return new Artifact({ ...this.props, isAttuned: true, updatedAt: new Date() }, this.id);
  }

  dessintonizar(): Artifact {
    if (!this.props.isAttuned) {
      throw new DomainValidationError('Artefato não está sintonizado', 'isAttuned');
    }

    return new Artifact({ ...this.props, isAttuned: false, updatedAt: new Date() }, this.id);
  }

  update(partial: {
    nome?: string;
    descricao?: string;
    dominio?: Domain;
    custoBase?: number;
    nivelItem?: number;
    powerIds?: ItemPowerIdList;
    notas?: string;
  }): Artifact {
    return Artifact.create(
      {
        userId: this.props.userId,
        nome: partial.nome ?? this.props.nome,
        descricao: partial.descricao ?? this.props.descricao,
        dominio: partial.dominio ?? this.props.dominio,
        custoBase: partial.custoBase ?? this.props.custoBase,
        nivelItem: partial.nivelItem ?? this.props.nivelItem,
        maxStack: this.props.maxStack,
        durabilidade: this.props.durabilidade,
        powerIds: partial.powerIds ?? this.props.powerIds,
        isPublic: this.props.isPublic,
        notas: partial.notas ?? this.props.notas,
        createdAt: this.props.createdAt,
        updatedAt: new Date(),
        isAttuned: this.props.isAttuned,
      },
      this.id,
    );
  }

  copyForUser(userId: string): Artifact {
    return Artifact.create({
      ...this.props,
      userId,
      isPublic: false,
      isAttuned: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): Artifact {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados públicos', 'isPublic');
    }

    return new Artifact({ ...this.props, isPublic: true, updatedAt: new Date() }, this.id);
  }

  makePrivate(): Artifact {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados privados', 'isPublic');
    }

    return new Artifact({ ...this.props, isPublic: false, updatedAt: new Date() }, this.id);
  }

  static create(
    props: Optional<
      ArtifactProps,
      'maxStack' | 'durabilidade' | 'isPublic' | 'isAttuned' | 'createdAt' | 'powerIds'
    >,
    id?: UniqueEntityId,
  ): Artifact {
    const fullProps: ArtifactProps = {
      ...props,
      maxStack: props.maxStack ?? 1,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      isAttuned: props.isAttuned ?? false,
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      createdAt: props.createdAt ?? new Date(),
    };

    validateItemBaseProps(fullProps);

    return new Artifact(fullProps, id);
  }
}
