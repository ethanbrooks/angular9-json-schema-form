import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';
import { FrameworkLibraryService } from './framework-library/framework-library.service';
import { WidgetLibraryService } from './widget-library/widget-library.service';
import { JsonSchemaFormService } from './json-schema-form.service';
import { convertSchemaToDraft6 } from './shared/convert-schema-to-draft6.function';
import { resolveSchemaReferences } from './shared/json-schema.functions';
import { hasValue, inArray, isArray, isEmpty, isObject } from './shared/validator.functions';
import { forEach, hasOwn } from './shared/utility.functions';
import { JsonPointer } from './shared/jsonpointer.functions';
export var JSON_SCHEMA_FORM_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return JsonSchemaFormComponent; }),
    multi: true,
};
/**
 * @module 'JsonSchemaFormComponent' - Angular JSON Schema Form
 *
 * Root module of the Angular JSON Schema Form client-side library,
 * an Angular library which generates an HTML form from a JSON schema
 * structured data model and/or a JSON Schema Form layout description.
 *
 * This library also validates input data by the user, using both validators on
 * individual controls to provide real-time feedback while the user is filling
 * out the form, and then validating the entire input against the schema when
 * the form is submitted to make sure the returned JSON data object is valid.
 *
 * This library is similar to, and mostly API compatible with:
 *
 * - JSON Schema Form's Angular Schema Form library for AngularJs
 *   http://schemaform.io
 *   http://schemaform.io/examples/bootstrap-example.html (examples)
 *
 * - Mozilla's react-jsonschema-form library for React
 *   https://github.com/mozilla-services/react-jsonschema-form
 *   https://mozilla-services.github.io/react-jsonschema-form (examples)
 *
 * - Joshfire's JSON Form library for jQuery
 *   https://github.com/joshfire/jsonform
 *   http://ulion.github.io/jsonform/playground (examples)
 *
 * This library depends on:
 *  - Angular (obviously)                  https://angular.io
 *  - lodash, JavaScript utility library   https://github.com/lodash/lodash
 *  - ajv, Another JSON Schema validator   https://github.com/epoberezkin/ajv
 *
 * In addition, the Example Playground also depends on:
 *  - brace, Browserified Ace editor       http://thlorenz.github.io/brace
 */
var JsonSchemaFormComponent = /** @class */ (function () {
    function JsonSchemaFormComponent(changeDetector, frameworkLibrary, widgetLibrary, jsf, sanitizer) {
        this.changeDetector = changeDetector;
        this.frameworkLibrary = frameworkLibrary;
        this.widgetLibrary = widgetLibrary;
        this.jsf = jsf;
        this.sanitizer = sanitizer;
        this.formValueSubscription = null;
        this.formInitialized = false;
        this.objectWrap = false; // Is non-object input schema wrapped in an object?
        this.previousInputs = {
            schema: null, layout: null, data: null, options: null, framework: null,
            widgets: null, form: null, model: null, JSONSchema: null, UISchema: null,
            formData: null, loadExternalAssets: null, debug: null,
        };
        // Outputs
        this.onChanges = new EventEmitter(); // Live unvalidated internal form data
        this.onSubmit = new EventEmitter(); // Complete validated form data
        this.isValid = new EventEmitter(); // Is current data valid?
        this.validationErrors = new EventEmitter(); // Validation errors (if any)
        this.formSchema = new EventEmitter(); // Final schema used to create form
        this.formLayout = new EventEmitter(); // Final layout used to create form
        // Outputs for possible 2-way data binding
        // Only the one input providing the initial form data will be bound.
        // If there is no inital data, input '{}' to activate 2-way data binding.
        // There is no 2-way binding if inital data is combined inside the 'form' input.
        this.dataChange = new EventEmitter();
        this.modelChange = new EventEmitter();
        this.formDataChange = new EventEmitter();
        this.ngModelChange = new EventEmitter();
    }
    Object.defineProperty(JsonSchemaFormComponent.prototype, "value", {
        get: function () {
            return this.objectWrap ? this.jsf.data['1'] : this.jsf.data;
        },
        set: function (value) {
            this.setFormValues(value, false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JsonSchemaFormComponent.prototype, "stylesheets", {
        get: function () {
            var stylesheets = this.frameworkLibrary.getFrameworkStylesheets();
            var load = this.sanitizer.bypassSecurityTrustResourceUrl;
            return stylesheets.map(function (stylesheet) { return load(stylesheet); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JsonSchemaFormComponent.prototype, "scripts", {
        get: function () {
            var scripts = this.frameworkLibrary.getFrameworkScripts();
            var load = this.sanitizer.bypassSecurityTrustResourceUrl;
            return scripts.map(function (script) { return load(script); });
        },
        enumerable: true,
        configurable: true
    });
    JsonSchemaFormComponent.prototype.ngOnInit = function () {
        this.updateForm();
    };
    JsonSchemaFormComponent.prototype.ngOnChanges = function () {
        this.updateForm();
    };
    JsonSchemaFormComponent.prototype.writeValue = function (value) {
        this.setFormValues(value, false);
        if (!this.formValuesInput) {
            this.formValuesInput = 'ngModel';
        }
    };
    JsonSchemaFormComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    JsonSchemaFormComponent.prototype.registerOnTouched = function (fn) {
        this.onTouched = fn;
    };
    JsonSchemaFormComponent.prototype.setDisabledState = function (isDisabled) {
        if (this.jsf.formOptions.formDisabled !== !!isDisabled) {
            this.jsf.formOptions.formDisabled = !!isDisabled;
            this.initializeForm();
        }
    };
    JsonSchemaFormComponent.prototype.updateForm = function () {
        var _this = this;
        if (!this.formInitialized || !this.formValuesInput ||
            (this.language && this.language !== this.jsf.language)) {
            this.initializeForm();
        }
        else {
            if (this.language && this.language !== this.jsf.language) {
                this.jsf.setLanguage(this.language);
            }
            // Get names of changed inputs
            var changedInput = Object.keys(this.previousInputs)
                .filter(function (input) { return _this.previousInputs[input] !== _this[input]; });
            var resetFirst = true;
            if (changedInput.length === 1 && changedInput[0] === 'form' &&
                this.formValuesInput.startsWith('form.')) {
                // If only 'form' input changed, get names of changed keys
                changedInput = Object.keys(this.previousInputs.form || {})
                    .filter(function (key) { return !_.isEqual(_this.previousInputs.form[key], _this.form[key]); })
                    .map(function (key) { return "form." + key; });
                resetFirst = false;
            }
            // If only input values have changed, update the form values
            if (changedInput.length === 1 && changedInput[0] === this.formValuesInput) {
                if (this.formValuesInput.indexOf('.') === -1) {
                    this.setFormValues(this[this.formValuesInput], resetFirst);
                }
                else {
                    var _a = tslib_1.__read(this.formValuesInput.split('.'), 2), input = _a[0], key = _a[1];
                    this.setFormValues(this[input][key], resetFirst);
                }
                // If anything else has changed, re-render the entire form
            }
            else if (changedInput.length) {
                this.initializeForm();
                if (this.onChange) {
                    this.onChange(this.jsf.formValues);
                }
                if (this.onTouched) {
                    this.onTouched(this.jsf.formValues);
                }
            }
            // Update previous inputs
            Object.keys(this.previousInputs)
                .filter(function (input) { return _this.previousInputs[input] !== _this[input]; })
                .forEach(function (input) { return _this.previousInputs[input] = _this[input]; });
        }
    };
    JsonSchemaFormComponent.prototype.setFormValues = function (formValues, resetFirst) {
        if (resetFirst === void 0) { resetFirst = true; }
        if (formValues) {
            var newFormValues = this.objectWrap ? formValues['1'] : formValues;
            if (!this.jsf.formGroup) {
                this.jsf.formValues = formValues;
                this.activateForm();
            }
            else if (resetFirst) {
                this.jsf.formGroup.reset();
            }
            if (this.jsf.formGroup) {
                this.jsf.formGroup.patchValue(newFormValues);
            }
            if (this.onChange) {
                this.onChange(newFormValues);
            }
            if (this.onTouched) {
                this.onTouched(newFormValues);
            }
        }
        else {
            this.jsf.formGroup.reset();
        }
    };
    JsonSchemaFormComponent.prototype.submitForm = function () {
        var validData = this.jsf.validData;
        this.onSubmit.emit(this.objectWrap ? validData['1'] : validData);
    };
    /**
     * 'initializeForm' function
     *
     * - Update 'schema', 'layout', and 'formValues', from inputs.
     *
     * - Create 'schemaRefLibrary' and 'schemaRecursiveRefMap'
     *   to resolve schema $ref links, including recursive $ref links.
     *
     * - Create 'dataRecursiveRefMap' to resolve recursive links in data
     *   and corectly set output formats for recursively nested values.
     *
     * - Create 'layoutRefLibrary' and 'templateRefLibrary' to store
     *   new layout nodes and formGroup elements to use when dynamically
     *   adding form components to arrays and recursive $ref points.
     *
     * - Create 'dataMap' to map the data to the schema and template.
     *
     * - Create the master 'formGroupTemplate' then from it 'formGroup'
     *   the Angular formGroup used to control the reactive form.
     */
    JsonSchemaFormComponent.prototype.initializeForm = function () {
        if (this.schema || this.layout || this.data || this.form || this.model ||
            this.JSONSchema || this.UISchema || this.formData || this.ngModel ||
            this.jsf.data) {
            this.jsf.resetAllValues(); // Reset all form values to defaults
            this.initializeOptions(); // Update options
            this.initializeSchema(); // Update schema, schemaRefLibrary,
            // schemaRecursiveRefMap, & dataRecursiveRefMap
            this.initializeLayout(); // Update layout, layoutRefLibrary,
            this.initializeData(); // Update formValues
            this.activateForm(); // Update dataMap, templateRefLibrary,
            // formGroupTemplate, formGroup
            // Uncomment individual lines to output debugging information to console:
            // (These always work.)
            // console.log('loading form...');
            // console.log('schema', this.jsf.schema);
            // console.log('layout', this.jsf.layout);
            // console.log('options', this.options);
            // console.log('formValues', this.jsf.formValues);
            // console.log('formGroupTemplate', this.jsf.formGroupTemplate);
            // console.log('formGroup', this.jsf.formGroup);
            // console.log('formGroup.value', this.jsf.formGroup.value);
            // console.log('schemaRefLibrary', this.jsf.schemaRefLibrary);
            // console.log('layoutRefLibrary', this.jsf.layoutRefLibrary);
            // console.log('templateRefLibrary', this.jsf.templateRefLibrary);
            // console.log('dataMap', this.jsf.dataMap);
            // console.log('arrayMap', this.jsf.arrayMap);
            // console.log('schemaRecursiveRefMap', this.jsf.schemaRecursiveRefMap);
            // console.log('dataRecursiveRefMap', this.jsf.dataRecursiveRefMap);
            // Uncomment individual lines to output debugging information to browser:
            // (These only work if the 'debug' option has also been set to 'true'.)
            if (this.debug || this.jsf.formOptions.debug) {
                var vars = [];
                // vars.push(this.jsf.schema);
                // vars.push(this.jsf.layout);
                // vars.push(this.options);
                // vars.push(this.jsf.formValues);
                // vars.push(this.jsf.formGroup.value);
                // vars.push(this.jsf.formGroupTemplate);
                // vars.push(this.jsf.formGroup);
                // vars.push(this.jsf.schemaRefLibrary);
                // vars.push(this.jsf.layoutRefLibrary);
                // vars.push(this.jsf.templateRefLibrary);
                // vars.push(this.jsf.dataMap);
                // vars.push(this.jsf.arrayMap);
                // vars.push(this.jsf.schemaRecursiveRefMap);
                // vars.push(this.jsf.dataRecursiveRefMap);
                this.debugOutput = vars.map(function (v) { return JSON.stringify(v, null, 2); }).join('\n');
            }
            this.formInitialized = true;
        }
    };
    /**
     * 'initializeOptions' function
     *
     * Initialize 'options' (global form options) and set framework
     * Combine available inputs:
     * 1. options - recommended
     * 2. form.options - Single input style
     */
    JsonSchemaFormComponent.prototype.initializeOptions = function () {
        if (this.language && this.language !== this.jsf.language) {
            this.jsf.setLanguage(this.language);
        }
        this.jsf.setOptions({ debug: !!this.debug });
        var loadExternalAssets = this.loadExternalAssets || false;
        var framework = this.framework || 'default';
        if (isObject(this.options)) {
            this.jsf.setOptions(this.options);
            loadExternalAssets = this.options.loadExternalAssets || loadExternalAssets;
            framework = this.options.framework || framework;
        }
        if (isObject(this.form) && isObject(this.form.options)) {
            this.jsf.setOptions(this.form.options);
            loadExternalAssets = this.form.options.loadExternalAssets || loadExternalAssets;
            framework = this.form.options.framework || framework;
        }
        if (isObject(this.widgets)) {
            this.jsf.setOptions({ widgets: this.widgets });
        }
        this.frameworkLibrary.setLoadExternalAssets(loadExternalAssets);
        this.frameworkLibrary.setFramework(framework);
        this.jsf.framework = this.frameworkLibrary.getFramework();
        if (isObject(this.jsf.formOptions.widgets)) {
            try {
                for (var _a = tslib_1.__values(Object.keys(this.jsf.formOptions.widgets)), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var widget = _b.value;
                    this.widgetLibrary.registerWidget(widget, this.jsf.formOptions.widgets[widget]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (isObject(this.form) && isObject(this.form.tpldata)) {
            this.jsf.setTpldata(this.form.tpldata);
        }
        var e_1, _c;
    };
    /**
     * 'initializeSchema' function
     *
     * Initialize 'schema'
     * Use first available input:
     * 1. schema - recommended / Angular Schema Form style
     * 2. form.schema - Single input / JSON Form style
     * 3. JSONSchema - React JSON Schema Form style
     * 4. form.JSONSchema - For testing single input React JSON Schema Forms
     * 5. form - For testing single schema-only inputs
     *
     * ... if no schema input found, the 'activateForm' function, below,
     *     will make two additional attempts to build a schema
     * 6. If layout input - build schema from layout
     * 7. If data input - build schema from data
     */
    JsonSchemaFormComponent.prototype.initializeSchema = function () {
        // TODO: update to allow non-object schemas
        if (isObject(this.schema)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.schema = _.cloneDeep(this.schema);
        }
        else if (hasOwn(this.form, 'schema') && isObject(this.form.schema)) {
            this.jsf.schema = _.cloneDeep(this.form.schema);
        }
        else if (isObject(this.JSONSchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.schema = _.cloneDeep(this.JSONSchema);
        }
        else if (hasOwn(this.form, 'JSONSchema') && isObject(this.form.JSONSchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.schema = _.cloneDeep(this.form.JSONSchema);
        }
        else if (hasOwn(this.form, 'properties') && isObject(this.form.properties)) {
            this.jsf.schema = _.cloneDeep(this.form);
        }
        else if (isObject(this.form)) {
            // TODO: Handle other types of form input
        }
        if (!isEmpty(this.jsf.schema)) {
            // If other types also allowed, render schema as an object
            if (inArray('object', this.jsf.schema.type)) {
                this.jsf.schema.type = 'object';
            }
            // Wrap non-object schemas in object.
            if (hasOwn(this.jsf.schema, 'type') && this.jsf.schema.type !== 'object') {
                this.jsf.schema = {
                    'type': 'object',
                    'properties': { 1: this.jsf.schema }
                };
                this.objectWrap = true;
            }
            else if (!hasOwn(this.jsf.schema, 'type')) {
                // Add type = 'object' if missing
                if (isObject(this.jsf.schema.properties) ||
                    isObject(this.jsf.schema.patternProperties) ||
                    isObject(this.jsf.schema.additionalProperties)) {
                    this.jsf.schema.type = 'object';
                    // Fix JSON schema shorthand (JSON Form style)
                }
                else {
                    this.jsf.JsonFormCompatibility = true;
                    this.jsf.schema = {
                        'type': 'object',
                        'properties': this.jsf.schema
                    };
                }
            }
            // If needed, update JSON Schema to draft 6 format, including
            // draft 3 (JSON Form style) and draft 4 (Angular Schema Form style)
            this.jsf.schema = convertSchemaToDraft6(this.jsf.schema);
            // Initialize ajv and compile schema
            this.jsf.compileAjvSchema();
            // Create schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, & arrayMap
            this.jsf.schema = resolveSchemaReferences(this.jsf.schema, this.jsf.schemaRefLibrary, this.jsf.schemaRecursiveRefMap, this.jsf.dataRecursiveRefMap, this.jsf.arrayMap);
            if (hasOwn(this.jsf.schemaRefLibrary, '')) {
                this.jsf.hasRootReference = true;
            }
            // TODO: (?) Resolve external $ref links
            // // Create schemaRefLibrary & schemaRecursiveRefMap
            // this.parser.bundle(this.schema)
            //   .then(schema => this.schema = resolveSchemaReferences(
            //     schema, this.jsf.schemaRefLibrary,
            //     this.jsf.schemaRecursiveRefMap, this.jsf.dataRecursiveRefMap
            //   ));
        }
    };
    /**
     * 'initializeData' function
     *
     * Initialize 'formValues'
     * defulat or previously submitted values used to populate form
     * Use first available input:
     * 1. data - recommended
     * 2. model - Angular Schema Form style
     * 3. form.value - JSON Form style
     * 4. form.data - Single input style
     * 5. formData - React JSON Schema Form style
     * 6. form.formData - For easier testing of React JSON Schema Forms
     * 7. (none) no data - initialize data from schema and layout defaults only
     */
    JsonSchemaFormComponent.prototype.initializeData = function () {
        if (hasValue(this.data)) {
            this.jsf.formValues = _.cloneDeep(this.data);
            this.formValuesInput = 'data';
        }
        else if (hasValue(this.model)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.formValues = _.cloneDeep(this.model);
            this.formValuesInput = 'model';
        }
        else if (hasValue(this.ngModel)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.formValues = _.cloneDeep(this.ngModel);
            this.formValuesInput = 'ngModel';
        }
        else if (isObject(this.form) && hasValue(this.form.value)) {
            this.jsf.JsonFormCompatibility = true;
            this.jsf.formValues = _.cloneDeep(this.form.value);
            this.formValuesInput = 'form.value';
        }
        else if (isObject(this.form) && hasValue(this.form.data)) {
            this.jsf.formValues = _.cloneDeep(this.form.data);
            this.formValuesInput = 'form.data';
        }
        else if (hasValue(this.formData)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.formValuesInput = 'formData';
        }
        else if (hasOwn(this.form, 'formData') && hasValue(this.form.formData)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.formValues = _.cloneDeep(this.form.formData);
            this.formValuesInput = 'form.formData';
        }
        else {
            this.formValuesInput = null;
        }
    };
    /**
     * 'initializeLayout' function
     *
     * Initialize 'layout'
     * Use first available array input:
     * 1. layout - recommended
     * 2. form - Angular Schema Form style
     * 3. form.form - JSON Form style
     * 4. form.layout - Single input style
     * 5. (none) no layout - set default layout instead
     *    (full layout will be built later from the schema)
     *
     * Also, if alternate layout formats are available,
     * import from 'UISchema' or 'customFormItems'
     * used for React JSON Schema Form and JSON Form API compatibility
     * Use first available input:
     * 1. UISchema - React JSON Schema Form style
     * 2. form.UISchema - For testing single input React JSON Schema Forms
     * 2. form.customFormItems - JSON Form style
     * 3. (none) no input - don't import
     */
    JsonSchemaFormComponent.prototype.initializeLayout = function () {
        var _this = this;
        // Rename JSON Form-style 'options' lists to
        // Angular Schema Form-style 'titleMap' lists.
        var fixJsonFormOptions = function (layout) {
            if (isObject(layout) || isArray(layout)) {
                forEach(layout, function (value, key) {
                    if (hasOwn(value, 'options') && isObject(value.options)) {
                        value.titleMap = value.options;
                        delete value.options;
                    }
                }, 'top-down');
            }
            return layout;
        };
        // Check for layout inputs and, if found, initialize form layout
        if (isArray(this.layout)) {
            this.jsf.layout = _.cloneDeep(this.layout);
        }
        else if (isArray(this.form)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.layout = _.cloneDeep(this.form);
        }
        else if (this.form && isArray(this.form.form)) {
            this.jsf.JsonFormCompatibility = true;
            this.jsf.layout = fixJsonFormOptions(_.cloneDeep(this.form.form));
        }
        else if (this.form && isArray(this.form.layout)) {
            this.jsf.layout = _.cloneDeep(this.form.layout);
        }
        else {
            this.jsf.layout = ['*'];
        }
        // Check for alternate layout inputs
        var alternateLayout = null;
        if (isObject(this.UISchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = _.cloneDeep(this.UISchema);
        }
        else if (hasOwn(this.form, 'UISchema')) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = _.cloneDeep(this.form.UISchema);
        }
        else if (hasOwn(this.form, 'uiSchema')) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = _.cloneDeep(this.form.uiSchema);
        }
        else if (hasOwn(this.form, 'customFormItems')) {
            this.jsf.JsonFormCompatibility = true;
            alternateLayout = fixJsonFormOptions(_.cloneDeep(this.form.customFormItems));
        }
        // if alternate layout found, copy alternate layout options into schema
        if (alternateLayout) {
            JsonPointer.forEachDeep(alternateLayout, function (value, pointer) {
                var schemaPointer = pointer
                    .replace(/\//g, '/properties/')
                    .replace(/\/properties\/items\/properties\//g, '/items/properties/')
                    .replace(/\/properties\/titleMap\/properties\//g, '/titleMap/properties/');
                if (hasValue(value) && hasValue(pointer)) {
                    var key = JsonPointer.toKey(pointer);
                    var groupPointer = (JsonPointer.parse(schemaPointer) || []).slice(0, -2);
                    var itemPointer = void 0;
                    // If 'ui:order' object found, copy into object schema root
                    if (key.toLowerCase() === 'ui:order') {
                        itemPointer = tslib_1.__spread(groupPointer, ['ui:order']);
                        // Copy other alternate layout options to schema 'x-schema-form',
                        // (like Angular Schema Form options) and remove any 'ui:' prefixes
                    }
                    else {
                        if (key.slice(0, 3).toLowerCase() === 'ui:') {
                            key = key.slice(3);
                        }
                        itemPointer = tslib_1.__spread(groupPointer, ['x-schema-form', key]);
                    }
                    if (JsonPointer.has(_this.jsf.schema, groupPointer) &&
                        !JsonPointer.has(_this.jsf.schema, itemPointer)) {
                        JsonPointer.set(_this.jsf.schema, itemPointer, value);
                    }
                }
            });
        }
    };
    /**
     * 'activateForm' function
     *
     * ...continued from 'initializeSchema' function, above
     * If 'schema' has not been initialized (i.e. no schema input found)
     * 6. If layout input - build schema from layout input
     * 7. If data input - build schema from data input
     *
     * Create final layout,
     * build the FormGroup template and the Angular FormGroup,
     * subscribe to changes,
     * and activate the form.
     */
    JsonSchemaFormComponent.prototype.activateForm = function () {
        var _this = this;
        // If 'schema' not initialized
        if (isEmpty(this.jsf.schema)) {
            // TODO: If full layout input (with no '*'), build schema from layout
            // if (!this.jsf.layout.includes('*')) {
            //   this.jsf.buildSchemaFromLayout();
            // } else
            // If data input, build schema from data
            if (!isEmpty(this.jsf.formValues)) {
                this.jsf.buildSchemaFromData();
            }
        }
        if (!isEmpty(this.jsf.schema)) {
            // If not already initialized, initialize ajv and compile schema
            this.jsf.compileAjvSchema();
            // Update all layout elements, add values, widgets, and validators,
            // replace any '*' with a layout built from all schema elements,
            // and update the FormGroup template with any new validators
            this.jsf.buildLayout(this.widgetLibrary);
            // Build the Angular FormGroup template from the schema
            this.jsf.buildFormGroupTemplate(this.jsf.formValues);
            // Build the real Angular FormGroup from the FormGroup template
            this.jsf.buildFormGroup();
        }
        if (this.jsf.formGroup) {
            // Reset initial form values
            if (!isEmpty(this.jsf.formValues) &&
                this.jsf.formOptions.setSchemaDefaults !== true &&
                this.jsf.formOptions.setLayoutDefaults !== true) {
                this.setFormValues(this.jsf.formValues);
            }
            // TODO: Figure out how to display calculated values without changing object data
            // See http://ulion.github.io/jsonform/playground/?example=templating-values
            // Calculate references to other fields
            // if (!isEmpty(this.jsf.formGroup.value)) {
            //   forEach(this.jsf.formGroup.value, (value, key, object, rootObject) => {
            //     if (typeof value === 'string') {
            //       object[key] = this.jsf.parseText(value, value, rootObject, key);
            //     }
            //   }, 'top-down');
            // }
            // Subscribe to form changes to output live data, validation, and errors
            this.jsf.dataChanges.subscribe(function (data) {
                _this.onChanges.emit(_this.objectWrap ? data['1'] : data);
                if (_this.formValuesInput && _this.formValuesInput.indexOf('.') === -1) {
                    _this[_this.formValuesInput + "Change"].emit(_this.objectWrap ? data['1'] : data);
                }
            });
            // Trigger change detection on statusChanges to show updated errors
            this.jsf.formGroup.statusChanges.subscribe(function () { return _this.changeDetector.markForCheck(); });
            this.jsf.isValidChanges.subscribe(function (isValid) { return _this.isValid.emit(isValid); });
            this.jsf.validationErrorChanges.subscribe(function (err) { return _this.validationErrors.emit(err); });
            // Output final schema, final layout, and initial data
            this.formSchema.emit(this.jsf.schema);
            this.formLayout.emit(this.jsf.layout);
            this.onChanges.emit(this.objectWrap ? this.jsf.data['1'] : this.jsf.data);
            // If validateOnRender, output initial validation and any errors
            var validateOnRender_1 = JsonPointer.get(this.jsf, '/formOptions/validateOnRender');
            if (validateOnRender_1) {
                var touchAll_1 = function (control) {
                    if (validateOnRender_1 === true || hasValue(control.value)) {
                        control.markAsTouched();
                    }
                    Object.keys(control.controls || {})
                        .forEach(function (key) { return touchAll_1(control.controls[key]); });
                };
                touchAll_1(this.jsf.formGroup);
                this.isValid.emit(this.jsf.isValid);
                this.validationErrors.emit(this.jsf.ajvErrors);
            }
        }
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "schema", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], JsonSchemaFormComponent.prototype, "layout", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "data", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "options", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "framework", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "widgets", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "form", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "model", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "JSONSchema", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "UISchema", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "formData", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "ngModel", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], JsonSchemaFormComponent.prototype, "language", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], JsonSchemaFormComponent.prototype, "loadExternalAssets", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Boolean)
    ], JsonSchemaFormComponent.prototype, "debug", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], JsonSchemaFormComponent.prototype, "value", null);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "onChanges", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "onSubmit", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "isValid", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "validationErrors", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "formSchema", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "formLayout", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "dataChange", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "modelChange", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "formDataChange", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], JsonSchemaFormComponent.prototype, "ngModelChange", void 0);
    JsonSchemaFormComponent = tslib_1.__decorate([
        Component({
            selector: 'json-schema-form',
            template: "\n    <div *ngFor=\"let stylesheet of stylesheets\">\n      <link rel=\"stylesheet\" [href]=\"stylesheet\">\n    </div>\n    <div *ngFor=\"let script of scripts\">\n      <script type=\"text/javascript\" [src]=\"script\"></script>\n    </div>\n    <form class=\"json-schema-form\" (ngSubmit)=\"submitForm()\">\n      <root-widget [layout]=\"jsf?.layout\"></root-widget>\n    </form>\n    <div *ngIf=\"debug || jsf?.formOptions?.debug\">\n      Debug output: <pre>{{debugOutput}}</pre>\n    </div>",
            changeDetection: ChangeDetectionStrategy.OnPush,
            // Adding 'JsonSchemaFormService' here, instead of in the module,
            // creates a separate instance of the service for each component
            providers: [JsonSchemaFormService, JSON_SCHEMA_FORM_VALUE_ACCESSOR],
        }),
        tslib_1.__metadata("design:paramtypes", [ChangeDetectorRef,
            FrameworkLibraryService,
            WidgetLibraryService,
            JsonSchemaFormService,
            DomSanitizer])
    ], JsonSchemaFormComponent);
    return JsonSchemaFormComponent;
}());
export { JsonSchemaFormComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2pzb24tc2NoZW1hLWZvcm0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFDbkUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQzFCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6RSxPQUFPLEVBQUUsWUFBWSxFQUFtQixNQUFNLDJCQUEyQixDQUFDO0FBRTFFLE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3pFLE9BQU8sRUFDTCxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQVksUUFBUSxFQUN4RCxNQUFNLDhCQUE4QixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRTdELE1BQU0sQ0FBQyxJQUFNLCtCQUErQixHQUFRO0lBQ2xELE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxjQUFNLE9BQUEs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O1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLHlDQUF5QztRQUMzQyxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUIsMERBQTBEO1lBQzFELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLENBQUM7WUFFRCxxQ0FBcUM7WUFDckMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRztvQkFDaEIsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtpQkFDckMsQ0FBQztnQkFDRixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFNUMsaUNBQWlDO2dCQUNqQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO29CQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7b0JBQzNDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FDL0MsQ0FBQyxDQUFDLENBQUM7b0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztvQkFFbEMsOENBQThDO2dCQUM5QyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO29CQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRzt3QkFDaEIsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLFlBQVksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU07cUJBQzlCLENBQUM7Z0JBQ0osQ0FBQztZQUNILENBQUM7WUFFRCw2REFBNkQ7WUFDN0Qsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFekQsb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUU1QixrRkFBa0Y7WUFDbEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsdUJBQXVCLENBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFDMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FDaEQsQ0FBQztZQUNGLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDbkMsQ0FBQztZQUVELHdDQUF3QztZQUN4QyxxREFBcUQ7WUFDckQsa0NBQWtDO1lBQ2xDLDJEQUEyRDtZQUMzRCx5Q0FBeUM7WUFDekMsbUVBQW1FO1lBQ25FLFFBQVE7UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSyxnREFBYyxHQUF0QjtRQUNFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsR0FBRyxJQUFJLENBQUM7WUFDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7UUFDakMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQztZQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUNuQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsZUFBZSxHQUFHLFlBQVksQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLFdBQVcsQ0FBQztRQUNyQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO1FBQ3BDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN6QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9CRztJQUNLLGtEQUFnQixHQUF4QjtRQUFBLGlCQTZFQztRQTNFQyw0Q0FBNEM7UUFDNUMsOENBQThDO1FBQzlDLElBQU0sa0JBQWtCLEdBQUcsVUFBQyxNQUFXO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUc7b0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hELEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQzt3QkFDL0IsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO29CQUN2QixDQUFDO2dCQUNILENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNqQixDQUFDO1lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixnRUFBZ0U7UUFDaEUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQztZQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVELG9DQUFvQztRQUNwQyxJQUFJLGVBQWUsR0FBUSxJQUFJLENBQUM7UUFDaEMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7WUFDakQsZUFBZSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELGVBQWUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7WUFDakQsZUFBZSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1lBQ3RDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsdUVBQXVFO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDcEIsV0FBVyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsVUFBQyxLQUFLLEVBQUUsT0FBTztnQkFDdEQsSUFBTSxhQUFhLEdBQUcsT0FBTztxQkFDMUIsT0FBTyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUM7cUJBQzlCLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxvQkFBb0IsQ0FBQztxQkFDbkUsT0FBTyxDQUFDLHVDQUF1QyxFQUFFLHVCQUF1QixDQUFDLENBQUM7Z0JBQzdFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLEdBQUcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyQyxJQUFNLFlBQVksR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzRSxJQUFJLFdBQVcsU0FBbUIsQ0FBQztvQkFFbkMsMkRBQTJEO29CQUMzRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDckMsV0FBVyxvQkFBTyxZQUFZLEdBQUUsVUFBVSxFQUFDLENBQUM7d0JBRTlDLGlFQUFpRTt3QkFDakUsbUVBQW1FO29CQUNuRSxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsQ0FBQzt3QkFDcEUsV0FBVyxvQkFBTyxZQUFZLEdBQUUsZUFBZSxFQUFFLEdBQUcsRUFBQyxDQUFDO29CQUN4RCxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDO3dCQUNoRCxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUMvQyxDQUFDLENBQUMsQ0FBQzt3QkFDRCxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDdkQsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNLLDhDQUFZLEdBQXBCO1FBQUEsaUJBd0ZDO1FBdEZDLDhCQUE4QjtRQUM5QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0IscUVBQXFFO1lBQ3JFLHdDQUF3QztZQUN4QyxzQ0FBc0M7WUFDdEMsU0FBUztZQUVULHdDQUF3QztZQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ2pDLENBQUM7UUFDSCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUIsZ0VBQWdFO1lBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUU1QixtRUFBbUU7WUFDbkUsZ0VBQWdFO1lBQ2hFLDREQUE0RDtZQUM1RCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFekMsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVyRCwrREFBK0Q7WUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRXZCLDRCQUE0QjtZQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEtBQUssSUFBSTtnQkFDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEtBQUssSUFDN0MsQ0FBQyxDQUFDLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFFRCxpRkFBaUY7WUFDakYsNEVBQTRFO1lBQzVFLHVDQUF1QztZQUN2Qyw0Q0FBNEM7WUFDNUMsNEVBQTRFO1lBQzVFLHVDQUF1QztZQUN2Qyx5RUFBeUU7WUFDekUsUUFBUTtZQUNSLG9CQUFvQjtZQUNwQixJQUFJO1lBRUosd0VBQXdFO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFBLElBQUk7Z0JBQ2pDLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hELEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxlQUFlLElBQUksS0FBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxLQUFJLENBQUksS0FBSSxDQUFDLGVBQWUsV0FBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pGLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILG1FQUFtRTtZQUNuRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxFQUFsQyxDQUFrQyxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztZQUVsRixzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTFFLGdFQUFnRTtZQUNoRSxJQUFNLGtCQUFnQixHQUNwQixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsK0JBQStCLENBQUMsQ0FBQztZQUM3RCxFQUFFLENBQUMsQ0FBQyxrQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQU0sVUFBUSxHQUFHLFVBQUMsT0FBTztvQkFDdkIsRUFBRSxDQUFDLENBQUMsa0JBQWdCLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6RCxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQzFCLENBQUM7b0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQzt5QkFDaEMsT0FBTyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsVUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDLENBQUM7Z0JBQ0YsVUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUExbkJRO1FBQVIsS0FBSyxFQUFFOzsyREFBYTtJQUNaO1FBQVIsS0FBSyxFQUFFOzsyREFBZTtJQUNkO1FBQVIsS0FBSyxFQUFFOzt5REFBVztJQUNWO1FBQVIsS0FBSyxFQUFFOzs0REFBYztJQUNiO1FBQVIsS0FBSyxFQUFFOzs4REFBdUI7SUFDdEI7UUFBUixLQUFLLEVBQUU7OzREQUFjO0lBR2I7UUFBUixLQUFLLEVBQUU7O3lEQUFXO0lBR1Y7UUFBUixLQUFLLEVBQUU7OzBEQUFZO0lBR1g7UUFBUixLQUFLLEVBQUU7OytEQUFpQjtJQUNoQjtRQUFSLEtBQUssRUFBRTs7NkRBQWU7SUFDZDtRQUFSLEtBQUssRUFBRTs7NkRBQWU7SUFFZDtRQUFSLEtBQUssRUFBRTs7NERBQWM7SUFFYjtRQUFSLEtBQUssRUFBRTs7NkRBQWtCO0lBR2pCO1FBQVIsS0FBSyxFQUFFOzt1RUFBNkI7SUFDNUI7UUFBUixLQUFLLEVBQUU7OzBEQUFnQjtJQUd4QjtRQURDLEtBQUssRUFBRTs7O3dEQUdQO0lBTVM7UUFBVCxNQUFNLEVBQUU7OzhEQUFxQztJQUNwQztRQUFULE1BQU0sRUFBRTs7NkRBQW9DO0lBQ25DO1FBQVQsTUFBTSxFQUFFOzs0REFBdUM7SUFDdEM7UUFBVCxNQUFNLEVBQUU7O3FFQUE0QztJQUMzQztRQUFULE1BQU0sRUFBRTs7K0RBQXNDO0lBQ3JDO1FBQVQsTUFBTSxFQUFFOzsrREFBc0M7SUFNckM7UUFBVCxNQUFNLEVBQUU7OytEQUFzQztJQUNyQztRQUFULE1BQU0sRUFBRTs7Z0VBQXVDO0lBQ3RDO1FBQVQsTUFBTSxFQUFFOzttRUFBMEM7SUFDekM7UUFBVCxNQUFNLEVBQUU7O2tFQUF5QztJQW5FdkMsdUJBQXVCO1FBcEJuQyxTQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsa0JBQWtCO1lBQzVCLFFBQVEsRUFBRSxrZkFZRDtZQUNULGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO1lBQy9DLGlFQUFpRTtZQUNqRSxnRUFBZ0U7WUFDaEUsU0FBUyxFQUFHLENBQUUscUJBQXFCLEVBQUUsK0JBQStCLENBQUU7U0FDdkUsQ0FBQztpREEwRTBCLGlCQUFpQjtZQUNmLHVCQUF1QjtZQUMxQixvQkFBb0I7WUFDL0IscUJBQXFCO1lBQ2QsWUFBWTtPQTdFdEIsdUJBQXVCLENBNm9CbkM7SUFBRCw4QkFBQztDQUFBLEFBN29CRCxJQTZvQkM7U0E3b0JZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsIElucHV0LCBPdXRwdXQsIE9uQ2hhbmdlcywgT25Jbml0XG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlUmVzb3VyY2VVcmwgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSB9IGZyb20gJy4vZnJhbWV3b3JrLWxpYnJhcnkvZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZSc7XG5pbXBvcnQgeyBXaWRnZXRMaWJyYXJ5U2VydmljZSB9IGZyb20gJy4vd2lkZ2V0LWxpYnJhcnkvd2lkZ2V0LWxpYnJhcnkuc2VydmljZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5pbXBvcnQgeyBjb252ZXJ0U2NoZW1hVG9EcmFmdDYgfSBmcm9tICcuL3NoYXJlZC9jb252ZXJ0LXNjaGVtYS10by1kcmFmdDYuZnVuY3Rpb24nO1xuaW1wb3J0IHsgcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMgfSBmcm9tICcuL3NoYXJlZC9qc29uLXNjaGVtYS5mdW5jdGlvbnMnO1xuaW1wb3J0IHtcbiAgaGFzVmFsdWUsIGluQXJyYXksIGlzQXJyYXksIGlzRW1wdHksIGlzTnVtYmVyLCBpc09iamVjdFxufSBmcm9tICcuL3NoYXJlZC92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IGZvckVhY2gsIGhhc093biB9IGZyb20gJy4vc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9zaGFyZWQvanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcblxuZXhwb3J0IGNvbnN0IEpTT05fU0NIRU1BX0ZPUk1fVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEpzb25TY2hlbWFGb3JtQ29tcG9uZW50KSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEBtb2R1bGUgJ0pzb25TY2hlbWFGb3JtQ29tcG9uZW50JyAtIEFuZ3VsYXIgSlNPTiBTY2hlbWEgRm9ybVxuICpcbiAqIFJvb3QgbW9kdWxlIG9mIHRoZSBBbmd1bGFyIEpTT04gU2NoZW1hIEZvcm0gY2xpZW50LXNpZGUgbGlicmFyeSxcbiAqIGFuIEFuZ3VsYXIgbGlicmFyeSB3aGljaCBnZW5lcmF0ZXMgYW4gSFRNTCBmb3JtIGZyb20gYSBKU09OIHNjaGVtYVxuICogc3RydWN0dXJlZCBkYXRhIG1vZGVsIGFuZC9vciBhIEpTT04gU2NoZW1hIEZvcm0gbGF5b3V0IGRlc2NyaXB0aW9uLlxuICpcbiAqIFRoaXMgbGlicmFyeSBhbHNvIHZhbGlkYXRlcyBpbnB1dCBkYXRhIGJ5IHRoZSB1c2VyLCB1c2luZyBib3RoIHZhbGlkYXRvcnMgb25cbiAqIGluZGl2aWR1YWwgY29udHJvbHMgdG8gcHJvdmlkZSByZWFsLXRpbWUgZmVlZGJhY2sgd2hpbGUgdGhlIHVzZXIgaXMgZmlsbGluZ1xuICogb3V0IHRoZSBmb3JtLCBhbmQgdGhlbiB2YWxpZGF0aW5nIHRoZSBlbnRpcmUgaW5wdXQgYWdhaW5zdCB0aGUgc2NoZW1hIHdoZW5cbiAqIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCB0byBtYWtlIHN1cmUgdGhlIHJldHVybmVkIEpTT04gZGF0YSBvYmplY3QgaXMgdmFsaWQuXG4gKlxuICogVGhpcyBsaWJyYXJ5IGlzIHNpbWlsYXIgdG8sIGFuZCBtb3N0bHkgQVBJIGNvbXBhdGlibGUgd2l0aDpcbiAqXG4gKiAtIEpTT04gU2NoZW1hIEZvcm0ncyBBbmd1bGFyIFNjaGVtYSBGb3JtIGxpYnJhcnkgZm9yIEFuZ3VsYXJKc1xuICogICBodHRwOi8vc2NoZW1hZm9ybS5pb1xuICogICBodHRwOi8vc2NoZW1hZm9ybS5pby9leGFtcGxlcy9ib290c3RyYXAtZXhhbXBsZS5odG1sIChleGFtcGxlcylcbiAqXG4gKiAtIE1vemlsbGEncyByZWFjdC1qc29uc2NoZW1hLWZvcm0gbGlicmFyeSBmb3IgUmVhY3RcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEtc2VydmljZXMvcmVhY3QtanNvbnNjaGVtYS1mb3JtXG4gKiAgIGh0dHBzOi8vbW96aWxsYS1zZXJ2aWNlcy5naXRodWIuaW8vcmVhY3QtanNvbnNjaGVtYS1mb3JtIChleGFtcGxlcylcbiAqXG4gKiAtIEpvc2hmaXJlJ3MgSlNPTiBGb3JtIGxpYnJhcnkgZm9yIGpRdWVyeVxuICogICBodHRwczovL2dpdGh1Yi5jb20vam9zaGZpcmUvanNvbmZvcm1cbiAqICAgaHR0cDovL3VsaW9uLmdpdGh1Yi5pby9qc29uZm9ybS9wbGF5Z3JvdW5kIChleGFtcGxlcylcbiAqXG4gKiBUaGlzIGxpYnJhcnkgZGVwZW5kcyBvbjpcbiAqICAtIEFuZ3VsYXIgKG9idmlvdXNseSkgICAgICAgICAgICAgICAgICBodHRwczovL2FuZ3VsYXIuaW9cbiAqICAtIGxvZGFzaCwgSmF2YVNjcmlwdCB1dGlsaXR5IGxpYnJhcnkgICBodHRwczovL2dpdGh1Yi5jb20vbG9kYXNoL2xvZGFzaFxuICogIC0gYWp2LCBBbm90aGVyIEpTT04gU2NoZW1hIHZhbGlkYXRvciAgIGh0dHBzOi8vZ2l0aHViLmNvbS9lcG9iZXJlemtpbi9hanZcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIEV4YW1wbGUgUGxheWdyb3VuZCBhbHNvIGRlcGVuZHMgb246XG4gKiAgLSBicmFjZSwgQnJvd3NlcmlmaWVkIEFjZSBlZGl0b3IgICAgICAgaHR0cDovL3RobG9yZW56LmdpdGh1Yi5pby9icmFjZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdqc29uLXNjaGVtYS1mb3JtJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2ICpuZ0Zvcj1cImxldCBzdHlsZXNoZWV0IG9mIHN0eWxlc2hlZXRzXCI+XG4gICAgICA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgW2hyZWZdPVwic3R5bGVzaGVldFwiPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgKm5nRm9yPVwibGV0IHNjcmlwdCBvZiBzY3JpcHRzXCI+XG4gICAgICA8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBbc3JjXT1cInNjcmlwdFwiPjwvc2NyaXB0PlxuICAgIDwvZGl2PlxuICAgIDxmb3JtIGNsYXNzPVwianNvbi1zY2hlbWEtZm9ybVwiIChuZ1N1Ym1pdCk9XCJzdWJtaXRGb3JtKClcIj5cbiAgICAgIDxyb290LXdpZGdldCBbbGF5b3V0XT1cImpzZj8ubGF5b3V0XCI+PC9yb290LXdpZGdldD5cbiAgICA8L2Zvcm0+XG4gICAgPGRpdiAqbmdJZj1cImRlYnVnIHx8IGpzZj8uZm9ybU9wdGlvbnM/LmRlYnVnXCI+XG4gICAgICBEZWJ1ZyBvdXRwdXQ6IDxwcmU+e3tkZWJ1Z091dHB1dH19PC9wcmU+XG4gICAgPC9kaXY+YCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIC8vIEFkZGluZyAnSnNvblNjaGVtYUZvcm1TZXJ2aWNlJyBoZXJlLCBpbnN0ZWFkIG9mIGluIHRoZSBtb2R1bGUsXG4gIC8vIGNyZWF0ZXMgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiB0aGUgc2VydmljZSBmb3IgZWFjaCBjb21wb25lbnRcbiAgcHJvdmlkZXJzOiAgWyBKc29uU2NoZW1hRm9ybVNlcnZpY2UsIEpTT05fU0NIRU1BX0ZPUk1fVkFMVUVfQUNDRVNTT1IgXSxcbn0pXG5leHBvcnQgY2xhc3MgSnNvblNjaGVtYUZvcm1Db21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25DaGFuZ2VzLCBPbkluaXQge1xuICBkZWJ1Z091dHB1dDogYW55OyAvLyBEZWJ1ZyBpbmZvcm1hdGlvbiwgaWYgcmVxdWVzdGVkXG4gIGZvcm1WYWx1ZVN1YnNjcmlwdGlvbjogYW55ID0gbnVsbDtcbiAgZm9ybUluaXRpYWxpemVkID0gZmFsc2U7XG4gIG9iamVjdFdyYXAgPSBmYWxzZTsgLy8gSXMgbm9uLW9iamVjdCBpbnB1dCBzY2hlbWEgd3JhcHBlZCBpbiBhbiBvYmplY3Q/XG5cbiAgZm9ybVZhbHVlc0lucHV0OiBzdHJpbmc7IC8vIE5hbWUgb2YgdGhlIGlucHV0IHByb3ZpZGluZyB0aGUgZm9ybSBkYXRhXG4gIHByZXZpb3VzSW5wdXRzOiB7IC8vIFByZXZpb3VzIGlucHV0IHZhbHVlcywgdG8gZGV0ZWN0IHdoaWNoIGlucHV0IHRyaWdnZXJzIG9uQ2hhbmdlc1xuICAgIHNjaGVtYTogYW55LCBsYXlvdXQ6IGFueVtdLCBkYXRhOiBhbnksIG9wdGlvbnM6IGFueSwgZnJhbWV3b3JrOiBhbnl8c3RyaW5nLFxuICAgIHdpZGdldHM6IGFueSwgZm9ybTogYW55LCBtb2RlbDogYW55LCBKU09OU2NoZW1hOiBhbnksIFVJU2NoZW1hOiBhbnksXG4gICAgZm9ybURhdGE6IGFueSwgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuLCBkZWJ1ZzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICBzY2hlbWE6IG51bGwsIGxheW91dDogbnVsbCwgZGF0YTogbnVsbCwgb3B0aW9uczogbnVsbCwgZnJhbWV3b3JrOiBudWxsLFxuICAgIHdpZGdldHM6IG51bGwsIGZvcm06IG51bGwsIG1vZGVsOiBudWxsLCBKU09OU2NoZW1hOiBudWxsLCBVSVNjaGVtYTogbnVsbCxcbiAgICBmb3JtRGF0YTogbnVsbCwgbG9hZEV4dGVybmFsQXNzZXRzOiBudWxsLCBkZWJ1ZzogbnVsbCxcbiAgfTtcblxuICAvLyBSZWNvbW1lbmRlZCBpbnB1dHNcbiAgQElucHV0KCkgc2NoZW1hOiBhbnk7IC8vIFRoZSBKU09OIFNjaGVtYVxuICBASW5wdXQoKSBsYXlvdXQ6IGFueVtdOyAvLyBUaGUgZm9ybSBsYXlvdXRcbiAgQElucHV0KCkgZGF0YTogYW55OyAvLyBUaGUgZm9ybSBkYXRhXG4gIEBJbnB1dCgpIG9wdGlvbnM6IGFueTsgLy8gVGhlIGdsb2JhbCBmb3JtIG9wdGlvbnNcbiAgQElucHV0KCkgZnJhbWV3b3JrOiBhbnl8c3RyaW5nOyAvLyBUaGUgZnJhbWV3b3JrIHRvIGxvYWRcbiAgQElucHV0KCkgd2lkZ2V0czogYW55OyAvLyBBbnkgY3VzdG9tIHdpZGdldHMgdG8gbG9hZFxuXG4gIC8vIEFsdGVybmF0ZSBjb21iaW5lZCBzaW5nbGUgaW5wdXRcbiAgQElucHV0KCkgZm9ybTogYW55OyAvLyBGb3IgdGVzdGluZywgYW5kIEpTT04gU2NoZW1hIEZvcm0gQVBJIGNvbXBhdGliaWxpdHlcblxuICAvLyBBbmd1bGFyIFNjaGVtYSBGb3JtIEFQSSBjb21wYXRpYmlsaXR5IGlucHV0XG4gIEBJbnB1dCgpIG1vZGVsOiBhbnk7IC8vIEFsdGVybmF0ZSBpbnB1dCBmb3IgZm9ybSBkYXRhXG5cbiAgLy8gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBBUEkgY29tcGF0aWJpbGl0eSBpbnB1dHNcbiAgQElucHV0KCkgSlNPTlNjaGVtYTogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIEpTT04gU2NoZW1hXG4gIEBJbnB1dCgpIFVJU2NoZW1hOiBhbnk7IC8vIFVJIHNjaGVtYSAtIGFsdGVybmF0ZSBmb3JtIGxheW91dCBmb3JtYXRcbiAgQElucHV0KCkgZm9ybURhdGE6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBmb3JtIGRhdGFcblxuICBASW5wdXQoKSBuZ01vZGVsOiBhbnk7IC8vIEFsdGVybmF0ZSBpbnB1dCBmb3IgQW5ndWxhciBmb3Jtc1xuXG4gIEBJbnB1dCgpIGxhbmd1YWdlOiBzdHJpbmc7IC8vIExhbmd1YWdlXG5cbiAgLy8gRGV2ZWxvcG1lbnQgaW5wdXRzLCBmb3IgdGVzdGluZyBhbmQgZGVidWdnaW5nXG4gIEBJbnB1dCgpIGxvYWRFeHRlcm5hbEFzc2V0czogYm9vbGVhbjsgLy8gTG9hZCBleHRlcm5hbCBmcmFtZXdvcmsgYXNzZXRzP1xuICBASW5wdXQoKSBkZWJ1ZzogYm9vbGVhbjsgLy8gU2hvdyBkZWJ1ZyBpbmZvcm1hdGlvbj9cblxuICBASW5wdXQoKVxuICBnZXQgdmFsdWUoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5vYmplY3RXcmFwID8gdGhpcy5qc2YuZGF0YVsnMSddIDogdGhpcy5qc2YuZGF0YTtcbiAgfVxuICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xuICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh2YWx1ZSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gT3V0cHV0c1xuICBAT3V0cHV0KCkgb25DaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7IC8vIExpdmUgdW52YWxpZGF0ZWQgaW50ZXJuYWwgZm9ybSBkYXRhXG4gIEBPdXRwdXQoKSBvblN1Ym1pdCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBDb21wbGV0ZSB2YWxpZGF0ZWQgZm9ybSBkYXRhXG4gIEBPdXRwdXQoKSBpc1ZhbGlkID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpOyAvLyBJcyBjdXJyZW50IGRhdGEgdmFsaWQ/XG4gIEBPdXRwdXQoKSB2YWxpZGF0aW9uRXJyb3JzID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7IC8vIFZhbGlkYXRpb24gZXJyb3JzIChpZiBhbnkpXG4gIEBPdXRwdXQoKSBmb3JtU2NoZW1hID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7IC8vIEZpbmFsIHNjaGVtYSB1c2VkIHRvIGNyZWF0ZSBmb3JtXG4gIEBPdXRwdXQoKSBmb3JtTGF5b3V0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7IC8vIEZpbmFsIGxheW91dCB1c2VkIHRvIGNyZWF0ZSBmb3JtXG5cbiAgLy8gT3V0cHV0cyBmb3IgcG9zc2libGUgMi13YXkgZGF0YSBiaW5kaW5nXG4gIC8vIE9ubHkgdGhlIG9uZSBpbnB1dCBwcm92aWRpbmcgdGhlIGluaXRpYWwgZm9ybSBkYXRhIHdpbGwgYmUgYm91bmQuXG4gIC8vIElmIHRoZXJlIGlzIG5vIGluaXRhbCBkYXRhLCBpbnB1dCAne30nIHRvIGFjdGl2YXRlIDItd2F5IGRhdGEgYmluZGluZy5cbiAgLy8gVGhlcmUgaXMgbm8gMi13YXkgYmluZGluZyBpZiBpbml0YWwgZGF0YSBpcyBjb21iaW5lZCBpbnNpZGUgdGhlICdmb3JtJyBpbnB1dC5cbiAgQE91dHB1dCgpIGRhdGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIG1vZGVsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBmb3JtRGF0YUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgbmdNb2RlbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIG9uQ2hhbmdlOiBGdW5jdGlvbjtcbiAgb25Ub3VjaGVkOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIGZyYW1ld29ya0xpYnJhcnk6IEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICAgIHByaXZhdGUgd2lkZ2V0TGlicmFyeTogV2lkZ2V0TGlicmFyeVNlcnZpY2UsXG4gICAgcHVibGljIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgIHByaXZhdGUgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXJcbiAgKSB7IH1cblxuICBnZXQgc3R5bGVzaGVldHMoKTogU2FmZVJlc291cmNlVXJsW10ge1xuICAgIGNvbnN0IHN0eWxlc2hlZXRzID0gdGhpcy5mcmFtZXdvcmtMaWJyYXJ5LmdldEZyYW1ld29ya1N0eWxlc2hlZXRzKCk7XG4gICAgY29uc3QgbG9hZCA9IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RSZXNvdXJjZVVybDtcbiAgICByZXR1cm4gc3R5bGVzaGVldHMubWFwKHN0eWxlc2hlZXQgPT4gbG9hZChzdHlsZXNoZWV0KSk7XG4gIH1cblxuICBnZXQgc2NyaXB0cygpOiBTYWZlUmVzb3VyY2VVcmxbXSB7XG4gICAgY29uc3Qgc2NyaXB0cyA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTY3JpcHRzKCk7XG4gICAgY29uc3QgbG9hZCA9IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RSZXNvdXJjZVVybDtcbiAgICByZXR1cm4gc2NyaXB0cy5tYXAoc2NyaXB0ID0+IGxvYWQoc2NyaXB0KSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnVwZGF0ZUZvcm0oKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIHRoaXMudXBkYXRlRm9ybSgpO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5zZXRGb3JtVmFsdWVzKHZhbHVlLCBmYWxzZSk7XG4gICAgaWYgKCF0aGlzLmZvcm1WYWx1ZXNJbnB1dCkgeyB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICduZ01vZGVsJzsgfVxuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuanNmLmZvcm1PcHRpb25zLmZvcm1EaXNhYmxlZCAhPT0gISFpc0Rpc2FibGVkKSB7XG4gICAgICB0aGlzLmpzZi5mb3JtT3B0aW9ucy5mb3JtRGlzYWJsZWQgPSAhIWlzRGlzYWJsZWQ7XG4gICAgICB0aGlzLmluaXRpYWxpemVGb3JtKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRm9ybSgpIHtcbiAgICBpZiAoIXRoaXMuZm9ybUluaXRpYWxpemVkIHx8ICF0aGlzLmZvcm1WYWx1ZXNJbnB1dCB8fFxuICAgICAgKHRoaXMubGFuZ3VhZ2UgJiYgdGhpcy5sYW5ndWFnZSAhPT0gdGhpcy5qc2YubGFuZ3VhZ2UpXG4gICAgKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVGb3JtKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmxhbmd1YWdlICYmIHRoaXMubGFuZ3VhZ2UgIT09IHRoaXMuanNmLmxhbmd1YWdlKSB7XG4gICAgICAgIHRoaXMuanNmLnNldExhbmd1YWdlKHRoaXMubGFuZ3VhZ2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgbmFtZXMgb2YgY2hhbmdlZCBpbnB1dHNcbiAgICAgIGxldCBjaGFuZ2VkSW5wdXQgPSBPYmplY3Qua2V5cyh0aGlzLnByZXZpb3VzSW5wdXRzKVxuICAgICAgICAuZmlsdGVyKGlucHV0ID0+IHRoaXMucHJldmlvdXNJbnB1dHNbaW5wdXRdICE9PSB0aGlzW2lucHV0XSk7XG4gICAgICBsZXQgcmVzZXRGaXJzdCA9IHRydWU7XG4gICAgICBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCA9PT0gMSAmJiBjaGFuZ2VkSW5wdXRbMF0gPT09ICdmb3JtJyAmJlxuICAgICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5zdGFydHNXaXRoKCdmb3JtLicpXG4gICAgICApIHtcbiAgICAgICAgLy8gSWYgb25seSAnZm9ybScgaW5wdXQgY2hhbmdlZCwgZ2V0IG5hbWVzIG9mIGNoYW5nZWQga2V5c1xuICAgICAgICBjaGFuZ2VkSW5wdXQgPSBPYmplY3Qua2V5cyh0aGlzLnByZXZpb3VzSW5wdXRzLmZvcm0gfHwge30pXG4gICAgICAgICAgLmZpbHRlcihrZXkgPT4gIV8uaXNFcXVhbCh0aGlzLnByZXZpb3VzSW5wdXRzLmZvcm1ba2V5XSwgdGhpcy5mb3JtW2tleV0pKVxuICAgICAgICAgIC5tYXAoa2V5ID0+IGBmb3JtLiR7a2V5fWApO1xuICAgICAgICByZXNldEZpcnN0ID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG9ubHkgaW5wdXQgdmFsdWVzIGhhdmUgY2hhbmdlZCwgdXBkYXRlIHRoZSBmb3JtIHZhbHVlc1xuICAgICAgaWYgKGNoYW5nZWRJbnB1dC5sZW5ndGggPT09IDEgJiYgY2hhbmdlZElucHV0WzBdID09PSB0aGlzLmZvcm1WYWx1ZXNJbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5mb3JtVmFsdWVzSW5wdXQuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh0aGlzW3RoaXMuZm9ybVZhbHVlc0lucHV0XSwgcmVzZXRGaXJzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgW2lucHV0LCBrZXldID0gdGhpcy5mb3JtVmFsdWVzSW5wdXQuc3BsaXQoJy4nKTtcbiAgICAgICAgICB0aGlzLnNldEZvcm1WYWx1ZXModGhpc1tpbnB1dF1ba2V5XSwgcmVzZXRGaXJzdCk7XG4gICAgICAgIH1cblxuICAgICAgLy8gSWYgYW55dGhpbmcgZWxzZSBoYXMgY2hhbmdlZCwgcmUtcmVuZGVyIHRoZSBlbnRpcmUgZm9ybVxuICAgICAgfSBlbHNlIGlmIChjaGFuZ2VkSW5wdXQubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUZvcm0oKTtcbiAgICAgICAgaWYgKHRoaXMub25DaGFuZ2UpIHsgdGhpcy5vbkNoYW5nZSh0aGlzLmpzZi5mb3JtVmFsdWVzKTsgfVxuICAgICAgICBpZiAodGhpcy5vblRvdWNoZWQpIHsgdGhpcy5vblRvdWNoZWQodGhpcy5qc2YuZm9ybVZhbHVlcyk7IH1cbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHByZXZpb3VzIGlucHV0c1xuICAgICAgT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cylcbiAgICAgICAgLmZpbHRlcihpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSAhPT0gdGhpc1tpbnB1dF0pXG4gICAgICAgIC5mb3JFYWNoKGlucHV0ID0+IHRoaXMucHJldmlvdXNJbnB1dHNbaW5wdXRdID0gdGhpc1tpbnB1dF0pO1xuICAgIH1cbiAgfVxuXG4gIHNldEZvcm1WYWx1ZXMoZm9ybVZhbHVlczogYW55LCByZXNldEZpcnN0ID0gdHJ1ZSkge1xuICAgIGlmIChmb3JtVmFsdWVzKSB7XG4gICAgICBjb25zdCBuZXdGb3JtVmFsdWVzID0gdGhpcy5vYmplY3RXcmFwID8gZm9ybVZhbHVlc1snMSddIDogZm9ybVZhbHVlcztcbiAgICAgIGlmICghdGhpcy5qc2YuZm9ybUdyb3VwKSB7XG4gICAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBmb3JtVmFsdWVzO1xuICAgICAgICB0aGlzLmFjdGl2YXRlRm9ybSgpO1xuICAgICAgfSBlbHNlIGlmIChyZXNldEZpcnN0KSB7XG4gICAgICAgIHRoaXMuanNmLmZvcm1Hcm91cC5yZXNldCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuanNmLmZvcm1Hcm91cCkge1xuICAgICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucGF0Y2hWYWx1ZShuZXdGb3JtVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9uQ2hhbmdlKSB7IHRoaXMub25DaGFuZ2UobmV3Rm9ybVZhbHVlcyk7IH1cbiAgICAgIGlmICh0aGlzLm9uVG91Y2hlZCkgeyB0aGlzLm9uVG91Y2hlZChuZXdGb3JtVmFsdWVzKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBzdWJtaXRGb3JtKCkge1xuICAgIGNvbnN0IHZhbGlkRGF0YSA9IHRoaXMuanNmLnZhbGlkRGF0YTtcbiAgICB0aGlzLm9uU3VibWl0LmVtaXQodGhpcy5vYmplY3RXcmFwID8gdmFsaWREYXRhWycxJ10gOiB2YWxpZERhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplRm9ybScgZnVuY3Rpb25cbiAgICpcbiAgICogLSBVcGRhdGUgJ3NjaGVtYScsICdsYXlvdXQnLCBhbmQgJ2Zvcm1WYWx1ZXMnLCBmcm9tIGlucHV0cy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ3NjaGVtYVJlZkxpYnJhcnknIGFuZCAnc2NoZW1hUmVjdXJzaXZlUmVmTWFwJ1xuICAgKiAgIHRvIHJlc29sdmUgc2NoZW1hICRyZWYgbGlua3MsIGluY2x1ZGluZyByZWN1cnNpdmUgJHJlZiBsaW5rcy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2RhdGFSZWN1cnNpdmVSZWZNYXAnIHRvIHJlc29sdmUgcmVjdXJzaXZlIGxpbmtzIGluIGRhdGFcbiAgICogICBhbmQgY29yZWN0bHkgc2V0IG91dHB1dCBmb3JtYXRzIGZvciByZWN1cnNpdmVseSBuZXN0ZWQgdmFsdWVzLlxuICAgKlxuICAgKiAtIENyZWF0ZSAnbGF5b3V0UmVmTGlicmFyeScgYW5kICd0ZW1wbGF0ZVJlZkxpYnJhcnknIHRvIHN0b3JlXG4gICAqICAgbmV3IGxheW91dCBub2RlcyBhbmQgZm9ybUdyb3VwIGVsZW1lbnRzIHRvIHVzZSB3aGVuIGR5bmFtaWNhbGx5XG4gICAqICAgYWRkaW5nIGZvcm0gY29tcG9uZW50cyB0byBhcnJheXMgYW5kIHJlY3Vyc2l2ZSAkcmVmIHBvaW50cy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2RhdGFNYXAnIHRvIG1hcCB0aGUgZGF0YSB0byB0aGUgc2NoZW1hIGFuZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogLSBDcmVhdGUgdGhlIG1hc3RlciAnZm9ybUdyb3VwVGVtcGxhdGUnIHRoZW4gZnJvbSBpdCAnZm9ybUdyb3VwJ1xuICAgKiAgIHRoZSBBbmd1bGFyIGZvcm1Hcm91cCB1c2VkIHRvIGNvbnRyb2wgdGhlIHJlYWN0aXZlIGZvcm0uXG4gICAqL1xuICBpbml0aWFsaXplRm9ybSgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLnNjaGVtYSB8fCB0aGlzLmxheW91dCB8fCB0aGlzLmRhdGEgfHwgdGhpcy5mb3JtIHx8IHRoaXMubW9kZWwgfHxcbiAgICAgIHRoaXMuSlNPTlNjaGVtYSB8fCB0aGlzLlVJU2NoZW1hIHx8IHRoaXMuZm9ybURhdGEgfHwgdGhpcy5uZ01vZGVsIHx8XG4gICAgICB0aGlzLmpzZi5kYXRhXG4gICAgKSB7XG5cbiAgICAgIHRoaXMuanNmLnJlc2V0QWxsVmFsdWVzKCk7ICAvLyBSZXNldCBhbGwgZm9ybSB2YWx1ZXMgdG8gZGVmYXVsdHNcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZU9wdGlvbnMoKTsgICAvLyBVcGRhdGUgb3B0aW9uc1xuICAgICAgdGhpcy5pbml0aWFsaXplU2NoZW1hKCk7ICAgIC8vIFVwZGF0ZSBzY2hlbWEsIHNjaGVtYVJlZkxpYnJhcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCAmIGRhdGFSZWN1cnNpdmVSZWZNYXBcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZUxheW91dCgpOyAgICAvLyBVcGRhdGUgbGF5b3V0LCBsYXlvdXRSZWZMaWJyYXJ5LFxuICAgICAgdGhpcy5pbml0aWFsaXplRGF0YSgpOyAgICAgIC8vIFVwZGF0ZSBmb3JtVmFsdWVzXG4gICAgICB0aGlzLmFjdGl2YXRlRm9ybSgpOyAgICAgICAgLy8gVXBkYXRlIGRhdGFNYXAsIHRlbXBsYXRlUmVmTGlicmFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtR3JvdXBUZW1wbGF0ZSwgZm9ybUdyb3VwXG5cbiAgICAgIC8vIFVuY29tbWVudCBpbmRpdmlkdWFsIGxpbmVzIHRvIG91dHB1dCBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24gdG8gY29uc29sZTpcbiAgICAgIC8vIChUaGVzZSBhbHdheXMgd29yay4pXG4gICAgICAvLyBjb25zb2xlLmxvZygnbG9hZGluZyBmb3JtLi4uJyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc2NoZW1hJywgdGhpcy5qc2Yuc2NoZW1hKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsYXlvdXQnLCB0aGlzLmpzZi5sYXlvdXQpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ29wdGlvbnMnLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1WYWx1ZXMnLCB0aGlzLmpzZi5mb3JtVmFsdWVzKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb3JtR3JvdXBUZW1wbGF0ZScsIHRoaXMuanNmLmZvcm1Hcm91cFRlbXBsYXRlKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb3JtR3JvdXAnLCB0aGlzLmpzZi5mb3JtR3JvdXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1Hcm91cC52YWx1ZScsIHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc2NoZW1hUmVmTGlicmFyeScsIHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2xheW91dFJlZkxpYnJhcnknLCB0aGlzLmpzZi5sYXlvdXRSZWZMaWJyYXJ5KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCd0ZW1wbGF0ZVJlZkxpYnJhcnknLCB0aGlzLmpzZi50ZW1wbGF0ZVJlZkxpYnJhcnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2RhdGFNYXAnLCB0aGlzLmpzZi5kYXRhTWFwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdhcnJheU1hcCcsIHRoaXMuanNmLmFycmF5TWFwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzY2hlbWFSZWN1cnNpdmVSZWZNYXAnLCB0aGlzLmpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2RhdGFSZWN1cnNpdmVSZWZNYXAnLCB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwKTtcblxuICAgICAgLy8gVW5jb21tZW50IGluZGl2aWR1YWwgbGluZXMgdG8gb3V0cHV0IGRlYnVnZ2luZyBpbmZvcm1hdGlvbiB0byBicm93c2VyOlxuICAgICAgLy8gKFRoZXNlIG9ubHkgd29yayBpZiB0aGUgJ2RlYnVnJyBvcHRpb24gaGFzIGFsc28gYmVlbiBzZXQgdG8gJ3RydWUnLilcbiAgICAgIGlmICh0aGlzLmRlYnVnIHx8IHRoaXMuanNmLmZvcm1PcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIGNvbnN0IHZhcnM6IGFueVtdID0gW107XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5zY2hlbWEpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YubGF5b3V0KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMub3B0aW9ucyk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtVmFsdWVzKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtR3JvdXBUZW1wbGF0ZSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtR3JvdXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5sYXlvdXRSZWZMaWJyYXJ5KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnRlbXBsYXRlUmVmTGlicmFyeSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5kYXRhTWFwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmFycmF5TWFwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgICAgdGhpcy5kZWJ1Z091dHB1dCA9IHZhcnMubWFwKHYgPT4gSlNPTi5zdHJpbmdpZnkodiwgbnVsbCwgMikpLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JtSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZU9wdGlvbnMnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ29wdGlvbnMnIChnbG9iYWwgZm9ybSBvcHRpb25zKSBhbmQgc2V0IGZyYW1ld29ya1xuICAgKiBDb21iaW5lIGF2YWlsYWJsZSBpbnB1dHM6XG4gICAqIDEuIG9wdGlvbnMgLSByZWNvbW1lbmRlZFxuICAgKiAyLiBmb3JtLm9wdGlvbnMgLSBTaW5nbGUgaW5wdXQgc3R5bGVcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU9wdGlvbnMoKSB7XG4gICAgaWYgKHRoaXMubGFuZ3VhZ2UgJiYgdGhpcy5sYW5ndWFnZSAhPT0gdGhpcy5qc2YubGFuZ3VhZ2UpIHtcbiAgICAgIHRoaXMuanNmLnNldExhbmd1YWdlKHRoaXMubGFuZ3VhZ2UpO1xuICAgIH1cbiAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHsgZGVidWc6ICEhdGhpcy5kZWJ1ZyB9KTtcbiAgICBsZXQgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuID0gdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHMgfHwgZmFsc2U7XG4gICAgbGV0IGZyYW1ld29yazogYW55ID0gdGhpcy5mcmFtZXdvcmsgfHwgJ2RlZmF1bHQnO1xuICAgIGlmIChpc09iamVjdCh0aGlzLm9wdGlvbnMpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgICBsb2FkRXh0ZXJuYWxBc3NldHMgPSB0aGlzLm9wdGlvbnMubG9hZEV4dGVybmFsQXNzZXRzIHx8IGxvYWRFeHRlcm5hbEFzc2V0cztcbiAgICAgIGZyYW1ld29yayA9IHRoaXMub3B0aW9ucy5mcmFtZXdvcmsgfHwgZnJhbWV3b3JrO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSAmJiBpc09iamVjdCh0aGlzLmZvcm0ub3B0aW9ucykpIHtcbiAgICAgIHRoaXMuanNmLnNldE9wdGlvbnModGhpcy5mb3JtLm9wdGlvbnMpO1xuICAgICAgbG9hZEV4dGVybmFsQXNzZXRzID0gdGhpcy5mb3JtLm9wdGlvbnMubG9hZEV4dGVybmFsQXNzZXRzIHx8IGxvYWRFeHRlcm5hbEFzc2V0cztcbiAgICAgIGZyYW1ld29yayA9IHRoaXMuZm9ybS5vcHRpb25zLmZyYW1ld29yayB8fCBmcmFtZXdvcms7XG4gICAgfVxuICAgIGlmIChpc09iamVjdCh0aGlzLndpZGdldHMpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHsgd2lkZ2V0czogdGhpcy53aWRnZXRzIH0pO1xuICAgIH1cbiAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkuc2V0TG9hZEV4dGVybmFsQXNzZXRzKGxvYWRFeHRlcm5hbEFzc2V0cyk7XG4gICAgdGhpcy5mcmFtZXdvcmtMaWJyYXJ5LnNldEZyYW1ld29yayhmcmFtZXdvcmspO1xuICAgIHRoaXMuanNmLmZyYW1ld29yayA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmsoKTtcbiAgICBpZiAoaXNPYmplY3QodGhpcy5qc2YuZm9ybU9wdGlvbnMud2lkZ2V0cykpIHtcbiAgICAgIGZvciAoY29uc3Qgd2lkZ2V0IG9mIE9iamVjdC5rZXlzKHRoaXMuanNmLmZvcm1PcHRpb25zLndpZGdldHMpKSB7XG4gICAgICAgIHRoaXMud2lkZ2V0TGlicmFyeS5yZWdpc3RlcldpZGdldCh3aWRnZXQsIHRoaXMuanNmLmZvcm1PcHRpb25zLndpZGdldHNbd2lkZ2V0XSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGlzT2JqZWN0KHRoaXMuZm9ybS50cGxkYXRhKSkge1xuICAgICAgdGhpcy5qc2Yuc2V0VHBsZGF0YSh0aGlzLmZvcm0udHBsZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplU2NoZW1hJyBmdW5jdGlvblxuICAgKlxuICAgKiBJbml0aWFsaXplICdzY2hlbWEnXG4gICAqIFVzZSBmaXJzdCBhdmFpbGFibGUgaW5wdXQ6XG4gICAqIDEuIHNjaGVtYSAtIHJlY29tbWVuZGVkIC8gQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiAyLiBmb3JtLnNjaGVtYSAtIFNpbmdsZSBpbnB1dCAvIEpTT04gRm9ybSBzdHlsZVxuICAgKiAzLiBKU09OU2NoZW1hIC0gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiA0LiBmb3JtLkpTT05TY2hlbWEgLSBGb3IgdGVzdGluZyBzaW5nbGUgaW5wdXQgUmVhY3QgSlNPTiBTY2hlbWEgRm9ybXNcbiAgICogNS4gZm9ybSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBzY2hlbWEtb25seSBpbnB1dHNcbiAgICpcbiAgICogLi4uIGlmIG5vIHNjaGVtYSBpbnB1dCBmb3VuZCwgdGhlICdhY3RpdmF0ZUZvcm0nIGZ1bmN0aW9uLCBiZWxvdyxcbiAgICogICAgIHdpbGwgbWFrZSB0d28gYWRkaXRpb25hbCBhdHRlbXB0cyB0byBidWlsZCBhIHNjaGVtYVxuICAgKiA2LiBJZiBsYXlvdXQgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBsYXlvdXRcbiAgICogNy4gSWYgZGF0YSBpbnB1dCAtIGJ1aWxkIHNjaGVtYSBmcm9tIGRhdGFcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZVNjaGVtYSgpIHtcblxuICAgIC8vIFRPRE86IHVwZGF0ZSB0byBhbGxvdyBub24tb2JqZWN0IHNjaGVtYXNcblxuICAgIGlmIChpc09iamVjdCh0aGlzLnNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBfLmNsb25lRGVlcCh0aGlzLnNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnc2NoZW1hJykgJiYgaXNPYmplY3QodGhpcy5mb3JtLnNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IF8uY2xvbmVEZWVwKHRoaXMuZm9ybS5zY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGhpcy5KU09OU2NoZW1hKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gXy5jbG9uZURlZXAodGhpcy5KU09OU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdKU09OU2NoZW1hJykgJiYgaXNPYmplY3QodGhpcy5mb3JtLkpTT05TY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBfLmNsb25lRGVlcCh0aGlzLmZvcm0uSlNPTlNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAncHJvcGVydGllcycpICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5wcm9wZXJ0aWVzKSkge1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gXy5jbG9uZURlZXAodGhpcy5mb3JtKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkpIHtcbiAgICAgIC8vIFRPRE86IEhhbmRsZSBvdGhlciB0eXBlcyBvZiBmb3JtIGlucHV0XG4gICAgfVxuXG4gICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLnNjaGVtYSkpIHtcblxuICAgICAgLy8gSWYgb3RoZXIgdHlwZXMgYWxzbyBhbGxvd2VkLCByZW5kZXIgc2NoZW1hIGFzIGFuIG9iamVjdFxuICAgICAgaWYgKGluQXJyYXkoJ29iamVjdCcsIHRoaXMuanNmLnNjaGVtYS50eXBlKSkge1xuICAgICAgICB0aGlzLmpzZi5zY2hlbWEudHlwZSA9ICdvYmplY3QnO1xuICAgICAgfVxuXG4gICAgICAvLyBXcmFwIG5vbi1vYmplY3Qgc2NoZW1hcyBpbiBvYmplY3QuXG4gICAgICBpZiAoaGFzT3duKHRoaXMuanNmLnNjaGVtYSwgJ3R5cGUnKSAmJiB0aGlzLmpzZi5zY2hlbWEudHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5qc2Yuc2NoZW1hID0ge1xuICAgICAgICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgICAgICAgJ3Byb3BlcnRpZXMnOiB7IDE6IHRoaXMuanNmLnNjaGVtYSB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub2JqZWN0V3JhcCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKCFoYXNPd24odGhpcy5qc2Yuc2NoZW1hLCAndHlwZScpKSB7XG5cbiAgICAgICAgLy8gQWRkIHR5cGUgPSAnb2JqZWN0JyBpZiBtaXNzaW5nXG4gICAgICAgIGlmIChpc09iamVjdCh0aGlzLmpzZi5zY2hlbWEucHJvcGVydGllcykgfHxcbiAgICAgICAgICBpc09iamVjdCh0aGlzLmpzZi5zY2hlbWEucGF0dGVyblByb3BlcnRpZXMpIHx8XG4gICAgICAgICAgaXNPYmplY3QodGhpcy5qc2Yuc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmpzZi5zY2hlbWEudHlwZSA9ICdvYmplY3QnO1xuXG4gICAgICAgIC8vIEZpeCBKU09OIHNjaGVtYSBzaG9ydGhhbmQgKEpTT04gRm9ybSBzdHlsZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmpzZi5Kc29uRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuanNmLnNjaGVtYSA9IHtcbiAgICAgICAgICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgICAgICAgICAncHJvcGVydGllcyc6IHRoaXMuanNmLnNjaGVtYVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbmVlZGVkLCB1cGRhdGUgSlNPTiBTY2hlbWEgdG8gZHJhZnQgNiBmb3JtYXQsIGluY2x1ZGluZ1xuICAgICAgLy8gZHJhZnQgMyAoSlNPTiBGb3JtIHN0eWxlKSBhbmQgZHJhZnQgNCAoQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZSlcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNvbnZlcnRTY2hlbWFUb0RyYWZ0Nih0aGlzLmpzZi5zY2hlbWEpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIGFqdiBhbmQgY29tcGlsZSBzY2hlbWFcbiAgICAgIHRoaXMuanNmLmNvbXBpbGVBanZTY2hlbWEoKTtcblxuICAgICAgLy8gQ3JlYXRlIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgZGF0YVJlY3Vyc2l2ZVJlZk1hcCwgJiBhcnJheU1hcFxuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMoXG4gICAgICAgIHRoaXMuanNmLnNjaGVtYSwgdGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSwgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLFxuICAgICAgICB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCB0aGlzLmpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGlmIChoYXNPd24odGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSwgJycpKSB7XG4gICAgICAgIHRoaXMuanNmLmhhc1Jvb3RSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiAoPykgUmVzb2x2ZSBleHRlcm5hbCAkcmVmIGxpbmtzXG4gICAgICAvLyAvLyBDcmVhdGUgc2NoZW1hUmVmTGlicmFyeSAmIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcFxuICAgICAgLy8gdGhpcy5wYXJzZXIuYnVuZGxlKHRoaXMuc2NoZW1hKVxuICAgICAgLy8gICAudGhlbihzY2hlbWEgPT4gdGhpcy5zY2hlbWEgPSByZXNvbHZlU2NoZW1hUmVmZXJlbmNlcyhcbiAgICAgIC8vICAgICBzY2hlbWEsIHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnksXG4gICAgICAvLyAgICAgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwXG4gICAgICAvLyAgICkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZURhdGEnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2Zvcm1WYWx1ZXMnXG4gICAqIGRlZnVsYXQgb3IgcHJldmlvdXNseSBzdWJtaXR0ZWQgdmFsdWVzIHVzZWQgdG8gcG9wdWxhdGUgZm9ybVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBkYXRhIC0gcmVjb21tZW5kZWRcbiAgICogMi4gbW9kZWwgLSBBbmd1bGFyIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDMuIGZvcm0udmFsdWUgLSBKU09OIEZvcm0gc3R5bGVcbiAgICogNC4gZm9ybS5kYXRhIC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIGZvcm1EYXRhIC0gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiA2LiBmb3JtLmZvcm1EYXRhIC0gRm9yIGVhc2llciB0ZXN0aW5nIG9mIFJlYWN0IEpTT04gU2NoZW1hIEZvcm1zXG4gICAqIDcuIChub25lKSBubyBkYXRhIC0gaW5pdGlhbGl6ZSBkYXRhIGZyb20gc2NoZW1hIGFuZCBsYXlvdXQgZGVmYXVsdHMgb25seVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplRGF0YSgpIHtcbiAgICBpZiAoaGFzVmFsdWUodGhpcy5kYXRhKSkge1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IF8uY2xvbmVEZWVwKHRoaXMuZGF0YSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdkYXRhJztcbiAgICB9IGVsc2UgaWYgKGhhc1ZhbHVlKHRoaXMubW9kZWwpKSB7XG4gICAgICB0aGlzLmpzZi5Bbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IF8uY2xvbmVEZWVwKHRoaXMubW9kZWwpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbW9kZWwnO1xuICAgIH0gZWxzZSBpZiAoaGFzVmFsdWUodGhpcy5uZ01vZGVsKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBfLmNsb25lRGVlcCh0aGlzLm5nTW9kZWwpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbmdNb2RlbCc7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGhhc1ZhbHVlKHRoaXMuZm9ybS52YWx1ZSkpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gXy5jbG9uZURlZXAodGhpcy5mb3JtLnZhbHVlKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm0udmFsdWUnO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSAmJiBoYXNWYWx1ZSh0aGlzLmZvcm0uZGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBfLmNsb25lRGVlcCh0aGlzLmZvcm0uZGF0YSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdmb3JtLmRhdGEnO1xuICAgIH0gZWxzZSBpZiAoaGFzVmFsdWUodGhpcy5mb3JtRGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm1EYXRhJztcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdmb3JtRGF0YScpICYmIGhhc1ZhbHVlKHRoaXMuZm9ybS5mb3JtRGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBfLmNsb25lRGVlcCh0aGlzLmZvcm0uZm9ybURhdGEpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybS5mb3JtRGF0YSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVMYXlvdXQnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2xheW91dCdcbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBhcnJheSBpbnB1dDpcbiAgICogMS4gbGF5b3V0IC0gcmVjb21tZW5kZWRcbiAgICogMi4gZm9ybSAtIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMy4gZm9ybS5mb3JtIC0gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0ubGF5b3V0IC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIChub25lKSBubyBsYXlvdXQgLSBzZXQgZGVmYXVsdCBsYXlvdXQgaW5zdGVhZFxuICAgKiAgICAoZnVsbCBsYXlvdXQgd2lsbCBiZSBidWlsdCBsYXRlciBmcm9tIHRoZSBzY2hlbWEpXG4gICAqXG4gICAqIEFsc28sIGlmIGFsdGVybmF0ZSBsYXlvdXQgZm9ybWF0cyBhcmUgYXZhaWxhYmxlLFxuICAgKiBpbXBvcnQgZnJvbSAnVUlTY2hlbWEnIG9yICdjdXN0b21Gb3JtSXRlbXMnXG4gICAqIHVzZWQgZm9yIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gYW5kIEpTT04gRm9ybSBBUEkgY29tcGF0aWJpbGl0eVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBVSVNjaGVtYSAtIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMi4gZm9ybS5VSVNjaGVtYSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBpbnB1dCBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiAyLiBmb3JtLmN1c3RvbUZvcm1JdGVtcyAtIEpTT04gRm9ybSBzdHlsZVxuICAgKiAzLiAobm9uZSkgbm8gaW5wdXQgLSBkb24ndCBpbXBvcnRcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUxheW91dCgpIHtcblxuICAgIC8vIFJlbmFtZSBKU09OIEZvcm0tc3R5bGUgJ29wdGlvbnMnIGxpc3RzIHRvXG4gICAgLy8gQW5ndWxhciBTY2hlbWEgRm9ybS1zdHlsZSAndGl0bGVNYXAnIGxpc3RzLlxuICAgIGNvbnN0IGZpeEpzb25Gb3JtT3B0aW9ucyA9IChsYXlvdXQ6IGFueSk6IGFueSA9PiB7XG4gICAgICBpZiAoaXNPYmplY3QobGF5b3V0KSB8fCBpc0FycmF5KGxheW91dCkpIHtcbiAgICAgICAgZm9yRWFjaChsYXlvdXQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bih2YWx1ZSwgJ29wdGlvbnMnKSAmJiBpc09iamVjdCh2YWx1ZS5vcHRpb25zKSkge1xuICAgICAgICAgICAgdmFsdWUudGl0bGVNYXAgPSB2YWx1ZS5vcHRpb25zO1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlLm9wdGlvbnM7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAndG9wLWRvd24nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYXlvdXQ7XG4gICAgfTtcblxuICAgIC8vIENoZWNrIGZvciBsYXlvdXQgaW5wdXRzIGFuZCwgaWYgZm91bmQsIGluaXRpYWxpemUgZm9ybSBsYXlvdXRcbiAgICBpZiAoaXNBcnJheSh0aGlzLmxheW91dCkpIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IF8uY2xvbmVEZWVwKHRoaXMubGF5b3V0KTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodGhpcy5mb3JtKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IF8uY2xvbmVEZWVwKHRoaXMuZm9ybSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmZvcm0gJiYgaXNBcnJheSh0aGlzLmZvcm0uZm9ybSkpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBmaXhKc29uRm9ybU9wdGlvbnMoXy5jbG9uZURlZXAodGhpcy5mb3JtLmZvcm0pKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5sYXlvdXQpKSB7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBfLmNsb25lRGVlcCh0aGlzLmZvcm0ubGF5b3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5qc2YubGF5b3V0ID0gWycqJ107XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFsdGVybmF0ZSBsYXlvdXQgaW5wdXRzXG4gICAgbGV0IGFsdGVybmF0ZUxheW91dDogYW55ID0gbnVsbDtcbiAgICBpZiAoaXNPYmplY3QodGhpcy5VSVNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIGFsdGVybmF0ZUxheW91dCA9IF8uY2xvbmVEZWVwKHRoaXMuVUlTY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ1VJU2NoZW1hJykpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIGFsdGVybmF0ZUxheW91dCA9IF8uY2xvbmVEZWVwKHRoaXMuZm9ybS5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAndWlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gXy5jbG9uZURlZXAodGhpcy5mb3JtLnVpU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdjdXN0b21Gb3JtSXRlbXMnKSkge1xuICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIGFsdGVybmF0ZUxheW91dCA9IGZpeEpzb25Gb3JtT3B0aW9ucyhfLmNsb25lRGVlcCh0aGlzLmZvcm0uY3VzdG9tRm9ybUl0ZW1zKSk7XG4gICAgfVxuXG4gICAgLy8gaWYgYWx0ZXJuYXRlIGxheW91dCBmb3VuZCwgY29weSBhbHRlcm5hdGUgbGF5b3V0IG9wdGlvbnMgaW50byBzY2hlbWFcbiAgICBpZiAoYWx0ZXJuYXRlTGF5b3V0KSB7XG4gICAgICBKc29uUG9pbnRlci5mb3JFYWNoRGVlcChhbHRlcm5hdGVMYXlvdXQsICh2YWx1ZSwgcG9pbnRlcikgPT4ge1xuICAgICAgICBjb25zdCBzY2hlbWFQb2ludGVyID0gcG9pbnRlclxuICAgICAgICAgIC5yZXBsYWNlKC9cXC8vZywgJy9wcm9wZXJ0aWVzLycpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcL3Byb3BlcnRpZXNcXC9pdGVtc1xcL3Byb3BlcnRpZXNcXC8vZywgJy9pdGVtcy9wcm9wZXJ0aWVzLycpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcL3Byb3BlcnRpZXNcXC90aXRsZU1hcFxcL3Byb3BlcnRpZXNcXC8vZywgJy90aXRsZU1hcC9wcm9wZXJ0aWVzLycpO1xuICAgICAgICBpZiAoaGFzVmFsdWUodmFsdWUpICYmIGhhc1ZhbHVlKHBvaW50ZXIpKSB7XG4gICAgICAgICAgbGV0IGtleSA9IEpzb25Qb2ludGVyLnRvS2V5KHBvaW50ZXIpO1xuICAgICAgICAgIGNvbnN0IGdyb3VwUG9pbnRlciA9IChKc29uUG9pbnRlci5wYXJzZShzY2hlbWFQb2ludGVyKSB8fCBbXSkuc2xpY2UoMCwgLTIpO1xuICAgICAgICAgIGxldCBpdGVtUG9pbnRlcjogc3RyaW5nIHwgc3RyaW5nW107XG5cbiAgICAgICAgICAvLyBJZiAndWk6b3JkZXInIG9iamVjdCBmb3VuZCwgY29weSBpbnRvIG9iamVjdCBzY2hlbWEgcm9vdFxuICAgICAgICAgIGlmIChrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ3VpOm9yZGVyJykge1xuICAgICAgICAgICAgaXRlbVBvaW50ZXIgPSBbLi4uZ3JvdXBQb2ludGVyLCAndWk6b3JkZXInXTtcblxuICAgICAgICAgIC8vIENvcHkgb3RoZXIgYWx0ZXJuYXRlIGxheW91dCBvcHRpb25zIHRvIHNjaGVtYSAneC1zY2hlbWEtZm9ybScsXG4gICAgICAgICAgLy8gKGxpa2UgQW5ndWxhciBTY2hlbWEgRm9ybSBvcHRpb25zKSBhbmQgcmVtb3ZlIGFueSAndWk6JyBwcmVmaXhlc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5LnNsaWNlKDAsIDMpLnRvTG93ZXJDYXNlKCkgPT09ICd1aTonKSB7IGtleSA9IGtleS5zbGljZSgzKTsgfVxuICAgICAgICAgICAgaXRlbVBvaW50ZXIgPSBbLi4uZ3JvdXBQb2ludGVyLCAneC1zY2hlbWEtZm9ybScsIGtleV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChKc29uUG9pbnRlci5oYXModGhpcy5qc2Yuc2NoZW1hLCBncm91cFBvaW50ZXIpICYmXG4gICAgICAgICAgICAhSnNvblBvaW50ZXIuaGFzKHRoaXMuanNmLnNjaGVtYSwgaXRlbVBvaW50ZXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQodGhpcy5qc2Yuc2NoZW1hLCBpdGVtUG9pbnRlciwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdhY3RpdmF0ZUZvcm0nIGZ1bmN0aW9uXG4gICAqXG4gICAqIC4uLmNvbnRpbnVlZCBmcm9tICdpbml0aWFsaXplU2NoZW1hJyBmdW5jdGlvbiwgYWJvdmVcbiAgICogSWYgJ3NjaGVtYScgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIChpLmUuIG5vIHNjaGVtYSBpbnB1dCBmb3VuZClcbiAgICogNi4gSWYgbGF5b3V0IGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0IGlucHV0XG4gICAqIDcuIElmIGRhdGEgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBkYXRhIGlucHV0XG4gICAqXG4gICAqIENyZWF0ZSBmaW5hbCBsYXlvdXQsXG4gICAqIGJ1aWxkIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGUgYW5kIHRoZSBBbmd1bGFyIEZvcm1Hcm91cCxcbiAgICogc3Vic2NyaWJlIHRvIGNoYW5nZXMsXG4gICAqIGFuZCBhY3RpdmF0ZSB0aGUgZm9ybS5cbiAgICovXG4gIHByaXZhdGUgYWN0aXZhdGVGb3JtKCkge1xuXG4gICAgLy8gSWYgJ3NjaGVtYScgbm90IGluaXRpYWxpemVkXG4gICAgaWYgKGlzRW1wdHkodGhpcy5qc2Yuc2NoZW1hKSkge1xuXG4gICAgICAvLyBUT0RPOiBJZiBmdWxsIGxheW91dCBpbnB1dCAod2l0aCBubyAnKicpLCBidWlsZCBzY2hlbWEgZnJvbSBsYXlvdXRcbiAgICAgIC8vIGlmICghdGhpcy5qc2YubGF5b3V0LmluY2x1ZGVzKCcqJykpIHtcbiAgICAgIC8vICAgdGhpcy5qc2YuYnVpbGRTY2hlbWFGcm9tTGF5b3V0KCk7XG4gICAgICAvLyB9IGVsc2VcblxuICAgICAgLy8gSWYgZGF0YSBpbnB1dCwgYnVpbGQgc2NoZW1hIGZyb20gZGF0YVxuICAgICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLmZvcm1WYWx1ZXMpKSB7XG4gICAgICAgIHRoaXMuanNmLmJ1aWxkU2NoZW1hRnJvbURhdGEoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzRW1wdHkodGhpcy5qc2Yuc2NoZW1hKSkge1xuXG4gICAgICAvLyBJZiBub3QgYWxyZWFkeSBpbml0aWFsaXplZCwgaW5pdGlhbGl6ZSBhanYgYW5kIGNvbXBpbGUgc2NoZW1hXG4gICAgICB0aGlzLmpzZi5jb21waWxlQWp2U2NoZW1hKCk7XG5cbiAgICAgIC8vIFVwZGF0ZSBhbGwgbGF5b3V0IGVsZW1lbnRzLCBhZGQgdmFsdWVzLCB3aWRnZXRzLCBhbmQgdmFsaWRhdG9ycyxcbiAgICAgIC8vIHJlcGxhY2UgYW55ICcqJyB3aXRoIGEgbGF5b3V0IGJ1aWx0IGZyb20gYWxsIHNjaGVtYSBlbGVtZW50cyxcbiAgICAgIC8vIGFuZCB1cGRhdGUgdGhlIEZvcm1Hcm91cCB0ZW1wbGF0ZSB3aXRoIGFueSBuZXcgdmFsaWRhdG9yc1xuICAgICAgdGhpcy5qc2YuYnVpbGRMYXlvdXQodGhpcy53aWRnZXRMaWJyYXJ5KTtcblxuICAgICAgLy8gQnVpbGQgdGhlIEFuZ3VsYXIgRm9ybUdyb3VwIHRlbXBsYXRlIGZyb20gdGhlIHNjaGVtYVxuICAgICAgdGhpcy5qc2YuYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZSh0aGlzLmpzZi5mb3JtVmFsdWVzKTtcblxuICAgICAgLy8gQnVpbGQgdGhlIHJlYWwgQW5ndWxhciBGb3JtR3JvdXAgZnJvbSB0aGUgRm9ybUdyb3VwIHRlbXBsYXRlXG4gICAgICB0aGlzLmpzZi5idWlsZEZvcm1Hcm91cCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmpzZi5mb3JtR3JvdXApIHtcblxuICAgICAgLy8gUmVzZXQgaW5pdGlhbCBmb3JtIHZhbHVlc1xuICAgICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLmZvcm1WYWx1ZXMpICYmXG4gICAgICAgIHRoaXMuanNmLmZvcm1PcHRpb25zLnNldFNjaGVtYURlZmF1bHRzICE9PSB0cnVlICYmXG4gICAgICAgIHRoaXMuanNmLmZvcm1PcHRpb25zLnNldExheW91dERlZmF1bHRzICE9PSB0cnVlXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IGhvdyB0byBkaXNwbGF5IGNhbGN1bGF0ZWQgdmFsdWVzIHdpdGhvdXQgY2hhbmdpbmcgb2JqZWN0IGRhdGFcbiAgICAgIC8vIFNlZSBodHRwOi8vdWxpb24uZ2l0aHViLmlvL2pzb25mb3JtL3BsYXlncm91bmQvP2V4YW1wbGU9dGVtcGxhdGluZy12YWx1ZXNcbiAgICAgIC8vIENhbGN1bGF0ZSByZWZlcmVuY2VzIHRvIG90aGVyIGZpZWxkc1xuICAgICAgLy8gaWYgKCFpc0VtcHR5KHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSkpIHtcbiAgICAgIC8vICAgZm9yRWFjaCh0aGlzLmpzZi5mb3JtR3JvdXAudmFsdWUsICh2YWx1ZSwga2V5LCBvYmplY3QsIHJvb3RPYmplY3QpID0+IHtcbiAgICAgIC8vICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gICAgICAgb2JqZWN0W2tleV0gPSB0aGlzLmpzZi5wYXJzZVRleHQodmFsdWUsIHZhbHVlLCByb290T2JqZWN0LCBrZXkpO1xuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSwgJ3RvcC1kb3duJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIC8vIFN1YnNjcmliZSB0byBmb3JtIGNoYW5nZXMgdG8gb3V0cHV0IGxpdmUgZGF0YSwgdmFsaWRhdGlvbiwgYW5kIGVycm9yc1xuICAgICAgdGhpcy5qc2YuZGF0YUNoYW5nZXMuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICB0aGlzLm9uQ2hhbmdlcy5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IGRhdGFbJzEnXSA6IGRhdGEpO1xuICAgICAgICBpZiAodGhpcy5mb3JtVmFsdWVzSW5wdXQgJiYgdGhpcy5mb3JtVmFsdWVzSW5wdXQuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAgIHRoaXNbYCR7dGhpcy5mb3JtVmFsdWVzSW5wdXR9Q2hhbmdlYF0uZW1pdCh0aGlzLm9iamVjdFdyYXAgPyBkYXRhWycxJ10gOiBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbiBvbiBzdGF0dXNDaGFuZ2VzIHRvIHNob3cgdXBkYXRlZCBlcnJvcnNcbiAgICAgIHRoaXMuanNmLmZvcm1Hcm91cC5zdGF0dXNDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpKTtcbiAgICAgIHRoaXMuanNmLmlzVmFsaWRDaGFuZ2VzLnN1YnNjcmliZShpc1ZhbGlkID0+IHRoaXMuaXNWYWxpZC5lbWl0KGlzVmFsaWQpKTtcbiAgICAgIHRoaXMuanNmLnZhbGlkYXRpb25FcnJvckNoYW5nZXMuc3Vic2NyaWJlKGVyciA9PiB0aGlzLnZhbGlkYXRpb25FcnJvcnMuZW1pdChlcnIpKTtcblxuICAgICAgLy8gT3V0cHV0IGZpbmFsIHNjaGVtYSwgZmluYWwgbGF5b3V0LCBhbmQgaW5pdGlhbCBkYXRhXG4gICAgICB0aGlzLmZvcm1TY2hlbWEuZW1pdCh0aGlzLmpzZi5zY2hlbWEpO1xuICAgICAgdGhpcy5mb3JtTGF5b3V0LmVtaXQodGhpcy5qc2YubGF5b3V0KTtcbiAgICAgIHRoaXMub25DaGFuZ2VzLmVtaXQodGhpcy5vYmplY3RXcmFwID8gdGhpcy5qc2YuZGF0YVsnMSddIDogdGhpcy5qc2YuZGF0YSk7XG5cbiAgICAgIC8vIElmIHZhbGlkYXRlT25SZW5kZXIsIG91dHB1dCBpbml0aWFsIHZhbGlkYXRpb24gYW5kIGFueSBlcnJvcnNcbiAgICAgIGNvbnN0IHZhbGlkYXRlT25SZW5kZXIgPVxuICAgICAgICBKc29uUG9pbnRlci5nZXQodGhpcy5qc2YsICcvZm9ybU9wdGlvbnMvdmFsaWRhdGVPblJlbmRlcicpO1xuICAgICAgaWYgKHZhbGlkYXRlT25SZW5kZXIpIHsgLy8gdmFsaWRhdGVPblJlbmRlciA9PT0gJ2F1dG8nIHx8IHRydWVcbiAgICAgICAgY29uc3QgdG91Y2hBbGwgPSAoY29udHJvbCkgPT4ge1xuICAgICAgICAgIGlmICh2YWxpZGF0ZU9uUmVuZGVyID09PSB0cnVlIHx8IGhhc1ZhbHVlKGNvbnRyb2wudmFsdWUpKSB7XG4gICAgICAgICAgICBjb250cm9sLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgT2JqZWN0LmtleXMoY29udHJvbC5jb250cm9scyB8fCB7fSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGtleSA9PiB0b3VjaEFsbChjb250cm9sLmNvbnRyb2xzW2tleV0pKTtcbiAgICAgICAgfTtcbiAgICAgICAgdG91Y2hBbGwodGhpcy5qc2YuZm9ybUdyb3VwKTtcbiAgICAgICAgdGhpcy5pc1ZhbGlkLmVtaXQodGhpcy5qc2YuaXNWYWxpZCk7XG4gICAgICAgIHRoaXMudmFsaWRhdGlvbkVycm9ycy5lbWl0KHRoaXMuanNmLmFqdkVycm9ycyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=