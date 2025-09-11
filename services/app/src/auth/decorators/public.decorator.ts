import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/auth.guard';

/**
 * Decorator to mark routes as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);