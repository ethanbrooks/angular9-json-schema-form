import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
var MaterialAddReferenceComponent = /** @class */ (function () {
    function MaterialAddReferenceComponent(jsf) {
        this.jsf = jsf;
    }
    MaterialAddReferenceComponent.prototype.ngOnInit = function () {
        this.options = this.layoutNode.options || {};
    };
    Object.defineProperty(MaterialAddReferenceComponent.prototype, "showAddButton", {
        get: function () {
            return !this.layoutNode.arrayItem ||
                this.layoutIndex[this.layoutIndex.length - 1] < this.options.maxItems;
        },
        enumerable: true,
        configurable: true
    });
    MaterialAddReferenceComponent.prototype.addItem = function (event) {
        event.preventDefault();
        this.jsf.addItem(this);
    };
    Object.defineProperty(MaterialAddReferenceComponent.prototype, "buttonText", {
        get: function () {
            var parent = {
                dataIndex: this.dataIndex.slice(0, -1),
                layoutIndex: this.layoutIndex.slice(0, -1),
                layoutNode: this.jsf.getParentNode(this),
            };
            return parent.layoutNode.add ||
                this.jsf.setArrayItemTitle(parent, this.layoutNode, this.itemCount);
        },
        enumerable: true,
        configurable: true
    });
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], MaterialAddReferenceComponent.prototype, "layoutNode", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], MaterialAddReferenceComponent.prototype, "layoutIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], MaterialAddReferenceComponent.prototype, "dataIndex", void 0);
    MaterialAddReferenceComponent = tslib_1.__decorate([
        Component({
            selector: 'material-add-reference-widget',
            template: "\n    <section [class]=\"options?.htmlClass || ''\" align=\"end\">\n      <button mat-raised-button *ngIf=\"showAddButton\"\n        [color]=\"options?.color || 'accent'\"\n        [disabled]=\"options?.readonly\"\n        (click)=\"addItem($event)\">\n        <span *ngIf=\"options?.icon\" [class]=\"options?.icon\"></span>\n        <span *ngIf=\"options?.title\" [innerHTML]=\"buttonText\"></span>\n      </button>\n    </section>",
            changeDetection: ChangeDetectionStrategy.Default,
        }),
        tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
    ], MaterialAddReferenceComponent);
    return MaterialAddReferenceComponent;
}());
export { MaterialAddReferenceComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2ZyYW1ld29yay1saWJyYXJ5L21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsvbWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBR2xGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBZ0J2RTtJQVNFLHVDQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO0lBQ2hDLENBQUM7SUFFTCxnREFBUSxHQUFSO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELHNCQUFJLHdEQUFhO2FBQWpCO1lBQ0UsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTO2dCQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQzFFLENBQUM7OztPQUFBO0lBRUQsK0NBQU8sR0FBUCxVQUFRLEtBQUs7UUFDWCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELHNCQUFJLHFEQUFVO2FBQWQ7WUFDRSxJQUFNLE1BQU0sR0FBUTtnQkFDbEIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQzthQUN6QyxDQUFDO1lBQ0YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRztnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEUsQ0FBQzs7O09BQUE7SUE5QlE7UUFBUixLQUFLLEVBQUU7O3FFQUFpQjtJQUNoQjtRQUFSLEtBQUssRUFBRTs7c0VBQXVCO0lBQ3RCO1FBQVIsS0FBSyxFQUFFOztvRUFBcUI7SUFQbEIsNkJBQTZCO1FBZHpDLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSwrQkFBK0I7WUFDekMsUUFBUSxFQUFFLGtiQVNHO1lBQ2IsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87U0FDakQsQ0FBQztpREFXZSxxQkFBcUI7T0FWekIsNkJBQTZCLENBb0N6QztJQUFELG9DQUFDO0NBQUEsQUFwQ0QsSUFvQ0M7U0FwQ1ksNkJBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybUdyb3VwIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuLi8uLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXRlcmlhbC1hZGQtcmVmZXJlbmNlLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHNlY3Rpb24gW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiIGFsaWduPVwiZW5kXCI+XG4gICAgICA8YnV0dG9uIG1hdC1yYWlzZWQtYnV0dG9uICpuZ0lmPVwic2hvd0FkZEJ1dHRvblwiXG4gICAgICAgIFtjb2xvcl09XCJvcHRpb25zPy5jb2xvciB8fCAnYWNjZW50J1wiXG4gICAgICAgIFtkaXNhYmxlZF09XCJvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgIChjbGljayk9XCJhZGRJdGVtKCRldmVudClcIj5cbiAgICAgICAgPHNwYW4gKm5nSWY9XCJvcHRpb25zPy5pY29uXCIgW2NsYXNzXT1cIm9wdGlvbnM/Lmljb25cIj48L3NwYW4+XG4gICAgICAgIDxzcGFuICpuZ0lmPVwib3B0aW9ucz8udGl0bGVcIiBbaW5uZXJIVE1MXT1cImJ1dHRvblRleHRcIj48L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L3NlY3Rpb24+YCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIG9wdGlvbnM6IGFueTtcbiAgaXRlbUNvdW50OiBudW1iZXI7XG4gIHByZXZpb3VzTGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBwcmV2aW91c0RhdGFJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgfVxuXG4gIGdldCBzaG93QWRkQnV0dG9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5sYXlvdXROb2RlLmFycmF5SXRlbSB8fFxuICAgICAgdGhpcy5sYXlvdXRJbmRleFt0aGlzLmxheW91dEluZGV4Lmxlbmd0aCAtIDFdIDwgdGhpcy5vcHRpb25zLm1heEl0ZW1zO1xuICB9XG5cbiAgYWRkSXRlbShldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5qc2YuYWRkSXRlbSh0aGlzKTtcbiAgfVxuXG4gIGdldCBidXR0b25UZXh0KCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyZW50OiBhbnkgPSB7XG4gICAgICBkYXRhSW5kZXg6IHRoaXMuZGF0YUluZGV4LnNsaWNlKDAsIC0xKSxcbiAgICAgIGxheW91dEluZGV4OiB0aGlzLmxheW91dEluZGV4LnNsaWNlKDAsIC0xKSxcbiAgICAgIGxheW91dE5vZGU6IHRoaXMuanNmLmdldFBhcmVudE5vZGUodGhpcyksXG4gICAgfTtcbiAgICByZXR1cm4gcGFyZW50LmxheW91dE5vZGUuYWRkIHx8XG4gICAgICB0aGlzLmpzZi5zZXRBcnJheUl0ZW1UaXRsZShwYXJlbnQsIHRoaXMubGF5b3V0Tm9kZSwgdGhpcy5pdGVtQ291bnQpO1xuICB9XG59XG4iXX0=