import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Store } from '@ngrx/store';
import { Session } from '../../services/Store/session.model';
import { updateSession } from '../../services/Store/session.actions';
import { Observable, Subscription } from 'rxjs';
import { selectMAIN } from '../../services/Store/session.selectors';
import { AppState } from '../../services/Store/app.store';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate('300ms 200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  actorForm: FormGroup;
  data$: Observable<Session>;
  
  // New properties for enhanced UI
  showPassword = false;
  isLoading = false;
  passwordStrength = 0;
  private subscriptions = new Subscription();

  constructor(
    private authServ: AuthService,
    private store: Store<AppState>, 
    private route: Router,
    private snackBar: MatSnackBar
  ) {
    this.actorForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(5)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\]:;"'<>,.?/\\|-]).{4,}(?=\D*\d.*\d.*\d).*/)
      ]),
      rememberMe: new FormControl(false)
    });
    
    this.data$ = this.store.select(selectMAIN);
  }

  ngOnInit(): void {
    // Check for remembered username
    const rememberedUser = localStorage.getItem('remembered_user');
    if (rememberedUser) {
      this.actorForm.patchValue({ 
        username: rememberedUser, 
        rememberMe: true 
      });
    }

    // Subscribe to password changes to show strength
    this.subscriptions.add(
      this.actorForm.get('password')?.valueChanges.subscribe(password => {
        this.calculatePasswordStrength(password);
      }) || new Subscription()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  calculatePasswordStrength(password: string): void {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Number check
    if (/\d/.test(password)) strength += 25;
    
    // Special character check
    if (/[!@#$%^&*()_+={}\]:;"'<>,.?/\\|-]/.test(password)) strength += 25;
    
    this.passwordStrength = strength;
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength >= 75) return '#4caf50';
    if (this.passwordStrength >= 50) return '#ff9800';
    return '#f44336';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength >= 75) return 'Strong';
    if (this.passwordStrength >= 50) return 'Medium';
    if (this.passwordStrength >= 25) return 'Weak';
    return 'Very Weak';
  }

  submitForm(): void {
    if (this.actorForm.invalid) {
      this.markFormGroupTouched(this.actorForm);
      this.snackBar.open('Please fix the form errors', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const data = this.actorForm.value;
    
    // Handle remember me
    if (data.rememberMe) {
      localStorage.setItem('remembered_user', data.username);
    } else {
      localStorage.removeItem('remembered_user');
    }

    const form = new FormData();
    Object.keys(data).forEach(key => {
      if (key !== 'rememberMe') { // Don't include rememberMe in form data
        form.append(key, data[key]);
      }
    });

    this.authServ.login(form).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (res) {
          const data = JSON.parse(JSON.stringify(res));
          let sessionData: Session = {
            id: data.id,
            token: data.token,
            username: data.username,
            type: data.type
          };
          
          this.store.dispatch(updateSession({ session: sessionData }));
          
          this.snackBar.open('Login successful! Redirecting...', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          
          setTimeout(() => {
            this.route.navigate(['dash']);
          }, 1000);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        
        let errorMessage = 'Login failed. Please try again.';
        if (err.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        // Add shake animation
        this.shakeForm();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  fillDemoCredentials(): void {
    this.actorForm.patchValue({
      username: 'demo_user',
      password: 'Demo@1234'
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private shakeForm(): void {
    const formElement = document.querySelector('.login-card');
    if (formElement) {
      formElement.classList.add('shake');
      setTimeout(() => {
        formElement.classList.remove('shake');
      }, 500);
    }
  }

  // Getter methods for template
  get username() { return this.actorForm.get('username'); }
  get password() { return this.actorForm.get('password'); }
  get rememberMe() { return this.actorForm.get('rememberMe'); }

  checkUpperpassword(value:string){
    return /(?=.*[A-Z])/.test(value);
  }
  checkpassword(value:string){
    return /(?=.*[!@#$%^&*()_+={}\]:;"'<>,.?/\\|-])/.test(value);
  }
  checkthreepassword(value:string){
    return /(?=\D*\d.*\d.*\d)/.test(value);
  }
}