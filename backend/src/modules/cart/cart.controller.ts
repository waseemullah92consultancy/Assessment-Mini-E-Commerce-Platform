import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user._id.toString());
  }

  @Post('items')
  addItem(@CurrentUser() user: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(user._id.toString(), addToCartDto);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      user._id.toString(),
      productId,
      updateCartItemDto,
    );
  }

  @Delete('items/:productId')
  removeItem(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(user._id.toString(), productId);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user._id.toString());
  }
}
