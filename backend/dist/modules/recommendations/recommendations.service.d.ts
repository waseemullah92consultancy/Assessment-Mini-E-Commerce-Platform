import { Model } from 'mongoose';
import { OrderDocument } from '../orders/schemas/order.schema';
import { ProductDocument } from '../products/schemas/product.schema';
export declare class RecommendationsService {
    private orderModel;
    private productModel;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>);
    getProductRecommendations(productId: string): Promise<any[]>;
    getPersonalized(userId: string): Promise<any[]>;
}
