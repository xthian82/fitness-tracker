import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { UIService } from '../shared/ui.service';
import * as fromTraining from 'training.reducer';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import { take } from 'rxjs/operators';

@Injectable()
export class TrainingService {
  // exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  // finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[];

  private dbAvailableExercises = 'availableExercises';
  private dbFinishedExercises = 'finishedExercises';
  private subscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private store: Store<fromTraining.State>
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
      this.store.dispatch(new Training.SetAvailableTrainings(exercises));
      // this.availableExercises = exercises;
      // this.exercisesChanged.next([...this.availableExercises]);
    }, error => {
      this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
      this.store.dispatch(new UI.StopLoading());
      this.exercisesChanged.next(null);
    }));
  }

  startExercise(selectedId: string) {
    // this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    // this.exerciseChanged.next({...this.runningExercise});
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1))
      .subscribe(ex => this.addDataToDatabase(this.newExercise(ex, 'completed')));
    this.store.dispatch(new Training.StopTraining());
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1))
      .subscribe(ex => this.addDataToDatabase(this.newExercise(ex, 'cancelled', progress)));
    this.store.dispatch(new Training.StopTraining());
  }

  fetchCompletedOrCancelledExercises() {
    this.subscriptions.push(
      this.db
      .collection(this.dbFinishedExercises)
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.store.dispatch(new Training.SetFinishedTrainings(exercises));
      })
    );
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection(this.dbFinishedExercises).add(exercise);
  }

  cancelSubscriptions() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private newExercise(ex: Exercise, status, progress?: number): Exercise {
    return {
      ...ex,
      duration: progress ? ex.duration * (progress / 100) : ex.duration,
      calories: progress ? ex.calories * (progress / 100) : ex.calories,
      date: new Date(),
      state: status
    };
  }
}
