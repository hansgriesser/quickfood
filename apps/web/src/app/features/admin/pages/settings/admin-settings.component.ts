import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
    AdminSettingsService,
  Voucher,
  VoucherType,
  CreateVoucherPayload,
} from '../../services/admin-settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css'],
})
export class AdminSettingsComponent implements OnInit {
    loading = true;
    error: string | null = null;

    serviceFeePercent = 0;
    savingFee = false;

    vouchers: Voucher[] = [];
    creatingVoucher = false;

    // track vouchers being updated to disable buttons and show state
    updatingVoucherIds: Set<string> = new Set();

    validFromDate = '';
    validToDate = '';

    newVoucher: CreateVoucherPayload = {
        code: '',
        type: 'PERCENT',
        value: 5,
        active: true,
    };

    constructor(
        private readonly settings: AdminSettingsService,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        void this.load();
    }

    async load() {
        this.loading = true;
        this.error =  null;
        this.cdr.detectChanges();

        try {
            const fee = await this.settings.getServiceFee();
            this.serviceFeePercent = fee.percent ?? 0;

            this.vouchers = await this.settings.listVouchers();
        } catch(e: any) {
            this.error = e?.error?.message ?? 'Failed to load settings';
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async saveServiceFee() {
        this.savingFee = true;
        this.error = null;
        this.cdr.detectChanges();

        try {
            await this.settings.updateServiceFee(this.serviceFeePercent);
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Failed to save service fee';
        } finally {
            this.savingFee = false;
            this.cdr.detectChanges();
        }
    }

    async createVoucher() {
        this.creatingVoucher = true;
        this.error = null;
        this.cdr.detectChanges();

        try {
            const validFrom = this.dateToIsoStartOfDay(this.validFromDate);
            const validTo = this.dateToIsoEndOfDay(this.validToDate);

            await this.settings.createVoucher({
                ...this.newVoucher,
                code: this.newVoucher.code.trim(),
                validFrom,
                validTo,
            });

            this.newVoucher = { code: '', type: 'PERCENT', value: 5, active: true };
            this.validFromDate = '';
            this.validToDate = '';

            this.vouchers = await this.settings.listVouchers();
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Failed to create voucher';
        } finally {
            this.creatingVoucher = false;
            this.cdr.detectChanges();
        }
    }

    private dateToIsoStartOfDay(date: string): string | undefined {
        if (!date) return undefined;
        const d = new Date(`${date}T00:00:00.000`);
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    }

    private dateToIsoEndOfDay(date: string): string | undefined {
        if (!date) return undefined;
        const d = new Date(`${date}T23:59:59.999`);
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    }

    async toggleVoucher(v: Voucher) {
        this.error = null;
        // mark as updating so button can be disabled
        this.updatingVoucherIds.add(v.id);
        this.cdr.detectChanges();

        try {
            const updated = await this.settings.updateVoucher(v.id, { active: !v.active });

            // update the local voucher object with server response so UI reflects change
            Object.assign(v, updated);
        } catch (e: any) {
            this.error = e?.error?.message ?? 'Failed to update voucher';
        } finally {
            this.updatingVoucherIds.delete(v.id);
            this.cdr.detectChanges();
        }
    }

    typeLabel(t: VoucherType) {
        return t === 'PERCENT' ? 'PERCENT (%)' : 'FIXED';
    }
}