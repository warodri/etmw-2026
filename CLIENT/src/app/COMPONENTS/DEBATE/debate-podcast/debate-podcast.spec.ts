import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebatePodcast } from './debate-podcast';

describe('DebatePodcast', () => {
  let component: DebatePodcast;
  let fixture: ComponentFixture<DebatePodcast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebatePodcast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebatePodcast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
