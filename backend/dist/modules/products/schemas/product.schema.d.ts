import { Document } from 'mongoose';
export type ProductDocument = Product & Document;
export declare enum ProductCategory {
    ELECTRONICS = "Electronics",
    CLOTHING = "Clothing",
    BOOKS = "Books",
    HOME = "Home",
    SPORTS = "Sports"
}
export declare class Product {
    name: string;
    description: string;
    price: number;
    images: string[];
    category: ProductCategory;
    stockQuantity: number;
    isActive: boolean;
}
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, Document<unknown, any, Product, any, {}> & Product & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, Document<unknown, {}, import("mongoose").FlatRecord<Product>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Product> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
