import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// No controller prefix — full paths are declared on each handler so they
// can span two different URL namespaces (/products and /recommendations).
@Controller()
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Public()
  @Get('products/:id/recommendations')
  getProductRecommendations(@Param('id') id: string) {
    return this.recommendationsService.getProductRecommendations(id);
  }

  @Get('recommendations/personalized')
  getPersonalized(@CurrentUser() user: any) {
    return this.recommendationsService.getPersonalized(user._id.toString());
  }
}
