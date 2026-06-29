import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminQueryOrdersDto } from './dto/query-orders.dto';
import { OrderStatus } from './schemas/order.schema';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/orders')
@Roles('admin')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: AdminQueryOrdersDto) {
    return this.ordersService.findAllAdmin(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
