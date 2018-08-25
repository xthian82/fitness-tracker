import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TrainingComponent } from './training.component';
import { NewTrainingComponent } from './new-training/new-training.component';
import { PastTrainingComponent } from './past-training/past-training.component';
import { CurrentTrainingComponent } from './current-training/current-training.component';
import { StopTrainingComponent } from './current-training/stop-training.component';
import { SharedModule } from '../shared/shared.module';
import { TrainingRoutingModule } from './training-routing.module';
import { StoreModule } from '@ngrx/store';
import { trainingReducer } from './training.reducer';

@NgModule({
  declarations: [
    TrainingComponent,
    NewTrainingComponent,
    PastTrainingComponent,
    CurrentTrainingComponent,
    StopTrainingComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    TrainingRoutingModule,
    StoreModule,
    StoreModule.forFeature('training', trainingReducer)
  ],
  entryComponents: [StopTrainingComponent]
})
export class TrainingModule {}