import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { blogconst } from '../constant';
import { Observable , throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

interface ContentBlock {
  type: string;
  data: {
    text: string;
  };
}

@Component({
  selector: 'app-createblog',
  templateUrl: './createblog.component.html',
  styleUrls: ['./createblog.component.css']
})
export class CreateblogComponent {
  blogForm!: FormGroup;
  private apiUrl = 'https://hustleforwork.com:3000/create-blog';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute // Adjust this service injection
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      des: ['', Validators.required],
      banner: [''],
      tags: this.fb.array([]),
      content: ['', Validators.required], // Assuming CKEditor is used to input content
      draft: [false]
    });
  }

  createBlogData(blogData: any , token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.apiUrl, blogData).pipe(
      catchError(error => {
        console.error('Server error:', error);
        return throwError('Server error occurred');
      })
    );
  }

  createBlog(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      console.log("Token in CreateBlog component:", token);

      const blogData = this.blogForm.value;

      console.log("Blog data:", blogData);

      if (this.blogForm.valid) {
        this.createBlogData(blogData, token).subscribe(
     {
      next:     response => {
        console.log('Blog created successfully:', response);
        this.blogForm.reset();
        this.clearTags();
      },
     error: error => {
        console.error('Error creating blog:', error);
      }
     }
        );
      } else {
        console.error('Invalid blog data');
      }
    });
  }

  addTag(): void {
    this.tags.push(this.fb.control(''));
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  clearTags(): void {
    while (this.tags.length !== 0) {
      this.tags.removeAt(0);
    }
  }

  get tags(): FormArray {
    return this.blogForm.get('tags') as FormArray;
  }
}
