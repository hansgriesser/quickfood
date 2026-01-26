import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OwnerRestaurantsService } from '../../services/owner-restaurants.service';
import {
  OwnerDish,
  OwnerMenuCategory,
  OwnerRestaurant,
} from '../../services/owner-restaurant.model';
import { OwnerRestaurantFormComponent } from '../../components/restaurant-form/owner-restaurant-form.component';

@Component({
  selector: 'app-owner-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OwnerRestaurantFormComponent],
  templateUrl: './owner-restaurant-detail.component.html',
  styleUrls: ['./owner-restaurant-detail.component.css'],
})
export class OwnerRestaurantDetailComponent {
  restaurantId?: string;
  restaurant?: OwnerRestaurant;
  errorMessage = '';
  menuCategories: OwnerMenuCategory[] = [];
  menuError = '';
  isMenuLoading = false;

  categoryForm: { name: string; sortOrder: number | null } = {
    name: '',
    sortOrder: 0,
  };

  dishForm: {
    name: string;
    description: string;
    price: number | null;
    categoryId: number | null;
    pictureUrl: string;
  } = {
    name: '',
    description: '',
    price: null,
    categoryId: null,
    pictureUrl: '',
  };

  editingCategoryId: number | null = null;
  categoryEditForm: { name: string; sortOrder: number | null } = {
    name: '',
    sortOrder: 0,
  };

  editingDishId: number | null = null;
  dishEditForm: {
    name: string;
    description: string;
    price: number | null;
    categoryId: number | null;
    pictureUrl: string;
  } = {
    name: '',
    description: '',
    price: null,
    categoryId: null,
    pictureUrl: '',
  };

  constructor(
    private route: ActivatedRoute,
    private ownerRestaurantsService: OwnerRestaurantsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Restaurant id missing.';
      return;
    }
    this.restaurantId = id;
    this.loadMenu(id);

    this.ownerRestaurantsService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurant = restaurants.find((item) => item.id === id);
        if (!this.restaurant) {
          this.errorMessage = 'Restaurant not found.';
        }
      },
      error: () => {
        this.errorMessage = 'Could not load restaurant.';
      },
    });
  }

  saveRestaurant(payload: { name: string; category?: string; contactEmail?: string; contactPhone?: string }): void {
    if (!this.restaurant) return;

    this.ownerRestaurantsService.updateRestaurant(this.restaurant.id, payload).subscribe({
      next: (updated) => {
        this.restaurant = updated;
      },
      error: () => {
        this.errorMessage = 'Could not update restaurant.';
      },
    });
  }

  get categoryOptions(): OwnerMenuCategory[] {
    return this.menuCategories.filter((category) => category.id !== 0);
  }

  loadMenu(restaurantId: string): void {
    this.isMenuLoading = true;
    this.menuError = '';
    this.ownerRestaurantsService.getMenu(restaurantId).subscribe({
      next: (categories) => {
        this.menuCategories = categories ?? [];
      },
      error: () => {
        this.menuError = 'Could not load menu.';
        this.isMenuLoading = false;
      },
      complete: () => {
        this.isMenuLoading = false;
      },
    });
  }

  createCategory(): void {
    if (!this.restaurantId) return;
    this.menuError = '';
    const name = this.categoryForm.name.trim();
    if (!name) {
      this.menuError = 'Category name is required.';
      return;
    }

    const sortOrder = this.normalizeNumber(this.categoryForm.sortOrder);
    this.ownerRestaurantsService
      .createCategory(this.restaurantId, {
        name,
        sortOrder: sortOrder ?? undefined,
      })
      .subscribe({
        next: () => {
          this.resetCategoryForm();
          this.loadMenu(this.restaurantId!);
        },
        error: () => {
          this.menuError = 'Could not create category.';
        },
      });
  }

  startCategoryEdit(category: OwnerMenuCategory): void {
    this.editingCategoryId = category.id;
    this.categoryEditForm = {
      name: category.name,
      sortOrder: category.sortOrder ?? 0,
    };
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId = null;
    this.resetCategoryEditForm();
  }

  saveCategoryEdit(category: OwnerMenuCategory): void {
    if (!this.restaurantId) return;
    this.menuError = '';
    const name = this.categoryEditForm.name.trim();
    if (!name) {
      this.menuError = 'Category name is required.';
      return;
    }

    const sortOrder = this.normalizeNumber(this.categoryEditForm.sortOrder);
    this.ownerRestaurantsService
      .updateCategory(this.restaurantId, category.id, {
        name,
        sortOrder: sortOrder ?? undefined,
      })
      .subscribe({
        next: () => {
          this.editingCategoryId = null;
          this.resetCategoryEditForm();
          this.loadMenu(this.restaurantId!);
        },
        error: () => {
          this.menuError = 'Could not update category.';
        },
      });
  }

  deleteCategory(category: OwnerMenuCategory): void {
    if (!this.restaurantId) return;
    this.menuError = '';
    if (!confirm(`Delete category "${category.name}"? Dishes will be uncategorized.`)) {
      return;
    }

    this.ownerRestaurantsService
      .deleteCategory(this.restaurantId, category.id)
      .subscribe({
        next: () => {
          this.loadMenu(this.restaurantId!);
        },
        error: () => {
          this.menuError = 'Could not delete category.';
        },
      });
  }

  createDish(): void {
    if (!this.restaurantId) return;
    this.menuError = '';
    const name = this.dishForm.name.trim();
    const description = this.dishForm.description.trim();
    const price = this.normalizeNumber(this.dishForm.price);

    if (!name || !description || price === null || price <= 0) {
      this.menuError = 'Dish name, description, and price are required.';
      return;
    }

    this.ownerRestaurantsService
      .createDish(this.restaurantId, {
        name,
        description,
        price,
        categoryId: this.dishForm.categoryId ?? null,
        pictureUrl: this.normalizeText(this.dishForm.pictureUrl) ?? null,
      })
      .subscribe({
        next: () => {
          this.resetDishForm();
          this.loadMenu(this.restaurantId!);
        },
        error: () => {
          this.menuError = 'Could not create dish.';
        },
      });
  }

  startDishEdit(dish: OwnerDish): void {
    this.editingDishId = dish.id;
    this.dishEditForm = {
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      categoryId: dish.categoryId ?? null,
      pictureUrl: dish.pictureUrl ?? '',
    };
  }

  cancelDishEdit(): void {
    this.editingDishId = null;
    this.resetDishEditForm();
  }

  saveDishEdit(dish: OwnerDish): void {
    if (!this.restaurantId) return;
    this.menuError = '';
    const name = this.dishEditForm.name.trim();
    const description = this.dishEditForm.description.trim();
    const price = this.normalizeNumber(this.dishEditForm.price);

    if (!name || !description || price === null || price <= 0) {
      this.menuError = 'Dish name, description, and price are required.';
      return;
    }

    this.ownerRestaurantsService
      .updateDish(this.restaurantId, dish.id, {
        name,
        description,
        price,
        categoryId: this.dishEditForm.categoryId ?? null,
        pictureUrl: this.normalizeText(this.dishEditForm.pictureUrl) ?? null,
      })
      .subscribe({
        next: () => {
          this.editingDishId = null;
          this.resetDishEditForm();
          this.loadMenu(this.restaurantId!);
        },
        error: () => {
          this.menuError = 'Could not update dish.';
        },
      });
  }

  deleteDish(dish: OwnerDish): void {
    if (!this.restaurantId) return;
    this.menuError = '';
    if (!confirm(`Delete dish "${dish.name}"?`)) {
      return;
    }

    this.ownerRestaurantsService.deleteDish(this.restaurantId, dish.id).subscribe({
      next: () => {
        this.loadMenu(this.restaurantId!);
      },
      error: () => {
        this.menuError = 'Could not delete dish.';
      },
    });
  }

  trackByCategoryId(_: number, category: OwnerMenuCategory): number {
    return category.id;
  }

  trackByDishId(_: number, dish: OwnerDish): number {
    return dish.id;
  }

  private resetCategoryForm(): void {
    this.categoryForm = { name: '', sortOrder: 0 };
  }

  private resetCategoryEditForm(): void {
    this.categoryEditForm = { name: '', sortOrder: 0 };
  }

  private resetDishForm(): void {
    this.dishForm = {
      name: '',
      description: '',
      price: null,
      categoryId: null,
      pictureUrl: '',
    };
  }

  private resetDishEditForm(): void {
    this.dishEditForm = {
      name: '',
      description: '',
      price: null,
      categoryId: null,
      pictureUrl: '',
    };
  }

  private normalizeNumber(value: number | string | null): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}
