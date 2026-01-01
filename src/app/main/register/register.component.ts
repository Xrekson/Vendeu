import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

interface UserType {
  name: string;
  code: string;
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(20px)', opacity: 0 }),
        animate('300ms 200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class RegisterComponent implements OnInit {
  actorForm: FormGroup;
  userType: UserType[] = [
    { name: 'Buyer', code: 'BUY' },
    { name: 'Seller', code: 'SEL' }
  ];
  
  // New properties
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  maxDate: Date;
  minDate: Date;
  isLinear = true;
  currentStep = 0;

  constructor(
    private authServ: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Set date constraints (18+ years old, max 100 years)
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 1);
    this.maxDate = new Date(currentYear - 18, 11, 31);

    this.actorForm = new FormGroup({
      // Personal Information
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(5),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]),
      dob: new FormControl('', [
        Validators.required
      ]),
      mobileno: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]),

      // Account Information
      password: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        // Add custom validator function directly
        (control: AbstractControl): ValidationErrors | null => {
          if (!control.parent) return null;
          const password = control.parent.get('password')?.value;
          const confirmPassword = control.value;
          return password && confirmPassword && password !== confirmPassword 
            ? { passwordMismatch: true } 
            : null;
        }
      ]),

      // Additional Information
      type: new FormControl('', Validators.required),
      deg: new FormControl('', [
        Validators.required,
        Validators.maxLength(100)
      ]),
      about: new FormControl('', [
        Validators.required,
        Validators.maxLength(255),
        Validators.minLength(20)
      ]),
      
      // Terms & Conditions
      acceptTerms: new FormControl(false, Validators.requiredTrue)
    });
  }

  ngOnInit(): void {
    // Subscribe to form value changes for real-time validation
    this.actorForm.get('password')?.valueChanges.subscribe(() => {
      if (this.actorForm.get('confirmPassword')?.touched) {
        this.actorForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[@$!%*?&]/.test(password)) strength += 25;
    return strength;
  }

  getPasswordStrengthColor(strength: number): string {
    if (strength >= 75) return '#4caf50';
    if (strength >= 50) return '#ff9800';
    return '#f44336';
  }

  getPasswordStrengthText(strength: number): string {
    if (strength >= 75) return 'Strong';
    if (strength >= 50) return 'Medium';
    if (strength >= 25) return 'Weak';
    return 'Very Weak';
  }

  isPasswordStrong(): boolean {
    const password = this.actorForm.get('password')?.value;
    return this.calculatePasswordStrength(password) >= 75;
  }

  isMobileNumberValid(): boolean {
    const mobile = this.actorForm.get('mobileno')?.value;
    return /^[0-9]{10}$/.test(mobile);
  }

  isEmailValid(): boolean {
    const email = this.actorForm.get('email')?.value;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  isUsernameAvailable(): boolean {
    // This would typically call a service to check username availability
    const username = this.actorForm.get('username')?.value;
    return username && username.length >= 5 && /^[a-zA-Z0-9_]+$/.test(username);
  }

  submitForm(): void {
    if (this.actorForm.invalid) {
      this.markFormGroupTouched(this.actorForm);
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const data = { ...this.actorForm.value };
    
    // Format data for API
    data.dob = new Date(data.dob).toISOString().split('T')[0];
    data.type = data.type.code;
    
    // Remove fields not needed for API
    delete data.confirmPassword;
    delete data.acceptTerms;

    console.log('Submitting registration data:', data);

    this.authServ.register(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Registration successful:', res);
        
        this.snackBar.open('Registration successful! Redirecting to login...', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Redirect to login after successful registration
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration error:', err);
        
        let errorMessage = 'Registration failed. Please try again.';
        if (err.status === 400) {
          errorMessage = err.error?.message || 'Invalid registration data';
        } else if (err.status === 409) {
          errorMessage = 'Username or email already exists';
        } else if (err.status === 0) {
          errorMessage = 'Unable to connect to server';
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getter methods for template
  get name() { return this.actorForm.get('name'); }
  get username() { return this.actorForm.get('username'); }
  get email() { return this.actorForm.get('email'); }
  get mobileno() { return this.actorForm.get('mobileno'); }
  get dob() { return this.actorForm.get('dob'); }
  get password() { return this.actorForm.get('password'); }
  get confirmPassword() { return this.actorForm.get('confirmPassword'); }
  get type() { return this.actorForm.get('type'); }
  get deg() { return this.actorForm.get('deg'); }
  get about() { return this.actorForm.get('about'); }
  get acceptTerms() { return this.actorForm.get('acceptTerms'); }

  checkRegex(regexData:string,value:string){
    return new RegExp(regexData).test(value);
  }
}