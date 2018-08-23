import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { TrainingService } from '../training/training.service';

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private router: Router, private dbAuth: AngularFireAuth, private trainingService: TrainingService) {}

  registerUser(authData: AuthData) {
    this.dbAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .catch(err => {
      console.log(err);
    });
  }

  initAuthListener() {
    this.dbAuth.authState.subscribe(user => {
      if (user) {
        this.authChange.next(true);
        this.router.navigate(['/training']);
        this.isAuthenticated = true;
      } else {
        this.trainingService.cancelSubscriptions();
        this.authChange.next(false);
        this.router.navigate(['/login']);
        this.isAuthenticated = false;
      }
    });
  }

  login(authData: AuthData) {
    this.dbAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
    .catch(err => {
      console.log(err);
    });
  }

  logout() {
    this.dbAuth.auth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
