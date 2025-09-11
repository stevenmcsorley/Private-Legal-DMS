import { PartialType } from '@nestjs/swagger';
import { CreateMatterDto } from './create-matter.dto';

export class UpdateMatterDto extends PartialType(CreateMatterDto) {}