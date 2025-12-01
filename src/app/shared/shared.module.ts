import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonLoaderComponent } from './components/button-loader/button-loader/button-loader.component';



@NgModule({
  declarations: [ButtonLoaderComponent],
  imports: [
    CommonModule
  ],
  exports: [ButtonLoaderComponent]
})
export class SharedModule { }
