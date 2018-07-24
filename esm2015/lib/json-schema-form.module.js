import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetLibraryModule } from './widget-library/widget-library.module';
import { JsonSchemaFormComponent } from './json-schema-form.component';
import { NoFrameworkModule } from './framework-library/no-framework/no-framework.module';
let JsonSchemaFormModule = class JsonSchemaFormModule {
};
JsonSchemaFormModule = tslib_1.__decorate([
    NgModule({
        imports: [
            CommonModule, FormsModule, ReactiveFormsModule,
            WidgetLibraryModule, NoFrameworkModule
        ],
        declarations: [JsonSchemaFormComponent],
        exports: [JsonSchemaFormComponent, WidgetLibraryModule]
    })
], JsonSchemaFormModule);
export { JsonSchemaFormModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2pzb24tc2NoZW1hLWZvcm0ubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUF1QixNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRTdFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBVXpGLElBQWEsb0JBQW9CLEdBQWpDO0NBQW9DLENBQUE7QUFBdkIsb0JBQW9CO0lBUmhDLFFBQVEsQ0FBQztRQUNSLE9BQU8sRUFBRTtZQUNQLFlBQVksRUFBRSxXQUFXLEVBQUUsbUJBQW1CO1lBQzlDLG1CQUFtQixFQUFFLGlCQUFpQjtTQUN2QztRQUNELFlBQVksRUFBRSxDQUFDLHVCQUF1QixDQUFDO1FBQ3ZDLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixDQUFDO0tBQ3hELENBQUM7R0FDVyxvQkFBb0IsQ0FBRztTQUF2QixvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEZvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBXaWRnZXRMaWJyYXJ5TW9kdWxlIH0gZnJvbSAnLi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5tb2R1bGUnO1xuXG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybUNvbXBvbmVudCB9IGZyb20gJy4vanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBOb0ZyYW1ld29ya01vZHVsZSB9IGZyb20gJy4vZnJhbWV3b3JrLWxpYnJhcnkvbm8tZnJhbWV3b3JrL25vLWZyYW1ld29yay5tb2R1bGUnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgICBXaWRnZXRMaWJyYXJ5TW9kdWxlLCBOb0ZyYW1ld29ya01vZHVsZVxuICBdLFxuICBkZWNsYXJhdGlvbnM6IFtKc29uU2NoZW1hRm9ybUNvbXBvbmVudF0sXG4gIGV4cG9ydHM6IFtKc29uU2NoZW1hRm9ybUNvbXBvbmVudCwgV2lkZ2V0TGlicmFyeU1vZHVsZV1cbn0pXG5leHBvcnQgY2xhc3MgSnNvblNjaGVtYUZvcm1Nb2R1bGUge31cbiJdfQ==