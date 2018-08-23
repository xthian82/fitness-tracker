import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { TrainingService } from '../training/training.service';
import { UIService } from '../shared/ui.service';

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(
    private router: Router,
    private dbAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private uiService: UIService) {}

  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.dbAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .then(result => {
      this.uiService.loadingStateChanged.next(false);
    })
    .catch(err => {
      this.uiService.showSnackbar(err.message, null, 4000);
      this.uiService.loadingStateChanged.next(false);
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
    this.uiService.loadingStateChanged.next(true);
    this.dbAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
    .then(result => {
      this.uiService.loadingStateChanged.next(false);
    })
    .catch(err => {
      this.uiService.loadingStateChanged.next(false);
      this.uiService.showSnackbar(err.message, null,  4000);
    });
  }

  logout() {
    this.dbAuth.auth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
