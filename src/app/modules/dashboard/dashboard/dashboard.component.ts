import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false,
})
export class DashboardComponent implements OnInit {

  companies: any[] = [];
  loading = true;

  currentPage = 1;
  totalPages = 1;
  pageSize = 6;


  newCompany: any = {
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    logo: null,
  };
  logoPreview: string | null = null;
  isCreating = false;
  maxFileSize = 5 * 1024 * 1024;

  selectedCompany: any = null;
  isUpdating = false;
  constructor(private apiService: ApiService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getCompanies(this.currentPage);
  }

  getCompanies(page: number) {
    this.loading = true;
    this.apiService.getCompanies(page, this.pageSize).subscribe({
      next: (res) => {
        this.companies = res.companies;
        this.currentPage = res.pagination.page;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading companies', err);
        this.companies = [];
        this.loading = false;
      }
    });
  }


  addCompany() {
    const modalEl = document.getElementById('addCompanyModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

  // Handle logo file
  handleFile(event: any, field: 'logo') {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > this.maxFileSize) {
      this.toastr.error('File size must be less than 5 MB', 'File Too Large');
      event.target.value = '';
      this.logoPreview = null;
      return;
    }

    this.newCompany.logo = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Submit form
  submitCreateCompany() {
    if (!this.newCompany.name) {
      this.toastr.error('Company name is required', 'Form Error');
      return;
    }

    this.isCreating = true;

    this.apiService.createCompany(this.newCompany).subscribe({
      next: (res) => {
        this.toastr.success('Company created successfully!', 'Success');
        this.isCreating = false;

        // Close modal
        const modalEl = document.getElementById('addCompanyModal');
        const modal = Modal.getInstance(modalEl!);
        modal?.hide();

        // Reload company list
        this.getCompanies(this.currentPage);

        // Reset form
        this.newCompany = { name: '', email: '', phoneNumber: '', address: '', logo: null };
        this.logoPreview = null;
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to create company', 'Error');
        this.isCreating = false;

        if (err?.error?.errors) {
          err.error.errors.forEach((e: any) => this.toastr.error(e.message, 'Validation Error'));
        }
      }
    });
  }

  openEditCompanyModal(company: any) {
    this.selectedCompany = { ...company }; // clone to avoid direct mutation
    this.logoPreview = company.logo || null;

    const modalEl = document.getElementById('editCompanyModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

  // Handle logo file for editing
  handleEditLogo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File size must be less than 5 MB', 'File Too Large');
      event.target.value = '';
      this.logoPreview = null;
      return;
    }

    this.selectedCompany.logo = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Submit edit
  submitEditCompany() {
    if (!this.selectedCompany.name) {
      this.toastr.error('Company name is required', 'Form Error');
      return;
    }

    this.isUpdating = true;

    this.apiService.updateCompany(this.selectedCompany.id, this.selectedCompany).subscribe({
      next: (res) => {
        this.toastr.success('Company updated successfully!', 'Success');
        this.isUpdating = false;

        // Close modal
        const modalEl = document.getElementById('editCompanyModal');
        const modal = Modal.getInstance(modalEl!);
        modal?.hide();

        // Refresh list
        this.getCompanies(this.currentPage);

        // Reset
        this.selectedCompany = null;
        this.logoPreview = null;
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to update company', 'Error');
        this.isUpdating = false;

        if (err?.error?.errors) {
          err.error.errors.forEach((e: any) => this.toastr.error(e.message, 'Validation Error'));
        }
      }
    });
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.getCompanies(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.getCompanies(this.currentPage + 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getCompanies(page);
    }
  }
}
