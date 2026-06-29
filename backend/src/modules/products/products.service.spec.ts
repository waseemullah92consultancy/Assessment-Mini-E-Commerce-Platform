import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

const mockProductModel: any = jest.fn();
mockProductModel.find = jest.fn();
mockProductModel.findById = jest.fn();
mockProductModel.findByIdAndUpdate = jest.fn();
mockProductModel.countDocuments = jest.fn();
mockProductModel.aggregate = jest.fn();

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('create()', () => {
    it('should create and return a product when price is valid', async () => {
      const dto = {
        name: 'Test Product',
        description: 'A test product description',
        price: 100,
        category: 'Electronics' as any,
        stockQuantity: 10,
      };

      const savedProduct = { _id: 'product-id', ...dto };
      const mockInstance = { save: jest.fn().mockResolvedValue(savedProduct) };
      mockProductModel.mockImplementation(() => mockInstance);

      const result = await service.create(dto);

      expect(mockInstance.save).toHaveBeenCalled();
      expect(result).toEqual(savedProduct);
    });

    it('should propagate Mongoose ValidationError when price is negative', async () => {
      const dto = {
        name: 'Bad Product',
        description: 'This has a negative price',
        price: -50,
        category: 'Electronics' as any,
        stockQuantity: 5,
      };

      const validationError = new Error(
        'Product validation failed: price: Path `price` (-50) is less than minimum allowed value (0).',
      );
      validationError.name = 'ValidationError';

      const mockInstance = { save: jest.fn().mockRejectedValue(validationError) };
      mockProductModel.mockImplementation(() => mockInstance);

      await expect(service.create(dto)).rejects.toThrow(
        /validation failed|less than minimum/i,
      );
    });

    it('should propagate Mongoose ValidationError when stockQuantity is negative', async () => {
      const dto = {
        name: 'Negative Stock',
        description: 'Invalid stock quantity',
        price: 100,
        category: 'Electronics' as any,
        stockQuantity: -1,
      };

      const validationError = new Error(
        'Product validation failed: stockQuantity: Path `stockQuantity` (-1) is less than minimum allowed value (0).',
      );
      validationError.name = 'ValidationError';

      const mockInstance = { save: jest.fn().mockRejectedValue(validationError) };
      mockProductModel.mockImplementation(() => mockInstance);

      await expect(service.create(dto)).rejects.toThrow(/validation failed/i);
    });
  });

  describe('findOne()', () => {
    it('should return a product when it exists and is active', async () => {
      const product = { _id: 'abc', name: 'Test', isActive: true };
      mockProductModel.findById.mockResolvedValue(product);

      const result = await service.findOne('abc');

      expect(mockProductModel.findById).toHaveBeenCalledWith('abc');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product is not found', async () => {
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when product is inactive', async () => {
      const product = { _id: 'abc', name: 'Archived', isActive: false };
      mockProductModel.findById.mockResolvedValue(product);

      await expect(service.findOne('abc')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should soft-delete by setting isActive=false', async () => {
      const deactivated = { _id: 'abc', isActive: false };
      mockProductModel.findByIdAndUpdate.mockResolvedValue(deactivated);

      const result = await service.remove('abc');

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'abc',
        { isActive: false },
        { new: true },
      );
      expect(result).toEqual(deactivated);
    });
  });
});
