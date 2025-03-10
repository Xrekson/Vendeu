import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  actorForm: FormGroup;
  constructor(private authServ:AuthService){
      this.actorForm = new FormGroup({
        username: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.minLength(5)]),
        password: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\]:;"'<>,.?/\\|-]).{4,}(?=\D*\d.*\d.*\d).*/)]),
      });
    }

    submitForm(){
      const data = this.actorForm.value;
      console.log(data);
      const form = new FormData();
      Object.keys(data).map((datax)=>{
          form.append(datax,data[datax]);
      })
      this.authServ.login(form).subscribe({
        next: (res)=>{
          console.log(res);
        },error : (err)=>{
          console.log(err);
        }
      })
  
    }
}
