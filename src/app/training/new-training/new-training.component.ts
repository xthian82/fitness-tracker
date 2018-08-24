import { Component, OnDestroy, OnInit } from '@angular/core';
import { TrainingService } from '../training.service';
import { NgForm } from '@angular/forms';
import { Exercise } from '../exercise.model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../app.reducer';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  private exerciseSubscription: Subscription;
  isLoading$: Observable<boolean>;

  constructor(private trainingService: TrainingService, private store: Store<{ui: fromRoot.State}>) {}

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(exercises => {
        this.exercises = exercises;
      }
    );
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exerciseSelected);
  }

  ngOnDestroy() {
    if (this.exerciseSubscription) {
      this.exerciseSubscription.unsubscribe();
    }
  }
}
