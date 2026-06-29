import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(user: any): Promise<import("./schemas/cart.schema").CartDocument>;
    addItem(user: any, addToCartDto: AddToCartDto): Promise<import("./schemas/cart.schema").CartDocument>;
    updateItem(user: any, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<import("./schemas/cart.schema").CartDocument>;
    removeItem(user: any, productId: string): Promise<import("./schemas/cart.schema").CartDocument>;
    clearCart(user: any): Promise<{
        message: string;
    }>;
}
