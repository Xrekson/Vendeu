import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  actorForm: FormGroup;
  userType: object[] = [{name:'Buyer',code:'BUY'},{name:'Seller',code:'SEL'}];
  constructor(private authServ:AuthService){
    this.actorForm = new FormGroup({
      dob: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ]),
      email: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      mobileno: new FormControl(0, [Validators.required,Validators.minLength(10),Validators.maxLength(10)]),
      username: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.minLength(5)]),
      password: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\]:;"'<>,.?/\\|-]).{4,}(?=\D*\d.*\d.*\d).*/)]),
      type: new FormControl('', Validators.required),
      deg: new FormControl('', Validators.required,),
      about: new FormControl('', [Validators.required,Validators.maxLength(255)]),
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      // file: new FormControl(null)
    });

  }
  submitForm(){
    const data = this.actorForm.value;
    console.log(data);
    data.dob = data.dob.toISOString();
    data.type = data.type.code;
    // const form = new FormData();
    // Object.keys(data).map((datax)=>{
    //   if(datax!='file'){
    //     form.append(datax,data[datax]);
    //   }
    // })
    // form.append('file',data.file);
    this.authServ.register(data).subscribe({
      next: (res)=>{
        console.log(res);
      },error : (err)=>{
        console.log(err);
      }
    })

  }
  onUpload(data:FileUploadHandlerEvent){
    console.log(data.files[0]);
    if(data.files[0]){
      this.actorForm.patchValue({
        file: data.files[0]
      });
    }
  }
  clear(){
    this.actorForm.patchValue({
      file: null
    });
  }
}
