import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiddingMsgComponent } from './bidding-msg.component';

describe('BiddingMsgComponent', () => {
  let component: BiddingMsgComponent;
  let fixture: ComponentFixture<BiddingMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiddingMsgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiddingMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
