import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonLoaderComponent } from './components/button-loader/button-loader.component';
import { ShimmerComponent } from './components/shimmer/shimmer.component';



@NgModule({
  declarations: [ButtonLoaderComponent, ShimmerComponent],
  imports: [
    CommonModule
  ],
  exports: [ButtonLoaderComponent, ShimmerComponent]
})
export class SharedModule { }
