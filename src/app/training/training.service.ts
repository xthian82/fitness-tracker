import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AngularFirestore } from 'angularfire2/firestore';
import {Subscription} from 'rxjs/Subscription';
import { UIService } from '../shared/ui.service';

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

  constructor(private db: AngularFirestore, private uiService: UIService) {}

  fetchAvailableExercises() {
    this.uiService.loadingStateChanged.next(true);
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
      this.uiService.loadingStateChanged.next(false);
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    }, error => {
      this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
      this.uiService.loadingStateChanged.next(false);
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
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.cleanExercise();
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
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
}
