import { OrdersService } from './orders.service';
import { AdminQueryOrdersDto } from './dto/query-orders.dto';
import { OrderStatus } from './schemas/order.schema';
export declare class AdminOrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(query: AdminQueryOrdersDto): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("./schemas/order.schema").OrderDocument, {}, {}> & import("./schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateStatus(id: string, status: OrderStatus): Promise<import("./schemas/order.schema").OrderDocument>;
}
