import {MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {NgModule} from '@angular/core';

@NgModule({
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  exports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule]
})
export class MaterialModule {

}
