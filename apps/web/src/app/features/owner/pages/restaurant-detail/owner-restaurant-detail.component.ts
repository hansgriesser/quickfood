import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OwnerRestaurantsService } from '../../services/owner-restaurants.service';
import {
  DeliveryZone,
  OwnerDish,
  OwnerMenuCategory,
  OwnerOpeningHour,
  OwnerRestaurant,
  OwnerRestaurantDeliveryZone,
} from '../../services/owner-restaurant.model';
import { OwnerRestaurantFormComponent } from '../../components/restaurant-form/owner-restaurant-form.component';

interface OpeningHourForm {
  dayOfWeek: number;
  label: string;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

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
  deliveryZones: DeliveryZone[] = [];
  selectedZoneIds = new Set<string>();
  zonesError = '';
  isZonesLoading = false;
  isZonesSaving = false;
  openingHoursForm: OpeningHourForm[] = [];
  hoursError = '';
  isHoursSaving = false;
  private readonly weekDayLabels = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Restaurant id missing.';
      return;
    }
    this.restaurantId = id;
    this.loadMenu(id);
    this.initOpeningHours();
    this.loadDeliveryZones();

    this.ownerRestaurantsService.getMyRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurant = restaurants.find((item) => item.id === id);
        if (!this.restaurant) {
          this.errorMessage = 'Restaurant not found.';
          return;
        }
        this.syncProfileForms(this.restaurant);
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

  loadDeliveryZones(): void {
    this.isZonesLoading = true;
    this.zonesError = '';
    this.ownerRestaurantsService.getAvailableDeliveryZones().subscribe({
      next: (zones) => {
        this.deliveryZones = Array.isArray(zones) ? zones : [];
        this.isZonesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.zonesError = 'Could not load delivery zones.';
        this.isZonesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  isZoneSelected(zoneId: string): boolean {
    return this.selectedZoneIds.has(zoneId);
  }

  toggleZoneSelection(zoneId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedZoneIds.add(zoneId);
    } else {
      this.selectedZoneIds.delete(zoneId);
    }
  }

  saveDeliveryZones(): void {
    if (!this.restaurant) return;
    this.isZonesSaving = true;
    this.zonesError = '';

    const deliveryZoneIds = Array.from(this.selectedZoneIds);

    this.ownerRestaurantsService
      .updateRestaurant(this.restaurant.id, { deliveryZoneIds })
      .subscribe({
        next: (updated) => {
          this.restaurant = updated;
          this.syncSelectedZones(updated.deliveryZones);
        },
        error: () => {
          this.zonesError = 'Could not update delivery zones.';
          this.isZonesSaving = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isZonesSaving = false;
          this.cdr.detectChanges();
        },
      });
  }

  saveOpeningHours(): void {
    if (!this.restaurant) return;
    this.hoursError = '';

    const invalidEntry = this.openingHoursForm.find(
      (entry) =>
        !entry.isClosed &&
        (!this.isValidTime(entry.opensAt) || !this.isValidTime(entry.closesAt)),
    );

    if (invalidEntry) {
      this.hoursError = `Please enter valid times for ${invalidEntry.label}.`;
      return;
    }

    this.isHoursSaving = true;

    const openingHours = this.openingHoursForm.map((entry) => ({
      dayOfWeek: entry.dayOfWeek,
      opensAt: entry.isClosed ? '00:00' : entry.opensAt,
      closesAt: entry.isClosed ? '00:00' : entry.closesAt,
      isClosed: entry.isClosed,
    }));

    this.ownerRestaurantsService
      .updateRestaurant(this.restaurant.id, { openingHours })
      .subscribe({
        next: (updated) => {
          this.restaurant = updated;
          this.initOpeningHours(updated.openingHours);
        },
        error: () => {
          this.hoursError = 'Could not update opening hours.';
          this.isHoursSaving = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isHoursSaving = false;
          this.cdr.detectChanges();
        },
      });
  }

  get categoryOptions(): OwnerMenuCategory[] {
    return this.menuCategories.filter((category) => category.id !== 0);
  }

  loadMenu(restaurantId: string): void {
    this.isMenuLoading = true;
    this.menuError = '';
    this.cdr.detectChanges();
    this.ownerRestaurantsService.getMenu(restaurantId).subscribe({
      next: (categories) => {
        this.menuCategories = categories ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.menuError = 'Could not load menu.';
        this.isMenuLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isMenuLoading = false;
        this.cdr.detectChanges();
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

  trackByZoneId(_: number, zone: DeliveryZone): string {
    return zone.id;
  }

  trackByOpeningDay(_: number, entry: OpeningHourForm): number {
    return entry.dayOfWeek;
  }

  private syncProfileForms(restaurant: OwnerRestaurant): void {
    this.syncSelectedZones(restaurant.deliveryZones);
    this.initOpeningHours(restaurant.openingHours);
    this.cdr.detectChanges();
  }

  private syncSelectedZones(deliveryZones?: OwnerRestaurantDeliveryZone[]): void {
    const ids = (deliveryZones ?? [])
      .map((link) => link.zoneId || link.zone?.id)
      .filter((id): id is string => !!id);
    this.selectedZoneIds = new Set(ids);
  }

  private initOpeningHours(openingHours?: OwnerOpeningHour[]): void {
    const byDay = new Map<number, OwnerOpeningHour>();
    (openingHours ?? []).forEach((entry) => {
      byDay.set(entry.dayOfWeek, entry);
    });

    this.openingHoursForm = this.weekDayLabels.map((label, index) => {
      const existing = byDay.get(index);
      return {
        dayOfWeek: index,
        label,
        opensAt: existing?.opensAt ?? '09:00',
        closesAt: existing?.closesAt ?? '18:00',
        isClosed: existing?.isClosed ?? false,
      };
    });
  }

  private isValidTime(value: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
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
