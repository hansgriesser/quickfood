import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminZonesService, DeliveryZone } from '../../services/admin-zones.service';

type ZoneFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-admin-zones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-zones.component.html',
  styleUrls: ['./admin-zones.component.css'],
})
export class AdminZonesComponent implements OnInit {
  loading = false;
  error: string | null = null;

  zones: DeliveryZone[] = [];
  filter: ZoneFilter = 'ALL';

  modalOpen = false;
  modalMode: 'CREATE' | 'EDIT' = 'CREATE';
  modalSubmitting = false;
  modalErrors: string | null = null;

  modalZoneId: string | null = null;
  formCode = '';
  formName = '';
  formActive = true;
  rowBusy = new Set<string>();
  formTypicalMin = 20;
  formTypicalMax = 35;

  constructor(
    private readonly adminZones: AdminZonesService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      let active: boolean | undefined = undefined;
      if (this.filter === 'ACTIVE') active = true;
      if (this.filter === 'INACTIVE') active = false;

      this.zones = await this.adminZones.list(active);
    } catch (e: any) {
      this.error = e?.message || e?.message || 'An error occurred while loading zones.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async onFilterChange(value: ZoneFilter): Promise<void> {
    this.filter = value;
    await this.load();
  }

  openCreate(): void {
    this.modalMode = 'CREATE';
    this.modalZoneId = null;
    this.formCode = '';
    this.formName = '';
    this.formActive = true;
    this.modalErrors = null;
    this.modalSubmitting = false;
    this.modalOpen = true;
    this.formTypicalMin = 20;
    this.formTypicalMax = 35;
  }

  openEdit(z: DeliveryZone): void {
    this.modalMode = 'EDIT';
    this.modalZoneId = z.id;
    this.formCode = z.code;
    this.formName = z.name;
    this.formActive = z.active;
    this.modalErrors = null;
    this.modalSubmitting = false;
    this.modalOpen = true;
    this.formTypicalMin = z.typicalDeliveryMin;
    this.formTypicalMax = z.typicalDeliveryMax;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.modalErrors = null;
    this.modalSubmitting = false;
    this.cdr.detectChanges();
  }

  async toogleActive(z: DeliveryZone): Promise<void> {
    if (this.rowBusy.has(z.id)) return;

    this.rowBusy.add(z.id);

    const previous = z.active;
    z.active = !z.active;
    this.cdr.detectChanges();

    try {
      await this.adminZones.update(z.id, { active: z.active });
    } catch (e: any) {
      z.active = previous;
      this.error = e?.error?.message || e?.message || 'Update failed.';
      this.cdr.detectChanges();
    } finally {
      this.rowBusy.delete(z.id);
      this.cdr.detectChanges();
    }
  }

  async submitModal(): Promise<void> {
    this.modalSubmitting = true;
    this.modalErrors = null;

    const code = this.formCode.trim();
    const name = this.formName.trim();
    const min = Number(this.formTypicalMin);
    const max = Number(this.formTypicalMax);

    if (!code || !name) {
      this.modalErrors = 'Code and Name are required.';
      this.modalSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
      this.modalErrors = 'Typical delivery time must be > 0 and min <= max.';
      this.modalSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    const wasOpen = this.modalOpen;

    this.modalOpen = false;
    this.cdr.detectChanges();

    try {
      if (this.modalMode === 'CREATE') {
        await this.adminZones.create({
          code,
          name,
          active: this.formActive,
          typicalDeliveryMin: min,
          typicalDeliveryMax: max,
        });
      } else {
        if (!this.modalZoneId) throw new Error('Missing zone id');
        await this.adminZones.update(this.modalZoneId, {
          code,
          name,
          active: this.formActive,
          typicalDeliveryMin: min,
          typicalDeliveryMax: max,
        });
      }

      await this.load();
    } catch (e: any) {
      // Bei Fehler: Modal wieder öffnen + Fehlermeldung anzeigen
      this.modalOpen = wasOpen;
      this.modalErrors = e?.error?.message || e?.message || 'Submission failed.';
    } finally {
      this.modalSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}
