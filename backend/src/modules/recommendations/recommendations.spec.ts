import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RecommendationsService } from './recommendations.service';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';

const TARGET_ID = new Types.ObjectId();

function makeMockProduct(overrides: Record<string, any> = {}) {
  return {
    _id: new Types.ObjectId(),
    name: 'Product ' + Math.random().toString(36).slice(2, 6),
    price: 1000,
    category: 'Electronics',
    images: [],
    stockQuantity: 10,
    isActive: true,
    ...overrides,
  };
}

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let mockOrderModel: { aggregate: jest.Mock };
  let mockProductModel: {
    findById: jest.Mock;
    aggregate: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockOrderModel = { aggregate: jest.fn() };
    mockProductModel = {
      findById: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  describe('getProductRecommendations()', () => {
    it('should return an empty array when the target product does not exist', async () => {
      mockProductModel.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      expect(result).toEqual([]);
    });

    it('should return an empty array when the target product is inactive', async () => {
      const inactiveProduct = { ...makeMockProduct(), isActive: false };
      mockProductModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(inactiveProduct),
      });

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      expect(result).toEqual([]);
    });

    it('should return at most 4 recommendations (from co-occurrence)', async () => {
      const targetProduct = makeMockProduct({ _id: TARGET_ID, isActive: true });
      mockProductModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(targetProduct),
      });

      // 6 co-occurrence results — the aggregate pipeline itself limits to 4, but
      // mock returns 4 to simulate the $limit: 4 stage.
      const coOccurrenceResults = Array.from({ length: 4 }, () => makeMockProduct());
      mockOrderModel.aggregate.mockResolvedValue(coOccurrenceResults);

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      expect(result.length).toBeLessThanOrEqual(4);
      expect(result.length).toBe(4);
    });

    it('should NOT include the requested product in the results', async () => {
      const targetProduct = makeMockProduct({ _id: TARGET_ID, isActive: true });
      mockProductModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(targetProduct),
      });

      // Simulate co-occurrence returning other products (not the target)
      const recommendations = Array.from({ length: 3 }, () => makeMockProduct());
      mockOrderModel.aggregate.mockResolvedValue(recommendations);

      // Fallback returns 1 more product (needed = 4 - 3 = 1)
      mockProductModel.aggregate.mockResolvedValue([makeMockProduct()]);

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      // The target product ID must not appear in results
      const resultIds = result.map((p: any) => p._id?.toString());
      expect(resultIds).not.toContain(TARGET_ID.toString());
    });

    it('should use category fallback when co-occurrence yields fewer than 4 results', async () => {
      const targetProduct = makeMockProduct({ _id: TARGET_ID, isActive: true });
      mockProductModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(targetProduct),
      });

      // Only 2 co-occurrence results — need 2 more from category fallback
      const coResults = Array.from({ length: 2 }, () => makeMockProduct());
      mockOrderModel.aggregate.mockResolvedValue(coResults);

      const fallbackResults = Array.from({ length: 2 }, () => makeMockProduct());
      mockProductModel.aggregate.mockResolvedValue(fallbackResults);

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      // Total should be 4: 2 co-occurrence + 2 fallback
      expect(result.length).toBe(4);
      expect(mockProductModel.aggregate).toHaveBeenCalledTimes(1);
    });

    it('should return fewer than 4 when combined co-occurrence + fallback have fewer', async () => {
      const targetProduct = makeMockProduct({ _id: TARGET_ID, isActive: true });
      mockProductModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(targetProduct),
      });

      // Only 1 co-occurrence result
      mockOrderModel.aggregate.mockResolvedValue([makeMockProduct()]);

      // Only 1 fallback result (no other products in the category)
      mockProductModel.aggregate.mockResolvedValue([makeMockProduct()]);

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      expect(result.length).toBe(2);
      expect(result.length).toBeLessThanOrEqual(4);
    });

    it('should return up to 4 recommendations excluding the requested product ID', async () => {
      const targetProduct = makeMockProduct({ _id: TARGET_ID, isActive: true });
      mockProductModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(targetProduct),
      });

      // Simulate 4 completely different products returned
      const products = Array.from({ length: 4 }, () => makeMockProduct());
      mockOrderModel.aggregate.mockResolvedValue(products);

      const result = await service.getProductRecommendations(TARGET_ID.toString());

      expect(result).toHaveLength(4);
      result.forEach((p: any) => {
        expect(p._id?.toString()).not.toBe(TARGET_ID.toString());
      });
    });
  });
});
