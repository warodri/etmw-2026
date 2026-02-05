import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtmwPlayer } from './etmw-player';

describe('EtmwPlayer', () => {
  let component: EtmwPlayer;
  let fixture: ComponentFixture<EtmwPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtmwPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtmwPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
