import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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



  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router, private toastr: ToastrService) {
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

    this.apiService.login(email, password).subscribe({
      next: (res) => {
        if (res.step === 'verification_required') {
          this.step = 'verification';
          this.emailForVerification = email;
          this.verificationMessage = res.message;

          this.toastr.success(res.message, 'Check your email');

        } else {
          this.toastr.error('Incorrect email or password', 'Login failed');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('An error occurred while logging in', 'Login failed');

      }
    });
  }

  backToLogin() {
    this.step = 'login';
  }

  submitVerification() {
    const code = this.verificationForm.value.code;

    // Example: call verification API here
    console.log('Verification code submitted:', code);

    this.toastr.success('You are now logged in!', 'Verified');


    // Redirect after verification
    // this.router.navigate(['/dashboard']);
  }

  resendCode() {
    // Example: call resend API here
    console.log('Resend verification code for', this.emailForVerification);

    this.toastr.success('A new verification code has been sent to your email.', 'Code Resent');

  }
}
