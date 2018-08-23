import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private router: Router, private dbAuth: AngularFireAuth) {}

  registerUser(authData: AuthData) {
    this.dbAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .then(result => {
      this.authSuccessfully();
    })
    .catch(err => {
      console.log(err);
    });
  }

  login(authData: AuthData) {
    this.dbAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
    .then(resutl => {
      this.authSuccessfully();
    })
    .catch(err => {
      console.log(err);
    });
  }

  logout() {
    this.isAuthenticated = true;
    this.authChange.next(false);
    this.router.navigate(['/login']);
  }

  isAuth() {
    return this.isAuthenticated;
  }

  authSuccessfully() {
    this.authChange.next(true);
    this.router.navigate(['/training']);
    this.isAuthenticated = true;
  }
}
