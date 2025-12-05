import { Component, OnInit } from '@angular/core';
import { BasicStatus, PaginatedUsers, UserRole, User } from '../../../models/user.model';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: false,
})
export class UserManagementComponent implements OnInit {

  loadingUsers: boolean = true;


  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  paginatedUsers: User[] = [];
  totalPages: number = 0;


  selectedUser: User | null = null;

  newUser: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: UserRole.USER,
    img: null,
    signature: null
  };
  availableRoles = Object.values(UserRole).filter(r => r !== UserRole.SUPER_ADMIN);
  avatarPreview: string | null = null;
  signaturePreview: string | null = null;
  readonly maxFileSize = 5 * 1024 * 1024;
  isCreating: boolean = false;


  isEditing: boolean = false;

  constructor(private apiService: ApiService,
    private toastr: ToastrService,
    public authService: AuthService
  ) { }


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loadingUsers = true;
    this.apiService.getUsers(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res: PaginatedUsers) => {
        this.users = res.users;
        this.filteredUsers = [...res.users];
        this.totalPages = res.pagination.totalPages;

        if (res.users.length === 0) {
          this.toastr.info('No users found', 'Info');
        }

        this.updatePagination();
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err)

        this.toastr.error(
          err?.error?.message || 'Failed to fetch users',
          'Error'
        );
        // Clear table if fetch fails
        this.users = [];
        this.filteredUsers = [];
        this.paginatedUsers = [];
        this.totalPages = 0;

        this.loadingUsers = false;
      }
    });
  }

  searchUsers() {
    this.currentPage = 1; // reset to first page
    this.loadUsers();
  }


  updatePagination() {
    this.paginatedUsers = [...this.filteredUsers];
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }


  viewUser(user: User) {
    this.selectedUser = user;

    // Show Bootstrap modal
    const modalEl = document.getElementById('userDetailModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

  handleFile(event: any, field: 'img' | 'signature') {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.toastr.error('File size must be less than 5 MB', 'File Too Large');

      // Reset the input
      event.target.value = '';
      if (field === 'img') this.avatarPreview = null;
      if (field === 'signature') this.signaturePreview = null;
      return;
    }

    // Save file
    this.newUser[field] = file;

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      if (field === 'img') {
        this.avatarPreview = reader.result as string;
      } else {
        this.signaturePreview = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }


  addUser() {
    const modalEl = document.getElementById('addUserModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }


  submitCreateUser() {

    const form = document.querySelector('form');

    // Prevent backend call if form invalid
    if ((form as any).invalid) {
      this.toastr.error('Please complete all required fields', 'Form Error');
      return;
    }
    this.isCreating = true;

    this.apiService.createUser(this.newUser).subscribe({
      next: (res) => {
        this.toastr.success('User created successfully! and email sent', 'Success');
        this.isCreating = false;

        // Close modal
        const modalEl = document.getElementById('addUserModal');
        const modal = Modal.getInstance(modalEl!);
        modal?.hide();

        // Reload user list
        this.loadUsers();

        // Reset form
        this.newUser = {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          role: UserRole.USER,
          img: null,
          signature: null,
        };
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to create user', 'Error');
        this.isCreating = false;

        if (err?.error?.errors) {
          // Pick messages
          const messages = err.error.errors.map((e: any) => e.message);
          messages.forEach((msg: any) => this.toastr.error(msg, 'Validation Error'));
        } else {
          this.toastr.error(err?.error?.message || 'Failed to create user', 'Error');
        }
      }
    });
  }

  editUser(user: User) {
    // Pre-fill the form
    this.newUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      img: null,           // We'll handle new uploads only
      signature: null,
      password: '',
    };

    // Show previews if available
    this.avatarPreview = user.img || null;
    this.signaturePreview = user.signature || null;

    // Show modal
    const modalEl = document.getElementById('editUserModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

  submitEditUser() {
    const form = document.querySelector('#editUserModal form');

    if ((form as any).invalid) {
      this.toastr.error('Please complete all required fields', 'Form Error');
      return;
    }

    this.isEditing = true;

    const payload = { ...this.newUser };
    if (!payload.password) delete payload.password;

    this.apiService.editUser(this.newUser.id, payload).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        this.isEditing = false;

        // Close modal
        const modalEl = document.getElementById('editUserModal');
        const modal = Modal.getInstance(modalEl!);
        modal?.hide();

        // Reload users
        this.loadUsers();

        // Reset previews
        this.avatarPreview = null;
        this.signaturePreview = null;
      },
      error: (err) => {
        this.isEditing = false;

        if (err?.error?.errors) {
          const messages = err.error.errors.map((e: any) => e.message);
          messages.forEach((msg: any) => this.toastr.error(msg, 'Validation Error'));
        } else {
          this.toastr.error(err?.error?.message || 'Failed to update user', 'Error');
        }
      }
    });
  }

  confirmToggleStatus(user: User) {
    const action = user.status === 'Active' ? 'deactivate' : 'activate';

    Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${action} ${user.firstName} ${user.lastName}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.toggleUserStatus(user);
      }
    });
  }

  toggleUserStatus(user: User) {
    this.apiService.toggleUserStatus(user.id).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Success');
        // Update the user status in the table
        user.status = res.user.status;
      },
      error: (err) => {
        const message =
          err?.error?.message || 'Failed to toggle user status';
        this.toastr.error(message, 'Error');
      },
    });
  }

}

