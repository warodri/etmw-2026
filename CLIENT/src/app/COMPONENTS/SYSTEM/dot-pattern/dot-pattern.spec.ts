import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DotPattern } from './dot-pattern';

describe('DotPattern', () => {
  let component: DotPattern;
  let fixture: ComponentFixture<DotPattern>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DotPattern]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DotPattern);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
