import { Model } from 'mongoose';
import { CartDocument } from './schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';
export declare class CartService {
    private cartModel;
    private readonly productsService;
    constructor(cartModel: Model<CartDocument>, productsService: ProductsService);
    getCart(userId: string): Promise<CartDocument>;
    addItem(userId: string, dto: AddToCartDto): Promise<CartDocument>;
    updateItem(userId: string, productId: string, dto: UpdateCartItemDto): Promise<CartDocument>;
    removeItem(userId: string, productId: string): Promise<CartDocument>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
}
