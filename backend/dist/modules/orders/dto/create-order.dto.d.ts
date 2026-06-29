declare class OrderItemDto {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}
declare class ShippingAddressDto {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress: ShippingAddressDto;
}
export {};
