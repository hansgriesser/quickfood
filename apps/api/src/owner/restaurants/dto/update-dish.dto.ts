export class UpdateDishDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number | null;
  pictureUrl?: string | null;
}
