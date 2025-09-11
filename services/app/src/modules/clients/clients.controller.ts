import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientsService, ClientQuery } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead, CanWrite, CanDelete } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @CanWrite('client')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Client created successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to create clients',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Client with external reference already exists',
  })
  async create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() user: UserInfo,
  ): Promise<ClientResponseDto> {
    return this.clientsService.create(createClientDto, user);
  }

  @Get()
  @CanRead('client')
  @ApiOperation({ summary: 'Get all clients' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clients retrieved successfully',
  })
  async findAll(
    @Query() query: ClientQuery,
    @CurrentUser() user: UserInfo,
  ) {
    return this.clientsService.findAll(query, user);
  }

  @Get(':id')
  @CanRead('client')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Client retrieved successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this client',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id, user);
  }

  @Patch(':id')
  @CanWrite('client')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Client updated successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this client',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Client with external reference already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() user: UserInfo,
  ): Promise<ClientResponseDto> {
    return this.clientsService.update(id, updateClientDto, user);
  }

  @Delete(':id')
  @CanDelete('client')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Client deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this client',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete client with associated matters',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.clientsService.remove(id, user);
  }

  @Get(':id/matters')
  @CanRead('matter')
  @ApiOperation({ summary: 'Get all matters for a client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matters retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this client',
  })
  async getClientMatters(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    // This will be implemented when we have the matters service
    // For now, return empty array
    return { matters: [], total: 0 };
  }
}