import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);

  readonly changePasswordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/), Validators.pattern(/[a-z]/), Validators.pattern(/\d/), Validators.pattern(/[^A-Za-z0-9]/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordRelationshipValidator() },
  );

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  submit(): void {
    if (this.isSubmitting) return;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.changePasswordForm.getRawValue();
    this.isSubmitting = true;
    this.authService.ChangePassword(currentPassword, newPassword)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          if (response.data?.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('socialToken', response.data.token);
          }
          this.successMessage = response.message || 'Password updated successfully.';
          this.changePasswordForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Unable to update password. Please try again.';
        },
      });
  }

  private passwordRelationshipValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentPassword = control.get('currentPassword')?.value;
      const newPassword = control.get('newPassword')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      const errors: ValidationErrors = {};

      if (currentPassword && newPassword && currentPassword === newPassword) errors['samePassword'] = true;
      if (newPassword && confirmPassword && newPassword !== confirmPassword) errors['passwordMismatch'] = true;

      return Object.keys(errors).length ? errors : null;
    };
  }
}
