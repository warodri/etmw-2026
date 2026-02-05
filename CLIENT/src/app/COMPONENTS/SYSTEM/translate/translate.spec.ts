import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Translate } from './translate';

describe('Translate', () => {
  let component: Translate;
  let fixture: ComponentFixture<Translate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Translate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Translate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
