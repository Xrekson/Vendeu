import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListingService } from '../../services/listing/listing.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';


@Component({
  selector: 'app-create-listing',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatInputModule,MatFormFieldModule ],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.scss'
})
export class CreateListingComponent {
listingForm!: FormGroup;

  constructor(private fb: FormBuilder,private listing:ListingService) {
    this.listingForm = this.fb.group({
      name: ['', Validators.required],
      // img: this.fb.array([this.fb.control('')]), // Array of strings
      price: [null, [Validators.required, Validators.min(0)]],
      detail: ['', Validators.required],
      // category: this.fb.group({
      //   id: [null],  // assuming category has an ID
      //   name: ['']   // adjust according to your Category entity
      // }),
      priceInterval: [null],
      auction_start: ['', Validators.required],
      auction_end: ['', Validators.required],
      highestbid: [null],
      images: this.fb.array([this.fb.control('')]) // Additional image list
    });
  }

  ngOnInit(): void {
    // this.listingForm = this.fb.group({
    //   id: [null],
    //   name: ['', Validators.required],
    //   img: this.fb.array([this.fb.control('')]), // Array of strings
    //   price: [0, [Validators.required, Validators.min(0)]],
    //   detail: ['', Validators.required],
    //   category: this.fb.group({
    //     id: [null],  // assuming category has an ID
    //     name: ['']   // adjust according to your Category entity
    //   }),
    //   priceInterval: [0],
    //   auction_start: ['', Validators.required],
    //   auction_end: ['', Validators.required],
    //   highestbid: [0],
    //   images: this.fb.array([this.fb.control('')]) // Additional image list
    // });
  }

  // get img(): FormArray {
  //   return this.listingForm.get('img') as FormArray;
  // }

  get images(): FormArray {
    return this.listingForm.get('images') as FormArray;
  }

  addImageField(arrayName: 'img' | 'images') {
    (this.listingForm.get(arrayName) as FormArray).push(this.fb.control(''));
  }

  submit(): void {
    if (this.listingForm.valid) {
      console.log(this.listingForm.value);
      const data = this.listingForm.value;
      this.listing.createListing(data).subscribe({
        next: (data)=>{
          console.log(data);
        },
        error: (err)=>{
          console.error(err);
        }
      });
      // Send this to your backend
    }
  }
}
