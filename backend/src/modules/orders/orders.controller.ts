import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createFromCart(
    @CurrentUser() user: any,
    @Body() dto: CreateOrderFromCartDto,
  ) {
    return this.ordersService.createFromCart(
      user._id.toString(),
      dto.shippingAddress,
    );
  }

  @Get()
  findMyOrders(@CurrentUser() user: any, @Query() query: QueryOrdersDto) {
    return this.ordersService.findAllByUser(user._id.toString(), query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, user._id.toString(), user.role);
  }
}
