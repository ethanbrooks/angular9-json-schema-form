import * as tslib_1 from "tslib";
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
import { dateToString, stringToDate } from '../../shared';
var MaterialDatepickerComponent = /** @class */ (function () {
    function MaterialDatepickerComponent(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.autoCompleteList = [];
    }
    MaterialDatepickerComponent.prototype.ngOnInit = function () {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this, !this.options.readonly);
        this.setControlDate(this.controlValue);
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    };
    MaterialDatepickerComponent.prototype.ngOnChanges = function () {
        this.setControlDate(this.controlValue);
    };
    MaterialDatepickerComponent.prototype.setControlDate = function (dateString) {
        this.dateValue = stringToDate(dateString);
    };
    MaterialDatepickerComponent.prototype.updateValue = function (event) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, dateToString(event, this.options));
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], MaterialDatepickerComponent.prototype, "layoutNode", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], MaterialDatepickerComponent.prototype, "layoutIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], MaterialDatepickerComponent.prototype, "dataIndex", void 0);
    MaterialDatepickerComponent = tslib_1.__decorate([
        Component({
            selector: 'material-datepicker-widget',
            template: "\n    <mat-form-field [style.width]=\"'100%'\">\n      <span matPrefix *ngIf=\"options?.prefix || options?.fieldAddonLeft\"\n        [innerHTML]=\"options?.prefix || options?.fieldAddonLeft\"></span>\n      <input matInput *ngIf=\"boundControl\"\n        [formControl]=\"formControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [id]=\"'control' + layoutNode?._id\"\n        [max]=\"options?.maximum\"\n        [matDatepicker]=\"picker\"\n        [min]=\"options?.minimum\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.title\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        (blur)=\"options.showErrors = true\">\n      <input matInput *ngIf=\"!boundControl\"\n        [attr.aria-describedby]=\"'control' + layoutNode?._id + 'Status'\"\n        [attr.list]=\"'control' + layoutNode?._id + 'Autocomplete'\"\n        [attr.readonly]=\"options?.readonly ? 'readonly' : null\"\n        [disabled]=\"controlDisabled || options?.readonly\"\n        [id]=\"'control' + layoutNode?._id\"\n        [max]=\"options?.maximum\"\n        [matDatepicker]=\"picker\"\n        [min]=\"options?.minimum\"\n        [name]=\"controlName\"\n        [placeholder]=\"options?.title\"\n        [required]=\"options?.required\"\n        [style.width]=\"'100%'\"\n        [value]=\"dateValue\"\n        (blur)=\"options.showErrors = true\"\n        (change)=\"updateValue($event)\"\n        (input)=\"updateValue($event)\">\n      <span matSuffix *ngIf=\"options?.suffix || options?.fieldAddonRight\"\n        [innerHTML]=\"options?.suffix || options?.fieldAddonRight\"></span>\n      <mat-hint *ngIf=\"options?.description && (!options?.showErrors || !options?.errorMessage)\"\n        align=\"end\" [innerHTML]=\"options?.description\"></mat-hint>\n      <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\n    </mat-form-field>\n    <mat-datepicker #picker\n      (selectedChanged)=\"updateValue($event)\"></mat-datepicker>\n    <mat-error *ngIf=\"options?.showErrors && options?.errorMessage\"\n      [innerHTML]=\"options?.errorMessage\"></mat-error>",
            styles: ["\n    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }\n    ::ng-deep mat-form-field .mat-form-field-wrapper .mat-form-field-flex\n      .mat-form-field-infix { width: initial; }\n  "],
        }),
        tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
    ], MaterialDatepickerComponent);
    return MaterialDatepickerComponent;
}());
export { MaterialDatepickerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGF0ZXBpY2tlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2ZyYW1ld29yay1saWJyYXJ5L21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsvbWF0ZXJpYWwtZGF0ZXBpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUdwRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsWUFBWSxFQUFVLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQXVEbEU7SUFhRSxxQ0FDVSxHQUEwQjtRQUExQixRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQVRwQyxvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUN4QixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUVyQixxQkFBZ0IsR0FBYSxFQUFFLENBQUM7SUFPNUIsQ0FBQztJQUVMLDhDQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUN0RCxDQUFDO0lBQ0gsQ0FBQztJQUVELGlEQUFXLEdBQVg7UUFDRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsb0RBQWMsR0FBZCxVQUFlLFVBQWtCO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxpREFBVyxHQUFYLFVBQVksS0FBSztRQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBNUJRO1FBQVIsS0FBSyxFQUFFOzttRUFBaUI7SUFDaEI7UUFBUixLQUFLLEVBQUU7O29FQUF1QjtJQUN0QjtRQUFSLEtBQUssRUFBRTs7a0VBQXFCO0lBWGxCLDJCQUEyQjtRQXJEdkMsU0FBUyxDQUFDO1lBQ1QsUUFBUSxFQUFFLDRCQUE0QjtZQUN0QyxRQUFRLEVBQUUsb3ZFQTRDMkM7WUFDckQsTUFBTSxFQUFFLENBQUMsK01BSVIsQ0FBQztTQUNILENBQUM7aURBZWUscUJBQXFCO09BZHpCLDJCQUEyQixDQXNDdkM7SUFBRCxrQ0FBQztDQUFBLEFBdENELElBc0NDO1NBdENZLDJCQUEyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCwgT25DaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4uLy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5pbXBvcnQgeyBkYXRlVG9TdHJpbmcsIGhhc093biwgc3RyaW5nVG9EYXRlIH0gZnJvbSAnLi4vLi4vc2hhcmVkJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtZGF0ZXBpY2tlci13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxtYXQtZm9ybS1maWVsZCBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCI+XG4gICAgICA8c3BhbiBtYXRQcmVmaXggKm5nSWY9XCJvcHRpb25zPy5wcmVmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvbkxlZnRcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LnByZWZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uTGVmdFwiPjwvc3Bhbj5cbiAgICAgIDxpbnB1dCBtYXRJbnB1dCAqbmdJZj1cImJvdW5kQ29udHJvbFwiXG4gICAgICAgIFtmb3JtQ29udHJvbF09XCJmb3JtQ29udHJvbFwiXG4gICAgICAgIFthdHRyLmFyaWEtZGVzY3JpYmVkYnldPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ1N0YXR1cydcIlxuICAgICAgICBbYXR0ci5saXN0XT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZCArICdBdXRvY29tcGxldGUnXCJcbiAgICAgICAgW2F0dHIucmVhZG9ubHldPVwib3B0aW9ucz8ucmVhZG9ubHkgPyAncmVhZG9ubHknIDogbnVsbFwiXG4gICAgICAgIFtpZF09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWRcIlxuICAgICAgICBbbWF4XT1cIm9wdGlvbnM/Lm1heGltdW1cIlxuICAgICAgICBbbWF0RGF0ZXBpY2tlcl09XCJwaWNrZXJcIlxuICAgICAgICBbbWluXT1cIm9wdGlvbnM/Lm1pbmltdW1cIlxuICAgICAgICBbbmFtZV09XCJjb250cm9sTmFtZVwiXG4gICAgICAgIFtwbGFjZWhvbGRlcl09XCJvcHRpb25zPy50aXRsZVwiXG4gICAgICAgIFtyZXF1aXJlZF09XCJvcHRpb25zPy5yZXF1aXJlZFwiXG4gICAgICAgIFtzdHlsZS53aWR0aF09XCInMTAwJSdcIlxuICAgICAgICAoYmx1cik9XCJvcHRpb25zLnNob3dFcnJvcnMgPSB0cnVlXCI+XG4gICAgICA8aW5wdXQgbWF0SW5wdXQgKm5nSWY9XCIhYm91bmRDb250cm9sXCJcbiAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWQgKyAnU3RhdHVzJ1wiXG4gICAgICAgIFthdHRyLmxpc3RdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ0F1dG9jb21wbGV0ZSdcIlxuICAgICAgICBbYXR0ci5yZWFkb25seV09XCJvcHRpb25zPy5yZWFkb25seSA/ICdyZWFkb25seScgOiBudWxsXCJcbiAgICAgICAgW2Rpc2FibGVkXT1cImNvbnRyb2xEaXNhYmxlZCB8fCBvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgIFtpZF09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWRcIlxuICAgICAgICBbbWF4XT1cIm9wdGlvbnM/Lm1heGltdW1cIlxuICAgICAgICBbbWF0RGF0ZXBpY2tlcl09XCJwaWNrZXJcIlxuICAgICAgICBbbWluXT1cIm9wdGlvbnM/Lm1pbmltdW1cIlxuICAgICAgICBbbmFtZV09XCJjb250cm9sTmFtZVwiXG4gICAgICAgIFtwbGFjZWhvbGRlcl09XCJvcHRpb25zPy50aXRsZVwiXG4gICAgICAgIFtyZXF1aXJlZF09XCJvcHRpb25zPy5yZXF1aXJlZFwiXG4gICAgICAgIFtzdHlsZS53aWR0aF09XCInMTAwJSdcIlxuICAgICAgICBbdmFsdWVdPVwiZGF0ZVZhbHVlXCJcbiAgICAgICAgKGJsdXIpPVwib3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZVwiXG4gICAgICAgIChjaGFuZ2UpPVwidXBkYXRlVmFsdWUoJGV2ZW50KVwiXG4gICAgICAgIChpbnB1dCk9XCJ1cGRhdGVWYWx1ZSgkZXZlbnQpXCI+XG4gICAgICA8c3BhbiBtYXRTdWZmaXggKm5nSWY9XCJvcHRpb25zPy5zdWZmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvblJpZ2h0XCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5zdWZmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvblJpZ2h0XCI+PC9zcGFuPlxuICAgICAgPG1hdC1oaW50ICpuZ0lmPVwib3B0aW9ucz8uZGVzY3JpcHRpb24gJiYgKCFvcHRpb25zPy5zaG93RXJyb3JzIHx8ICFvcHRpb25zPy5lcnJvck1lc3NhZ2UpXCJcbiAgICAgICAgYWxpZ249XCJlbmRcIiBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCI+PC9tYXQtaGludD5cbiAgICAgIDxtYXQtZGF0ZXBpY2tlci10b2dnbGUgbWF0U3VmZml4IFtmb3JdPVwicGlja2VyXCI+PC9tYXQtZGF0ZXBpY2tlci10b2dnbGU+XG4gICAgPC9tYXQtZm9ybS1maWVsZD5cbiAgICA8bWF0LWRhdGVwaWNrZXIgI3BpY2tlclxuICAgICAgKHNlbGVjdGVkQ2hhbmdlZCk9XCJ1cGRhdGVWYWx1ZSgkZXZlbnQpXCI+PC9tYXQtZGF0ZXBpY2tlcj5cbiAgICA8bWF0LWVycm9yICpuZ0lmPVwib3B0aW9ucz8uc2hvd0Vycm9ycyAmJiBvcHRpb25zPy5lcnJvck1lc3NhZ2VcIlxuICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5lcnJvck1lc3NhZ2VcIj48L21hdC1lcnJvcj5gLFxuICBzdHlsZXM6IFtgXG4gICAgbWF0LWVycm9yIHsgZm9udC1zaXplOiA3NSU7IG1hcmdpbi10b3A6IC0xcmVtOyBtYXJnaW4tYm90dG9tOiAwLjVyZW07IH1cbiAgICA6Om5nLWRlZXAgbWF0LWZvcm0tZmllbGQgLm1hdC1mb3JtLWZpZWxkLXdyYXBwZXIgLm1hdC1mb3JtLWZpZWxkLWZsZXhcbiAgICAgIC5tYXQtZm9ybS1maWVsZC1pbmZpeCB7IHdpZHRoOiBpbml0aWFsOyB9XG4gIGBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbERhdGVwaWNrZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcyB7XG4gIGZvcm1Db250cm9sOiBBYnN0cmFjdENvbnRyb2w7XG4gIGNvbnRyb2xOYW1lOiBzdHJpbmc7XG4gIGNvbnRyb2xWYWx1ZTogYW55O1xuICBkYXRlVmFsdWU6IGFueTtcbiAgY29udHJvbERpc2FibGVkID0gZmFsc2U7XG4gIGJvdW5kQ29udHJvbCA9IGZhbHNlO1xuICBvcHRpb25zOiBhbnk7XG4gIGF1dG9Db21wbGV0ZUxpc3Q6IHN0cmluZ1tdID0gW107XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmpzZi5pbml0aWFsaXplQ29udHJvbCh0aGlzLCAhdGhpcy5vcHRpb25zLnJlYWRvbmx5KTtcbiAgICB0aGlzLnNldENvbnRyb2xEYXRlKHRoaXMuY29udHJvbFZhbHVlKTtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5ub3RpdGxlICYmICF0aGlzLm9wdGlvbnMuZGVzY3JpcHRpb24gJiYgdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZGVzY3JpcHRpb24gPSB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXI7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy5zZXRDb250cm9sRGF0ZSh0aGlzLmNvbnRyb2xWYWx1ZSk7XG4gIH1cblxuICBzZXRDb250cm9sRGF0ZShkYXRlU3RyaW5nOiBzdHJpbmcpIHtcbiAgICB0aGlzLmRhdGVWYWx1ZSA9IHN0cmluZ1RvRGF0ZShkYXRlU3RyaW5nKTtcbiAgfVxuXG4gIHVwZGF0ZVZhbHVlKGV2ZW50KSB7XG4gICAgdGhpcy5vcHRpb25zLnNob3dFcnJvcnMgPSB0cnVlO1xuICAgIHRoaXMuanNmLnVwZGF0ZVZhbHVlKHRoaXMsIGRhdGVUb1N0cmluZyhldmVudCwgdGhpcy5vcHRpb25zKSk7XG4gIH1cbn1cbiJdfQ==