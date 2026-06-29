import { RecommendationsService } from './recommendations.service';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getProductRecommendations(id: string): Promise<any[]>;
    getPersonalized(user: any): Promise<any[]>;
}
