import { IsUUID } from 'class-validator';

export class CreateInteractionDto {
  @IsUUID()
  userId: string;
}
