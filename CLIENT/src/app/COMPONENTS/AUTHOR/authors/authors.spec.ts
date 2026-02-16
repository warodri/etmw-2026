import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Authors } from './authors';

describe('Authors', () => {
  let component: Authors;
  let fixture: ComponentFixture<Authors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Authors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Authors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
