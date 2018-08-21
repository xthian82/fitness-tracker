import {Component, OnDestroy, OnInit} from '@angular/core';
import {TrainingService} from './training.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit, OnDestroy {
  ongoingTraining = false;
  exerciseSubscription: Subscription;

  constructor(private trainingService: TrainingService) {}

  ngOnInit() {
    this.exerciseSubscription = this.trainingService.exerciseChanged.subscribe(exercise => {
      this.ongoingTraining = exercise != null;
    });
  }

  ngOnDestroy() {
    this.exerciseSubscription.unsubscribe();
  }
}
