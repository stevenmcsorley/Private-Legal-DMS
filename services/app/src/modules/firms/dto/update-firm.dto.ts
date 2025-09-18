import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFirmDto } from './create-firm.dto';

export class UpdateFirmDto extends PartialType(CreateFirmDto) {
  @ApiProperty({
    description: 'Firm name',
    example: 'Smith & Associates Law Firm',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'External reference or code',
    example: 'SA-LAW-001',
    required: false,
  })
  external_ref?: string;

  @ApiProperty({
    description: 'Firm settings and configuration',
    required: false,
  })
  settings?: Record<string, any>;
}