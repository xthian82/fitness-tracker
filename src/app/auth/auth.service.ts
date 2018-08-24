import { AuthData } from './auth-data.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { TrainingService } from '../training/training.service';
import { UIService } from '../shared/ui.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import * as Auth from '../auth/auth.actions';

@Injectable()
export class AuthService {

  constructor(
    private router: Router,
    private dbAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private uiService: UIService,
    private store: Store<fromRoot.State>) {}

  registerUser(authData: AuthData) {
    this.store.dispatch(new UI.StartLoading());
    this.dbAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .then(result => {
      this.store.dispatch(new UI.StopLoading());
    })
    .catch(err => {
      this.uiService.showSnackbar(err.message, null, 4000);
      this.store.dispatch(new UI.StopLoading());
    });
  }

  initAuthListener() {
    this.dbAuth.authState.subscribe(user => {
      if (user) {
        this.store.dispatch(new Auth.SetAuthenticated());
        this.router.navigate(['/training']);
      } else {
        this.trainingService.cancelSubscriptions();
        this.store.dispatch(new Auth.SetUnauthenticated());
        this.router.navigate(['/login']);
      }
    });
  }

  login(authData: AuthData) {
    this.store.dispatch(new UI.StartLoading());
    this.dbAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
    .then(result => {
      this.store.dispatch(new UI.StopLoading());
    })
    .catch(err => {
      this.store.dispatch(new UI.StopLoading());
      this.uiService.showSnackbar(err.message, null,  4000);
    });
  }

  logout() {
    this.dbAuth.auth.signOut();
  }
}
