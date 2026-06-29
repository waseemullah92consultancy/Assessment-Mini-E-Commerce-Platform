import { IsUrl } from 'class-validator';

export class AddImageUrlDto {
  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  imageUrl: string;
}
