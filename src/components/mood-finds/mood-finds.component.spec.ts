import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodFindsComponent } from './mood-finds.component';

describe('MoodFindsComponent', () => {
  let component: MoodFindsComponent;
  let fixture: ComponentFixture<MoodFindsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoodFindsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoodFindsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
