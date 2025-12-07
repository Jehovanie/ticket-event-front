import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TitleCaseDateFrPipe } from '@/app/_utils/pipe/titleCaseDateFr';

import { IEvent } from '@/app/_core/model';

@Component({
  selector: 'app-list-event',
  imports: [
    CommonModule,
    RouterLink,
    TitleCaseDateFrPipe,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './list-event.component.html',
  styleUrl: './list-event.component.css',
})
export class ListEventComponent implements AfterViewInit {
  @Input() events!: IEvent[];

  displayedColumns: string[] = [
    'Numéro',
    'Evénement',
    'Date de debut',
    'Date de fin',
    'Lieu',
    'Place maximum',
    'Place libre',
    'Status',
    'Action'
  ];
  dataSource = new MatTableDataSource<IEvent>(this.events);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource<IEvent>(this.events);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
