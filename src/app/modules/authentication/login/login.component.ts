import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent {
  hidePassword = true;
  loginForm: FormGroup;
  verificationForm: FormGroup;
  step: 'login' | 'verification' = 'login';
  emailForVerification: string = '';
  verificationMessage: string = '';
  isLoading = false;
  isResending = false;
  isVerifying = false;




  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.verificationForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }


  submitLogin() {
    if (this.loginForm.invalid) {
      this.toastr.error('Please enter a valid email and password', 'Invalid Form');
      return;
    }
    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    this.apiService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.step === 'verification_required') {
          this.step = 'verification';
          this.emailForVerification = email;
          this.verificationMessage = res.message;

          this.toastr.success(res.message, 'Check your email');

        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastr.error(err.error?.message, 'Login failed');

      }
    });
  }

  backToLogin() {
    this.step = 'login';
  }

  submitVerification() {
    if (this.verificationForm.invalid) {
      this.toastr.error('Please enter the verification code', 'Invalid Form');
      return;
    }

    const code = this.verificationForm.value.code;

    if (!this.emailForVerification) {
      this.toastr.error('Email not found. Please go back and try again.', 'Error');
      return;
    }

    this.isVerifying = true;

    this.apiService.verifyCode(this.emailForVerification, code).subscribe({
      next: (res) => {
        this.isVerifying = false;

        // Store tokens and user info in localStorage
        this.authService.storeJwtToken(res.token);
        this.authService.storeRefreshToken(res.refreshToken);
        this.authService.storeUserId(res.user.id);

        const role = res.user.role.toLowerCase();

        if (role === 'admin' || role === 'super_admin') {
          this.authService.storeAdmin(res.user); // store only as admin
        } else {
          this.authService.storeUser(res.user);  // store only as regular user
        }

        this.toastr.success('You are now logged in!', 'Verified');

        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isVerifying = false;
        this.toastr.error(err.error?.message || 'Verification failed', 'Error');
      }
    });
  }

  resendCode() {
    if (!this.emailForVerification) {
      this.toastr.error('Email not found. Please go back and try again.', 'Error');
      return;
    }

    this.isResending = true;

    this.apiService.resendCode(this.emailForVerification).subscribe({
      next: (res) => {
        this.isResending = false;
        this.toastr.success('Verification code has been resent to your email', 'Code Resent');
      },
      error: (err) => {
        this.isResending = false;
        this.toastr.error(err.error?.message || 'Failed to resend code', 'Error');
      }
    });
  }

}
