import * as tslib_1 from "tslib";
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
var SectionComponent = /** @class */ (function () {
    function SectionComponent(jsf) {
        this.jsf = jsf;
        this.expanded = true;
    }
    Object.defineProperty(SectionComponent.prototype, "sectionTitle", {
        get: function () {
            return this.options.notitle ? null : this.jsf.setItemTitle(this);
        },
        enumerable: true,
        configurable: true
    });
    SectionComponent.prototype.ngOnInit = function () {
        this.jsf.initializeControl(this);
        this.options = this.layoutNode.options || {};
        this.expanded = typeof this.options.expanded === 'boolean' ?
            this.options.expanded : !this.options.expandable;
        switch (this.layoutNode.type) {
            case 'fieldset':
            case 'array':
            case 'tab':
            case 'advancedfieldset':
            case 'authfieldset':
            case 'optionfieldset':
            case 'selectfieldset':
                this.containerType = 'fieldset';
                break;
            default:// 'div', 'flex', 'section', 'conditional', 'actions', 'tagsinput'
                this.containerType = 'div';
                break;
        }
    };
    SectionComponent.prototype.toggleExpanded = function () {
        if (this.options.expandable) {
            this.expanded = !this.expanded;
        }
    };
    // Set attributes for flexbox container
    // (child attributes are set in root.component)
    SectionComponent.prototype.getFlexAttribute = function (attribute) {
        var flexActive = this.layoutNode.type === 'flex' ||
            !!this.options.displayFlex ||
            this.options.display === 'flex';
        if (attribute !== 'flex' && !flexActive) {
            return null;
        }
        switch (attribute) {
            case 'is-flex':
                return flexActive;
            case 'display':
                return flexActive ? 'flex' : 'initial';
            case 'flex-direction':
            case 'flex-wrap':
                var index = ['flex-direction', 'flex-wrap'].indexOf(attribute);
                return (this.options['flex-flow'] || '').split(/\s+/)[index] ||
                    this.options[attribute] || ['column', 'nowrap'][index];
            case 'justify-content':
            case 'align-items':
            case 'align-content':
                return this.options[attribute];
        }
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], SectionComponent.prototype, "layoutNode", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], SectionComponent.prototype, "layoutIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], SectionComponent.prototype, "dataIndex", void 0);
    SectionComponent = tslib_1.__decorate([
        Component({
            selector: 'section-widget',
            template: "\n    <div *ngIf=\"containerType === 'div'\"\n      [class]=\"options?.htmlClass || ''\"\n      [class.expandable]=\"options?.expandable && !expanded\"\n      [class.expanded]=\"options?.expandable && expanded\">\n      <label *ngIf=\"sectionTitle\"\n        class=\"legend\"\n        [class]=\"options?.labelHtmlClass || ''\"\n        [innerHTML]=\"sectionTitle\"\n        (click)=\"toggleExpanded()\"></label>\n      <root-widget *ngIf=\"expanded\"\n        [dataIndex]=\"dataIndex\"\n        [layout]=\"layoutNode.items\"\n        [layoutIndex]=\"layoutIndex\"\n        [isFlexItem]=\"getFlexAttribute('is-flex')\"\n        [isOrderable]=\"options?.orderable\"\n        [class.form-flex-column]=\"getFlexAttribute('flex-direction') === 'column'\"\n        [class.form-flex-row]=\"getFlexAttribute('flex-direction') === 'row'\"\n        [style.align-content]=\"getFlexAttribute('align-content')\"\n        [style.align-items]=\"getFlexAttribute('align-items')\"\n        [style.display]=\"getFlexAttribute('display')\"\n        [style.flex-direction]=\"getFlexAttribute('flex-direction')\"\n        [style.flex-wrap]=\"getFlexAttribute('flex-wrap')\"\n        [style.justify-content]=\"getFlexAttribute('justify-content')\"></root-widget>\n    </div>\n    <fieldset *ngIf=\"containerType === 'fieldset'\"\n      [class]=\"options?.htmlClass || ''\"\n      [class.expandable]=\"options?.expandable && !expanded\"\n      [class.expanded]=\"options?.expandable && expanded\"\n      [disabled]=\"options?.readonly\">\n      <legend *ngIf=\"sectionTitle\"\n        class=\"legend\"\n        [class]=\"options?.labelHtmlClass || ''\"\n        [innerHTML]=\"sectionTitle\"\n        (click)=\"toggleExpanded()\"></legend>\n      <div *ngIf=\"options?.messageLocation !== 'bottom'\">\n        <p *ngIf=\"options?.description\"\n        class=\"help-block\"\n        [class]=\"options?.labelHelpBlockClass || ''\"\n        [innerHTML]=\"options?.description\"></p>\n      </div>\n      <root-widget *ngIf=\"expanded\"\n        [dataIndex]=\"dataIndex\"\n        [layout]=\"layoutNode.items\"\n        [layoutIndex]=\"layoutIndex\"\n        [isFlexItem]=\"getFlexAttribute('is-flex')\"\n        [isOrderable]=\"options?.orderable\"\n        [class.form-flex-column]=\"getFlexAttribute('flex-direction') === 'column'\"\n        [class.form-flex-row]=\"getFlexAttribute('flex-direction') === 'row'\"\n        [style.align-content]=\"getFlexAttribute('align-content')\"\n        [style.align-items]=\"getFlexAttribute('align-items')\"\n        [style.display]=\"getFlexAttribute('display')\"\n        [style.flex-direction]=\"getFlexAttribute('flex-direction')\"\n        [style.flex-wrap]=\"getFlexAttribute('flex-wrap')\"\n        [style.justify-content]=\"getFlexAttribute('justify-content')\"></root-widget>\n      <div *ngIf=\"options?.messageLocation === 'bottom'\">\n        <p *ngIf=\"options?.description\"\n        class=\"help-block\"\n        [class]=\"options?.labelHelpBlockClass || ''\"\n        [innerHTML]=\"options?.description\"></p>\n      </div>\n    </fieldset>",
            styles: ["\n    .legend { font-weight: bold; }\n    .expandable > legend:before, .expandable > label:before  { content: '\u25B6'; padding-right: .3em; }\n    .expanded > legend:before, .expanded > label:before  { content: '\u25BC'; padding-right: .2em; }\n  "],
        }),
        tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
    ], SectionComponent);
    return SectionComponent;
}());
export { SectionComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL3dpZGdldC1saWJyYXJ5L3NlY3Rpb24uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUd6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQXdFcEU7SUFRRSwwQkFDVSxHQUEwQjtRQUExQixRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQVBwQyxhQUFRLEdBQUcsSUFBSSxDQUFDO0lBUVosQ0FBQztJQUVMLHNCQUFJLDBDQUFZO2FBQWhCO1lBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25FLENBQUM7OztPQUFBO0lBRUQsbUNBQVEsR0FBUjtRQUNFLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3QixLQUFLLFVBQVUsQ0FBQztZQUFDLEtBQUssT0FBTyxDQUFDO1lBQUMsS0FBSyxLQUFLLENBQUM7WUFBQyxLQUFLLGtCQUFrQixDQUFDO1lBQ25FLEtBQUssY0FBYyxDQUFDO1lBQUMsS0FBSyxnQkFBZ0IsQ0FBQztZQUFDLEtBQUssZ0JBQWdCO2dCQUMvRCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztnQkFDbEMsS0FBSyxDQUFDO1lBQ04sUUFBUyxrRUFBa0U7Z0JBQ3pFLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO2dCQUM3QixLQUFLLENBQUM7UUFDUixDQUFDO0lBQ0gsQ0FBQztJQUVELHlDQUFjLEdBQWQ7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELHVDQUF1QztJQUN2QywrQ0FBK0M7SUFDL0MsMkNBQWdCLEdBQWhCLFVBQWlCLFNBQWlCO1FBQ2hDLElBQU0sVUFBVSxHQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLE1BQU07WUFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVztZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssU0FBUztnQkFDWixNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ3BCLEtBQUssU0FBUztnQkFDWixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN6QyxLQUFLLGdCQUFnQixDQUFDO1lBQUMsS0FBSyxXQUFXO2dCQUNyQyxJQUFNLEtBQUssR0FBRyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNELEtBQUssaUJBQWlCLENBQUM7WUFBQyxLQUFLLGFBQWEsQ0FBQztZQUFDLEtBQUssZUFBZTtnQkFDOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNILENBQUM7SUFwRFE7UUFBUixLQUFLLEVBQUU7O3dEQUFpQjtJQUNoQjtRQUFSLEtBQUssRUFBRTs7eURBQXVCO0lBQ3RCO1FBQVIsS0FBSyxFQUFFOzt1REFBcUI7SUFObEIsZ0JBQWdCO1FBdEU1QixTQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFFBQVEsRUFBRSxpZ0dBNkRJO1lBQ2QsTUFBTSxFQUFFLENBQUMsMFBBSVIsQ0FBQztTQUNILENBQUM7aURBVWUscUJBQXFCO09BVHpCLGdCQUFnQixDQXlENUI7SUFBRCx1QkFBQztDQUFBLEFBekRELElBeURDO1NBekRZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyB0b1RpdGxlQ2FzZSB9IGZyb20gJy4uL3NoYXJlZCc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdzZWN0aW9uLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAqbmdJZj1cImNvbnRhaW5lclR5cGUgPT09ICdkaXYnXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIlxuICAgICAgW2NsYXNzLmV4cGFuZGFibGVdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiAhZXhwYW5kZWRcIlxuICAgICAgW2NsYXNzLmV4cGFuZGVkXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgZXhwYW5kZWRcIj5cbiAgICAgIDxsYWJlbCAqbmdJZj1cInNlY3Rpb25UaXRsZVwiXG4gICAgICAgIGNsYXNzPVwibGVnZW5kXCJcbiAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmxhYmVsSHRtbENsYXNzIHx8ICcnXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICAoY2xpY2spPVwidG9nZ2xlRXhwYW5kZWQoKVwiPjwvbGFiZWw+XG4gICAgICA8cm9vdC13aWRnZXQgKm5nSWY9XCJleHBhbmRlZFwiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwiZGF0YUluZGV4XCJcbiAgICAgICAgW2xheW91dF09XCJsYXlvdXROb2RlLml0ZW1zXCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCJcbiAgICAgICAgW2lzRmxleEl0ZW1dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnaXMtZmxleCcpXCJcbiAgICAgICAgW2lzT3JkZXJhYmxlXT1cIm9wdGlvbnM/Lm9yZGVyYWJsZVwiXG4gICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtY29sdW1uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdjb2x1bW4nXCJcbiAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1yb3ddPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ3JvdydcIlxuICAgICAgICBbc3R5bGUuYWxpZ24tY29udGVudF09XCJnZXRGbGV4QXR0cmlidXRlKCdhbGlnbi1jb250ZW50JylcIlxuICAgICAgICBbc3R5bGUuYWxpZ24taXRlbXNdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24taXRlbXMnKVwiXG4gICAgICAgIFtzdHlsZS5kaXNwbGF5XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2Rpc3BsYXknKVwiXG4gICAgICAgIFtzdHlsZS5mbGV4LWRpcmVjdGlvbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpXCJcbiAgICAgICAgW3N0eWxlLmZsZXgtd3JhcF09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LXdyYXAnKVwiXG4gICAgICAgIFtzdHlsZS5qdXN0aWZ5LWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnanVzdGlmeS1jb250ZW50JylcIj48L3Jvb3Qtd2lkZ2V0PlxuICAgIDwvZGl2PlxuICAgIDxmaWVsZHNldCAqbmdJZj1cImNvbnRhaW5lclR5cGUgPT09ICdmaWVsZHNldCdcIlxuICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICBbY2xhc3MuZXhwYW5kYWJsZV09XCJvcHRpb25zPy5leHBhbmRhYmxlICYmICFleHBhbmRlZFwiXG4gICAgICBbY2xhc3MuZXhwYW5kZWRdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiBleHBhbmRlZFwiXG4gICAgICBbZGlzYWJsZWRdPVwib3B0aW9ucz8ucmVhZG9ubHlcIj5cbiAgICAgIDxsZWdlbmQgKm5nSWY9XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICBjbGFzcz1cImxlZ2VuZFwiXG4gICAgICAgIFtjbGFzc109XCJvcHRpb25zPy5sYWJlbEh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICAgIFtpbm5lckhUTUxdPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgKGNsaWNrKT1cInRvZ2dsZUV4cGFuZGVkKClcIj48L2xlZ2VuZD5cbiAgICAgIDxkaXYgKm5nSWY9XCJvcHRpb25zPy5tZXNzYWdlTG9jYXRpb24gIT09ICdib3R0b20nXCI+XG4gICAgICAgIDxwICpuZ0lmPVwib3B0aW9ucz8uZGVzY3JpcHRpb25cIlxuICAgICAgICBjbGFzcz1cImhlbHAtYmxvY2tcIlxuICAgICAgICBbY2xhc3NdPVwib3B0aW9ucz8ubGFiZWxIZWxwQmxvY2tDbGFzcyB8fCAnJ1wiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZGVzY3JpcHRpb25cIj48L3A+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxyb290LXdpZGdldCAqbmdJZj1cImV4cGFuZGVkXCJcbiAgICAgICAgW2RhdGFJbmRleF09XCJkYXRhSW5kZXhcIlxuICAgICAgICBbbGF5b3V0XT1cImxheW91dE5vZGUuaXRlbXNcIlxuICAgICAgICBbbGF5b3V0SW5kZXhdPVwibGF5b3V0SW5kZXhcIlxuICAgICAgICBbaXNGbGV4SXRlbV09XCJnZXRGbGV4QXR0cmlidXRlKCdpcy1mbGV4JylcIlxuICAgICAgICBbaXNPcmRlcmFibGVdPVwib3B0aW9ucz8ub3JkZXJhYmxlXCJcbiAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1jb2x1bW5dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ2NvbHVtbidcIlxuICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LXJvd109XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAncm93J1wiXG4gICAgICAgIFtzdHlsZS5hbGlnbi1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWNvbnRlbnQnKVwiXG4gICAgICAgIFtzdHlsZS5hbGlnbi1pdGVtc109XCJnZXRGbGV4QXR0cmlidXRlKCdhbGlnbi1pdGVtcycpXCJcbiAgICAgICAgW3N0eWxlLmRpc3BsYXldPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZGlzcGxheScpXCJcbiAgICAgICAgW3N0eWxlLmZsZXgtZGlyZWN0aW9uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJylcIlxuICAgICAgICBbc3R5bGUuZmxleC13cmFwXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtd3JhcCcpXCJcbiAgICAgICAgW3N0eWxlLmp1c3RpZnktY29udGVudF09XCJnZXRGbGV4QXR0cmlidXRlKCdqdXN0aWZ5LWNvbnRlbnQnKVwiPjwvcm9vdC13aWRnZXQ+XG4gICAgICA8ZGl2ICpuZ0lmPVwib3B0aW9ucz8ubWVzc2FnZUxvY2F0aW9uID09PSAnYm90dG9tJ1wiPlxuICAgICAgICA8cCAqbmdJZj1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCJcbiAgICAgICAgY2xhc3M9XCJoZWxwLWJsb2NrXCJcbiAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmxhYmVsSGVscEJsb2NrQ2xhc3MgfHwgJydcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCI+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgPC9maWVsZHNldD5gLFxuICBzdHlsZXM6IFtgXG4gICAgLmxlZ2VuZCB7IGZvbnQtd2VpZ2h0OiBib2xkOyB9XG4gICAgLmV4cGFuZGFibGUgPiBsZWdlbmQ6YmVmb3JlLCAuZXhwYW5kYWJsZSA+IGxhYmVsOmJlZm9yZSAgeyBjb250ZW50OiAn4pa2JzsgcGFkZGluZy1yaWdodDogLjNlbTsgfVxuICAgIC5leHBhbmRlZCA+IGxlZ2VuZDpiZWZvcmUsIC5leHBhbmRlZCA+IGxhYmVsOmJlZm9yZSAgeyBjb250ZW50OiAn4pa8JzsgcGFkZGluZy1yaWdodDogLjJlbTsgfVxuICBgXSxcbn0pXG5leHBvcnQgY2xhc3MgU2VjdGlvbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIG9wdGlvbnM6IGFueTtcbiAgZXhwYW5kZWQgPSB0cnVlO1xuICBjb250YWluZXJUeXBlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBnZXQgc2VjdGlvblRpdGxlKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubm90aXRsZSA/IG51bGwgOiB0aGlzLmpzZi5zZXRJdGVtVGl0bGUodGhpcyk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLmpzZi5pbml0aWFsaXplQ29udHJvbCh0aGlzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLmxheW91dE5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmV4cGFuZGVkID0gdHlwZW9mIHRoaXMub3B0aW9ucy5leHBhbmRlZCA9PT0gJ2Jvb2xlYW4nID9cbiAgICAgIHRoaXMub3B0aW9ucy5leHBhbmRlZCA6ICF0aGlzLm9wdGlvbnMuZXhwYW5kYWJsZTtcbiAgICBzd2l0Y2ggKHRoaXMubGF5b3V0Tm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdmaWVsZHNldCc6IGNhc2UgJ2FycmF5JzogY2FzZSAndGFiJzogY2FzZSAnYWR2YW5jZWRmaWVsZHNldCc6XG4gICAgICBjYXNlICdhdXRoZmllbGRzZXQnOiBjYXNlICdvcHRpb25maWVsZHNldCc6IGNhc2UgJ3NlbGVjdGZpZWxkc2V0JzpcbiAgICAgICAgdGhpcy5jb250YWluZXJUeXBlID0gJ2ZpZWxkc2V0JztcbiAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gJ2RpdicsICdmbGV4JywgJ3NlY3Rpb24nLCAnY29uZGl0aW9uYWwnLCAnYWN0aW9ucycsICd0YWdzaW5wdXQnXG4gICAgICAgIHRoaXMuY29udGFpbmVyVHlwZSA9ICdkaXYnO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlRXhwYW5kZWQoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5leHBhbmRhYmxlKSB7IHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDsgfVxuICB9XG5cbiAgLy8gU2V0IGF0dHJpYnV0ZXMgZm9yIGZsZXhib3ggY29udGFpbmVyXG4gIC8vIChjaGlsZCBhdHRyaWJ1dGVzIGFyZSBzZXQgaW4gcm9vdC5jb21wb25lbnQpXG4gIGdldEZsZXhBdHRyaWJ1dGUoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmbGV4QWN0aXZlOiBib29sZWFuID1cbiAgICAgIHRoaXMubGF5b3V0Tm9kZS50eXBlID09PSAnZmxleCcgfHxcbiAgICAgICEhdGhpcy5vcHRpb25zLmRpc3BsYXlGbGV4IHx8XG4gICAgICB0aGlzLm9wdGlvbnMuZGlzcGxheSA9PT0gJ2ZsZXgnO1xuICAgIGlmIChhdHRyaWJ1dGUgIT09ICdmbGV4JyAmJiAhZmxleEFjdGl2ZSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgICBjYXNlICdpcy1mbGV4JzpcbiAgICAgICAgcmV0dXJuIGZsZXhBY3RpdmU7XG4gICAgICBjYXNlICdkaXNwbGF5JzpcbiAgICAgICAgcmV0dXJuIGZsZXhBY3RpdmUgPyAnZmxleCcgOiAnaW5pdGlhbCc7XG4gICAgICBjYXNlICdmbGV4LWRpcmVjdGlvbic6IGNhc2UgJ2ZsZXgtd3JhcCc6XG4gICAgICAgIGNvbnN0IGluZGV4ID0gWydmbGV4LWRpcmVjdGlvbicsICdmbGV4LXdyYXAnXS5pbmRleE9mKGF0dHJpYnV0ZSk7XG4gICAgICAgIHJldHVybiAodGhpcy5vcHRpb25zWydmbGV4LWZsb3cnXSB8fCAnJykuc3BsaXQoL1xccysvKVtpbmRleF0gfHxcbiAgICAgICAgICB0aGlzLm9wdGlvbnNbYXR0cmlidXRlXSB8fCBbJ2NvbHVtbicsICdub3dyYXAnXVtpbmRleF07XG4gICAgICBjYXNlICdqdXN0aWZ5LWNvbnRlbnQnOiBjYXNlICdhbGlnbi1pdGVtcyc6IGNhc2UgJ2FsaWduLWNvbnRlbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2F0dHJpYnV0ZV07XG4gICAgfVxuICB9XG59XG4iXX0=