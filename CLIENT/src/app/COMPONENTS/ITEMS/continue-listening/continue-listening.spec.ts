import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinueListening } from './continue-listening';

describe('ContinueListening', () => {
  let component: ContinueListening;
  let fixture: ComponentFixture<ContinueListening>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContinueListening]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContinueListening);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
