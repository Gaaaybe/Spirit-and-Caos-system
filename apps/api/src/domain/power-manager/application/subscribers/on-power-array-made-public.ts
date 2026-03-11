import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { DomainEvent } from '@/core/events/domain-event';
import { DomainEvents } from '@/core/events/domain-events';
import { PowerArrayMadePublicEvent } from '../../enterprise/events/power-array-made-public-event';
import type { PowersRepository } from '../repositories/powers-repository';

@Injectable()
export class OnPowerArrayMadePublic implements OnModuleInit {
  constructor(private powersRepository: PowersRepository) {}

  onModuleInit(): void {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.publishPrivatePowers.bind(this), PowerArrayMadePublicEvent.name);
  }

  private async publishPrivatePowers(event: DomainEvent): Promise<void> {
    const { privatePowerIds } = event as PowerArrayMadePublicEvent;

    for (const powerId of privatePowerIds) {
      const power = await this.powersRepository.findById(powerId);

      if (power && !power.isPublic) {
        const publicPower = power.makePublic();
        await this.powersRepository.update(publicPower);
        await DomainEvents.dispatchEventsForAggregate(publicPower.id);
      }
    }
  }
}
