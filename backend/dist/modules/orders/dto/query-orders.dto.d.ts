import { OrderStatus } from '../schemas/order.schema';
export declare class QueryOrdersDto {
    page?: number;
    limit?: number;
}
export declare class AdminQueryOrdersDto extends QueryOrdersDto {
    status?: OrderStatus;
}
