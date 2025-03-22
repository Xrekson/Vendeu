import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { Session } from '../../services/Store/session.model';
import { updateSession } from '../../services/Store/session.actions';
import { Observable } from 'rxjs';
import { selectMAIN } from '../../services/Store/session.selectors';
import { AppState } from '../../services/Store/app.store';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  actorForm: FormGroup;
  data$ : Observable<Session>;

  constructor(private authServ:AuthService,private store: Store<AppState>){
      this.actorForm = new FormGroup({
        username: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.minLength(5)]),
        password: new FormControl('', [Validators.required,Validators.maxLength(100),Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\]:;"'<>,.?/\\|-]).{4,}(?=\D*\d.*\d.*\d).*/)]),
      });
      this.data$ = this.store.select(selectMAIN);
    }

    submitForm(){
      const data = this.actorForm.value;
      // console.log(data);
      const form = new FormData();
      Object.keys(data).map((datax)=>{
          form.append(datax,data[datax]);
      })
      this.authServ.login(form).subscribe({
        next: (res)=>{
          // console.log(res);
          if(res){
            const data = JSON.parse(JSON.stringify(res));
            let sessionData:Session = {
              id:data.id,
              token:data.token,
              username:data.username
            };
            // console.log(sessionData);
            this.store.dispatch(updateSession({session:sessionData}));
          }
        },error : (err)=>{
          console.log(err);
        }
      })
    }

}
