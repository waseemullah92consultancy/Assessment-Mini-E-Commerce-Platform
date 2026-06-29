export declare class ShippingAddressDto {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export declare class CreateOrderFromCartDto {
    shippingAddress: ShippingAddressDto;
}
