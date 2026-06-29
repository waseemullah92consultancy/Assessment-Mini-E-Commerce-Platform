import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { Cart } from '../cart/schemas/cart.schema';
import { Order, OrderStatus } from './schemas/order.schema';
import { OrdersService } from './orders.service';

// ---------------------------------------------------------------------------
// Valid 24-char hex ObjectId strings (required by BSON constructor)
// ---------------------------------------------------------------------------
const USER_ID    = '507f1f77bcf86cd799439011';
const PRODUCT_ID = '507f1f77bcf86cd799439022';

const mockShippingAddress = {
  street: '10 Downing St',
  city: 'London',
  state: 'England',
  zipCode: 'SW1A 2AA',
  country: 'UK',
};

// ---------------------------------------------------------------------------
// Suite 1: Cart — insufficient stock returns 400
// ---------------------------------------------------------------------------

describe('CartService (integration) — stock validation', () => {
  let cartService: CartService;

  const mockProduct = {
    _id: PRODUCT_ID,
    name: 'Wireless Headphones',
    price: 99.99,
    stockQuantity: 5,
    isActive: true,
  };

  const mockProductsService = { findOne: jest.fn() };

  // findOne on the Mongoose model must be a chainable mock (it's called with a filter object)
  const mockCartModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
  });

  it('should throw BadRequestException (400) when requested quantity exceeds available stock', async () => {
    mockProductsService.findOne.mockResolvedValue(mockProduct); // stockQuantity: 5
    mockCartModel.findOne.mockResolvedValue(null);              // no existing cart

    let caught: any;
    try {
      await cartService.addItem(USER_ID, { productId: PRODUCT_ID, quantity: 10 });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught.message).toBe('Insufficient stock');
  });

  it('should throw BadRequestException when combined cart + new quantity exceeds stock', async () => {
    mockProductsService.findOne.mockResolvedValue(mockProduct); // stockQuantity: 5

    // Cart already holds 4 units of this product
    mockCartModel.findOne.mockResolvedValue({
      _id: 'cart-001',
      items: [{ productId: { toString: () => PRODUCT_ID }, quantity: 4 }],
      save: jest.fn(),
    });

    let caught: any;
    try {
      await cartService.addItem(USER_ID, { productId: PRODUCT_ID, quantity: 2 }); // 4+2 > 5
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught.message).toBe('Insufficient stock');
  });
});

// ---------------------------------------------------------------------------
// Suite 2: OrdersService — creating an order decrements product stock
// ---------------------------------------------------------------------------

describe('OrdersService (integration) — order creation decrements stock', () => {
  let ordersService: OrdersService;

  const mockPopulatedProduct = {
    _id: { toString: () => PRODUCT_ID },
    name: 'Running Shoes',
    price: 129.99,
    stockQuantity: 20,
  };

  // Populated cart: productId field holds the full product document
  const mockPopulatedCart = {
    items: [{ productId: mockPopulatedProduct, quantity: 3 }],
  };

  const mockCartService = {
    getCart: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockProductsService = { decrementStock: jest.fn() };

  const mockSavedOrder = {
    _id: 'order-001',
    total: 389.97,
    status: OrderStatus.PENDING,
    paymentIntentId: 'mock_pi_12345',
  };

  const mockOrderModel = { create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCartService.getCart.mockResolvedValue(mockPopulatedCart);
    mockCartService.clearCart.mockResolvedValue({ message: 'Cart cleared' });
    mockProductsService.decrementStock.mockResolvedValue(undefined);
    mockOrderModel.create.mockResolvedValue(mockSavedOrder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: CartService, useValue: mockCartService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should call decrementStock for each ordered item with the correct quantity', async () => {
    await ordersService.createFromCart(USER_ID, mockShippingAddress);

    expect(mockProductsService.decrementStock).toHaveBeenCalledTimes(1);
    expect(mockProductsService.decrementStock).toHaveBeenCalledWith(PRODUCT_ID, 3);
  });

  it('should persist the order, clear the cart, and set paymentIntentId', async () => {
    const order = await ordersService.createFromCart(USER_ID, mockShippingAddress);

    expect(mockCartService.clearCart).toHaveBeenCalledWith(USER_ID);
    expect(mockOrderModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            name: 'Running Shoes',
            price: 129.99,
            quantity: 3,
          }),
        ],
        total: 389.97,
        shippingAddress: mockShippingAddress,
      }),
    );
    expect(order.status).toBe(OrderStatus.PENDING);
  });

  it('should throw BadRequestException when the cart is empty', async () => {
    mockCartService.getCart.mockResolvedValue({ items: [] });

    let caught: any;
    try {
      await ordersService.createFromCart(USER_ID, mockShippingAddress);
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    expect(caught.message).toBe('Cart is empty');
  });
});
