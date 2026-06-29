import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

const userId = new Types.ObjectId().toString();

// Factory for a populated cart item (as returned by cartService.getCart with populate)
function makeCartItem(overrides: Partial<{ productId: any; quantity: number }> = {}) {
  return {
    productId: {
      _id: new Types.ObjectId(),
      name: 'Wireless Headphones',
      price: 12000,
      stockQuantity: 10,
    },
    quantity: 2,
    ...overrides,
  };
}

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;
  let mockCartService: { getCart: jest.Mock; clearCart: jest.Mock };
  let mockProductsService: { decrementStock: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCartService = {
      getCart: jest.fn(),
      clearCart: jest.fn().mockResolvedValue({ message: 'Cart cleared' }),
    };

    mockProductsService = {
      decrementStock: jest.fn().mockResolvedValue(undefined),
    };

    const createdOrder = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      items: [],
      total: 0,
      status: OrderStatus.PENDING,
    };

    mockOrderModel = {
      create: jest.fn().mockResolvedValue(createdOrder),
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: CartService, useValue: mockCartService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createFromCart()', () => {
    it('should decrement product stockQuantity by the correct amount for each item', async () => {
      const itemA = makeCartItem({ quantity: 2 });
      const itemB = makeCartItem({
        productId: {
          _id: new Types.ObjectId(),
          name: 'Smart Watch',
          price: 35000,
          stockQuantity: 5,
        },
        quantity: 1,
      });

      mockCartService.getCart.mockResolvedValue({ items: [itemA, itemB] });

      const shippingAddress = {
        street: '1 Main St',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
      };

      await service.createFromCart(userId, shippingAddress);

      // decrementStock must be called once per item with correct productId and quantity
      expect(mockProductsService.decrementStock).toHaveBeenCalledTimes(2);
      expect(mockProductsService.decrementStock).toHaveBeenCalledWith(
        itemA.productId._id.toString(),
        2,
      );
      expect(mockProductsService.decrementStock).toHaveBeenCalledWith(
        itemB.productId._id.toString(),
        1,
      );
    });

    it('should calculate the correct order total', async () => {
      // 2 × 12000 + 1 × 35000 = 59000
      const itemA = makeCartItem({ quantity: 2 }); // price: 12000
      const itemB = makeCartItem({
        productId: {
          _id: new Types.ObjectId(),
          name: 'Smart Watch',
          price: 35000,
          stockQuantity: 5,
        },
        quantity: 1,
      });

      mockCartService.getCart.mockResolvedValue({ items: [itemA, itemB] });

      const shippingAddress = {
        street: '1 Main St',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
      };

      await service.createFromCart(userId, shippingAddress);

      expect(mockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 59000,
        }),
      );
    });

    it('should throw BadRequestException when cart is empty', async () => {
      mockCartService.getCart.mockResolvedValue({ items: [] });

      await expect(
        service.createFromCart(userId, {
          street: '1 St',
          city: 'Lahore',
          state: 'Punjab',
          zipCode: '54000',
          country: 'Pakistan',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when a product has insufficient stock', async () => {
      const item = makeCartItem({
        productId: {
          _id: new Types.ObjectId(),
          name: 'Limited Item',
          price: 5000,
          stockQuantity: 1, // only 1 in stock
        },
        quantity: 5, // requesting 5
      });

      mockCartService.getCart.mockResolvedValue({ items: [item] });

      await expect(
        service.createFromCart(userId, {
          street: '1 St',
          city: 'Lahore',
          state: 'Punjab',
          zipCode: '54000',
          country: 'Pakistan',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should clear the cart after order is created', async () => {
      const item = makeCartItem({ quantity: 1 });
      mockCartService.getCart.mockResolvedValue({ items: [item] });

      await service.createFromCart(userId, {
        street: '1 St',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
      });

      expect(mockCartService.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should set a mock paymentIntentId on the created order', async () => {
      const item = makeCartItem({ quantity: 1 });
      mockCartService.getCart.mockResolvedValue({ items: [item] });

      await service.createFromCart(userId, {
        street: '1 St',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
      });

      expect(mockOrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentIntentId: expect.stringMatching(/^mock_pi_/),
        }),
      );
    });
  });

  describe('updateStatus()', () => {
    it('should update order status when transition is valid', async () => {
      const mockOrder = {
        _id: new Types.ObjectId(),
        status: OrderStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          status: OrderStatus.PROCESSING,
        }),
      };
      mockOrderModel.findById.mockResolvedValue(mockOrder);

      await service.updateStatus(mockOrder._id.toString(), OrderStatus.PROCESSING);

      expect(mockOrder.status).toBe(OrderStatus.PROCESSING);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const mockOrder = {
        _id: new Types.ObjectId(),
        status: OrderStatus.DELIVERED, // terminal state
        save: jest.fn(),
      };
      mockOrderModel.findById.mockResolvedValue(mockOrder);

      await expect(
        service.updateStatus(mockOrder._id.toString(), OrderStatus.PENDING),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
