import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { ShippingAddressDto } from './dto/create-order-from-cart.dto';
import { QueryOrdersDto, AdminQueryOrdersDto } from './dto/query-orders.dto';
export declare class OrdersService {
    private orderModel;
    private readonly cartService;
    private readonly productsService;
    constructor(orderModel: Model<OrderDocument>, cartService: CartService, productsService: ProductsService);
    createFromCart(userId: string, shippingAddress: ShippingAddressDto): Promise<OrderDocument>;
    findAllByUser(userId: string, query: QueryOrdersDto): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string, userId: string, role: string): Promise<OrderDocument>;
    findAllAdmin(query: AdminQueryOrdersDto): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateStatus(id: string, nextStatus: OrderStatus): Promise<OrderDocument>;
}
