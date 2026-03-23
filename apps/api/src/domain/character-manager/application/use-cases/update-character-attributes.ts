import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { AttributeSet } from '../../enterprise/entities/value-objects/attribute-set';
import { Attribute } from '../../enterprise/entities/value-objects/attribute';

interface UpdateCharacterAttributesUseCaseRequest {
  characterId: string;
  userId: string;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    keyPhysical: 'strength' | 'dexterity' | 'constitution';
    keyMental: 'intelligence' | 'wisdom' | 'charisma';
  };
}

type UpdateCharacterAttributesUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class UpdateCharacterAttributesUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    attributes: attrProps,
  }: UpdateCharacterAttributesUseCaseRequest): Promise<UpdateCharacterAttributesUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const newAttributes = AttributeSet.create({
      strength: Attribute.create({ baseValue: attrProps.strength }),
      dexterity: Attribute.create({ baseValue: attrProps.dexterity }),
      constitution: Attribute.create({ baseValue: attrProps.constitution }),
      intelligence: Attribute.create({ baseValue: attrProps.intelligence }),
      wisdom: Attribute.create({ baseValue: attrProps.wisdom }),
      charisma: Attribute.create({ baseValue: attrProps.charisma }),
      keyPhysical: attrProps.keyPhysical,
      keyMental: attrProps.keyMental,
    });

    character.updateAttributes(newAttributes);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
