import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  actorForm: FormGroup;
  constructor(){
    this.actorForm = new FormGroup({
      dob: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ]),
      email: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      mobileno: new FormControl('', [Validators.required,Validators.minLength(10),Validators.maxLength(10)]),
      username: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.minLength(5)]),
      password: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-]).{4,}(?=\D*\d.*\d.*\d).*/)]),
      type: new FormControl('', Validators.required),
      deg: new FormControl('', Validators.required,),
      about: new FormControl('', [Validators.required,Validators.maxLength(255)]),
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    });

  }
}
