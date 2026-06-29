import { ProductCategory } from '../schemas/product.schema';
export declare enum SortBy {
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    NEWEST = "newest"
}
export declare class QueryProductsDto {
    search?: string;
    category?: ProductCategory;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: SortBy;
    page?: number;
    limit?: number;
}
