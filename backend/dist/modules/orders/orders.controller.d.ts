import { OrdersService } from './orders.service';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createFromCart(user: any, dto: CreateOrderFromCartDto): Promise<import("./schemas/order.schema").OrderDocument>;
    findMyOrders(user: any, query: QueryOrdersDto): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, {}> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string, user: any): Promise<import("./schemas/order.schema").OrderDocument>;
}
