import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';

const userId = new Types.ObjectId().toString();
const productId = new Types.ObjectId().toString();

const mockProductWithStock = (stockQuantity: number) => ({
  _id: productId,
  name: 'Test Product',
  price: 500,
  stockQuantity,
  isActive: true,
});

const makeCartModel = (existingCart: any) => ({
  findOne: jest.fn().mockImplementation(() => ({
    populate: jest.fn().mockResolvedValue(existingCart),
  })),
  create: jest.fn(),
  findById: jest.fn().mockImplementation(() => ({
    populate: jest.fn().mockResolvedValue(existingCart),
  })),
  findOneAndUpdate: jest.fn(),
});

describe('CartService', () => {
  let service: CartService;
  let mockCartModel: ReturnType<typeof makeCartModel>;
  let mockProductsService: {
    findOne: jest.Mock;
    decrementStock: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockProductsService = {
      findOne: jest.fn(),
      decrementStock: jest.fn(),
    };

    mockCartModel = makeCartModel(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addItem()', () => {
    it('should throw BadRequestException when requested quantity exceeds stock', async () => {
      // Product has only 5 units in stock
      mockProductsService.findOne.mockResolvedValue(mockProductWithStock(5));

      // Cart is empty (no existing cart)
      mockCartModel.findOne.mockResolvedValue(null);

      await expect(
        service.addItem(userId, { productId, quantity: 10 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.addItem(userId, { productId, quantity: 10 }),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw BadRequestException when combined cart + new quantity exceeds stock', async () => {
      // Product has 5 units in stock
      mockProductsService.findOne.mockResolvedValue(mockProductWithStock(5));

      // Cart already has 3 units of this product
      const existingCart = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        items: [
          { productId: { toString: () => productId }, quantity: 3 },
        ],
        save: jest.fn(),
      };
      mockCartModel.findOne.mockResolvedValue(existingCart);

      // Adding 3 more would bring total to 6, which exceeds stock of 5
      await expect(
        service.addItem(userId, { productId, quantity: 3 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully add item when quantity is within stock limits', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProductWithStock(10));

      const savedCart = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        items: [{ productId, quantity: 5 }],
      };

      mockCartModel.findOne.mockResolvedValue(null);
      mockCartModel.create.mockResolvedValue(savedCart);
      mockCartModel.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(savedCart),
      }));

      const result = await service.addItem(userId, { productId, quantity: 5 });

      expect(result).toEqual(savedCart);
    });

    it('should throw when product is not found', async () => {
      mockProductsService.findOne.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(
        service.addItem(userId, { productId, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart()', () => {
    it('should clear all items from the cart', async () => {
      mockCartModel.findOneAndUpdate.mockResolvedValue({ items: [] });

      const result = await service.clearCart(userId);

      expect(mockCartModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({}),
        { items: [] },
      );
      expect(result).toEqual({ message: 'Cart cleared' });
    });
  });
});
