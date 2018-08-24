import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { UIService } from '../shared/ui.service';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[];

  private runningExercise: Exercise;
  private dbAvailableExercises = 'availableExercises';
  private dbFinishedExercises = 'finishedExercises';
  private subscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private store: Store<{ui: fromRoot.State}>
  ) {}

  fetchAvailableExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.subscriptions.push(this.db.collection(this.dbAvailableExercises).snapshotChanges().map(docArray => {
      return docArray.map(doc => {
        return {
          id: doc.payload.doc.id,
          name: doc.payload.doc.data().name,
          duration: doc.payload.doc.data().duration,
          calories: doc.payload.doc.data().calories
        };
      });
    })
    .subscribe((exercises: Exercise[]) => {
      this.store.dispatch(new UI.StopLoading());
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    }, error => {
      this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
      this.store.dispatch(new UI.StopLoading());
      this.exercisesChanged.next(null);
    }));
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next({...this.runningExercise});
  }

  getRunningExercise(): Exercise {
    return {...this.runningExercise};
  }

  completeExercise() {
    // this.addDataToDatabase({
    //   ...this.runningExercise,
    //   date: new Date(),
    //   state: 'completed'
    // });
    this.addDataToDatabase(this.newExercise('completed'));
    this.cleanExercise();
  }

  cancelExercise(progress: number) {
    // this.addDataToDatabase({
    //   ...this.runningExercise,
    //   duration: this.runningExercise.duration * (progress / 100),
    //   calories: this.runningExercise.calories * (progress / 100),
    //   date: new Date(),
    //   state: 'cancelled'
    // });
    this.addDataToDatabase(this.newExercise('cancelled', progress));
    this.cleanExercise();
  }

  cleanExercise() {
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  fetchCompletedOrCancelledExercises() {
    this.subscriptions.push(this.db.collection(this.dbFinishedExercises).valueChanges().subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises);
    }));
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection(this.dbFinishedExercises).add(exercise);
  }

  cancelSubscriptions() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private newExercise(status, progress?: number): Exercise {
    return {
      ...this.runningExercise,
      duration: progress ? this.runningExercise.duration * (progress / 100) : this.runningExercise.duration,
      calories: progress ? this.runningExercise.calories * (progress / 100) : this.runningExercise.calories,
      date: new Date(),
      state: status
    };
  }
}
