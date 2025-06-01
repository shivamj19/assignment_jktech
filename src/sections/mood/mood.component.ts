import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodFindsComponent } from "../../components/mood-finds/mood-finds.component";

@Component({
  selector: 'app-mood',
  imports: [CommonModule, MoodFindsComponent],
  templateUrl: './mood.component.html',
  styleUrl: './mood.component.css'
})
export class MoodComponent {
  moodVal: any = "";

  constructor(){ }

  setMood(mood: any){
    this.moodVal = mood;
  }

  closeMoods(){
    this.moodVal = "";
  }

}
