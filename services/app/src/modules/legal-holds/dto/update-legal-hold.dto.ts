import { PartialType } from '@nestjs/swagger';
import { CreateLegalHoldDto } from './create-legal-hold.dto';

export class UpdateLegalHoldDto extends PartialType(CreateLegalHoldDto) {}