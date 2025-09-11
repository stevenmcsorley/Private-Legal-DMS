import { PartialType } from '@nestjs/swagger';
import { CreateRetentionClassDto } from './create-retention-class.dto';

export class UpdateRetentionClassDto extends PartialType(CreateRetentionClassDto) {}