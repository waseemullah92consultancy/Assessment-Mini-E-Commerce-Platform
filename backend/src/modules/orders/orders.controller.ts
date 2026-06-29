import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderStatus } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user._id.toString(), createOrderDto);
  }

  @Get()
  findOrders(@CurrentUser() user: any) {
    if (user.role === 'admin') return this.ordersService.findAll();
    return this.ordersService.findAllByUser(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, user._id.toString(), user.role);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
