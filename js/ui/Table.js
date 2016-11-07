define(["./UIBase", "../base/Utils"], function (_UIBase, _Utils) {
    "use strict";

    var Utils = _interopRequireWildcard(_Utils);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    // TODO: the whole table architecture probably needs a rethinking
    _UIBase.UI.TableRow = function (_UI$Element) {
        _inherits(TableRow, _UI$Element);

        function TableRow() {
            _classCallCheck(this, TableRow);

            return _possibleConstructorReturn(this, (TableRow.__proto__ || Object.getPrototypeOf(TableRow)).apply(this, arguments));
        }

        _createClass(TableRow, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "tr";
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                var rowCells = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.options.columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var column = _step.value;

                        rowCells.push(this.renderEntryCell(column));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return rowCells;
            }
        }, {
            key: "renderEntryCell",
            value: function renderEntryCell(column) {
                return _UIBase.UI.createElement(
                    "td",
                    { style: column.cellStyle, key: column.id },
                    column.value(this.options.entry, this.options.index)
                );
            }
        }]);

        return TableRow;
    }(_UIBase.UI.Element);

    _UIBase.UI.TableRowInCollapsibleTable = function (_UI$TableRow) {
        _inherits(TableRowInCollapsibleTable, _UI$TableRow);

        function TableRowInCollapsibleTable() {
            _classCallCheck(this, TableRowInCollapsibleTable);

            return _possibleConstructorReturn(this, (TableRowInCollapsibleTable.__proto__ || Object.getPrototypeOf(TableRowInCollapsibleTable)).apply(this, arguments));
        }

        _createClass(TableRowInCollapsibleTable, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "tbody";
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return _UIBase.UI.createElement(
                    "tr",
                    null,
                    _get(TableRowInCollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(TableRowInCollapsibleTable.prototype), "renderHTML", this).call(this)
                );
            }
        }]);

        return TableRowInCollapsibleTable;
    }(_UIBase.UI.TableRow);

    _UIBase.UI.CollapsibleTableRow = function (_UI$TableRow2) {
        _inherits(CollapsibleTableRow, _UI$TableRow2);

        function CollapsibleTableRow(options) {
            _classCallCheck(this, CollapsibleTableRow);

            var _this3 = _possibleConstructorReturn(this, (CollapsibleTableRow.__proto__ || Object.getPrototypeOf(CollapsibleTableRow)).call(this, options));

            if (options.collapsed != null) {
                _this3.collapsed = options.collapsed;
            } else {
                _this3.collapsed = true;
            }
            return _this3;
        }

        _createClass(CollapsibleTableRow, [{
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "tbody";
            }
        }, {
            key: "onMount",
            value: function onMount() {
                var _this4 = this;

                this.collapseButton.addClickListener(function (event) {
                    _this4.collapsed = _this4.collapsed != true;
                    _this4.collapseButton.toggleClass("collapsed");
                    // TODO (@kira): Find out how to do this
                    _this4.collapsible.element.collapse("toggle");
                });
            }
        }, {
            key: "redraw",
            value: function redraw() {
                if (!_get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "redraw", this).call(this)) {
                    return false;
                }

                if (this.collapsed) {
                    this.collapseButton.addClass("collapsed");
                    this.collapsible.removeClass("in");
                } else {
                    this.collapseButton.removeClass("collapsed");
                    this.collapsible.addClass("in");
                }
                return true;
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                var noPaddingHiddenRowStyle = {
                    padding: 0
                };

                var rowCells = _get(CollapsibleTableRow.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTableRow.prototype), "renderHTML", this).call(this);

                return [_UIBase.UI.createElement(
                    "tr",
                    { className: "panel-heading" },
                    rowCells
                ), _UIBase.UI.createElement(
                    "tr",
                    null,
                    _UIBase.UI.createElement(
                        "td",
                        { style: noPaddingHiddenRowStyle, colspan: this.options.columns.length },
                        _UIBase.UI.createElement(
                            "div",
                            { ref: "collapsible", className: "collapse" },
                            this.renderCollapsible(this.options.entry)
                        )
                    )
                )];
            }
        }]);

        return CollapsibleTableRow;
    }(_UIBase.UI.TableRow);

    _UIBase.UI.Table = function (_UI$Element2) {
        _inherits(Table, _UI$Element2);

        function Table() {
            _classCallCheck(this, Table);

            return _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
        }

        _createClass(Table, [{
            key: "setOptions",
            value: function setOptions(options) {
                _get(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "setOptions", this).call(this, options);

                this.setColumns(options.columns || []);
                this.entries = options.entries || [];
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                var attr = _get(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), "getDOMAttributes", this).call(this);

                attr.addClass("ui-table table table-stripped");

                return attr;
            }
        }, {
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return "table";
            }
        }, {
            key: "getRowClass",
            value: function getRowClass() {
                return _UIBase.UI.TableRow;
            }
        }, {
            key: "getRowOptions",
            value: function getRowOptions(entry) {
                return {
                    entry: entry,
                    columns: this.columns
                };
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return [_UIBase.UI.createElement(
                    "thead",
                    null,
                    this.renderTableHead()
                ), _UIBase.UI.createElement(
                    "tbody",
                    null,
                    this.renderTableBody()
                )];
            }
        }, {
            key: "renderTableHead",
            value: function renderTableHead() {
                return _UIBase.UI.createElement(
                    "tr",
                    null,
                    this.columns.map(this.renderHeaderCell, this)
                );
            }
        }, {
            key: "getEntryKey",
            value: function getEntryKey(entry, index) {
                return entry.id || index;
            }
        }, {
            key: "renderTableBody",
            value: function renderTableBody() {
                this.rows = [];

                var entries = this.getEntries();
                for (var i = 0; i < entries.length; i += 1) {
                    var entry = entries[i];
                    var RowClass = this.getRowClass(entry);
                    this.rows.push(_UIBase.UI.createElement(RowClass, _extends({ key: this.getEntryKey(entry, i), index: i }, this.getRowOptions(entry), { parent: this })));
                }
                return this.rows;
            }
        }, {
            key: "renderHeaderCell",
            value: function renderHeaderCell(column) {
                return _UIBase.UI.createElement(
                    "th",
                    { style: column.headerStyle, ref: "columnHeader" + column.id },
                    this.renderColumnHeader(column)
                );
            }
        }, {
            key: "renderColumnHeader",
            value: function renderColumnHeader(column) {
                if (typeof column.headerName === "function") {
                    return column.headerName();
                }
                return column.headerName;
            }
        }, {
            key: "getEntries",
            value: function getEntries() {
                return this.entries || [];
            }
        }, {
            key: "columnDefaults",
            value: function columnDefaults(column, index) {
                column.id = index;
            }
        }, {
            key: "setColumns",
            value: function setColumns(columns) {
                this.columns = columns;
                for (var i = 0; i < this.columns.length; i += 1) {
                    this.columnDefaults(this.columns[i], i);
                }
            }
        }]);

        return Table;
    }(_UIBase.UI.Element);

    _UIBase.UI.SortableTableInterface = function (BaseTableClass) {
        return function (_BaseTableClass) {
            _inherits(SortableTable, _BaseTableClass);

            function SortableTable() {
                _classCallCheck(this, SortableTable);

                return _possibleConstructorReturn(this, (SortableTable.__proto__ || Object.getPrototypeOf(SortableTable)).apply(this, arguments));
            }

            _createClass(SortableTable, [{
                key: "setOptions",
                value: function setOptions(options) {
                    _get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "setOptions", this).call(this, options);

                    this.columnSortingOrder = options.columnSortingOrder || [];
                }
            }, {
                key: "getDOMAttributes",
                value: function getDOMAttributes() {
                    var attr = _get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "getDOMAttributes", this).call(this);

                    attr.addClass("ui-sortable-table");

                    return attr;
                }
            }, {
                key: "onMount",
                value: function onMount() {
                    var _this7 = this;

                    _get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "onMount", this).call(this);

                    // TODO: fix multiple clicks registered here
                    // Sort table by clicked column
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        var _loop = function _loop() {
                            var column = _step2.value;

                            _this7["columnHeader" + column.id].addClickListener(function () {
                                _this7.sortByColumn(column);
                            });
                        };

                        for (var _iterator2 = this.columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            _loop();
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            }, {
                key: "renderColumnHeader",
                value: function renderColumnHeader(column) {
                    var iconStyle = { position: "absolute", right: "0px", bottom: "0px" };
                    var sortIcon = _UIBase.UI.createElement("i", { className: "sort-icon fa fa-sort", style: iconStyle });
                    if (this.sortBy === column) {
                        if (this.sortDescending) {
                            sortIcon = _UIBase.UI.createElement("i", { className: "sort-icon fa fa-sort-desc", style: iconStyle });
                        } else {
                            sortIcon = _UIBase.UI.createElement("i", { className: "sort-icon fa fa-sort-asc", style: iconStyle });
                        }
                    }

                    return _UIBase.UI.createElement(
                        "div",
                        { style: { position: "relative" } },
                        _get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "renderColumnHeader", this).call(this, column),
                        " ",
                        sortIcon
                    );
                }
            }, {
                key: "sortByColumn",
                value: function sortByColumn(column) {
                    if (column === this.sortBy) {
                        this.sortDescending = this.sortDescending != true;
                    } else {
                        this.sortDescending = true;
                    }

                    this.sortBy = column;

                    this.redraw();
                }
            }, {
                key: "sortEntries",
                value: function sortEntries(entries) {
                    var _this8 = this;

                    if (!this.sortBy && this.columnSortingOrder.length === 0) {
                        return entries;
                    }

                    var colCmp = function colCmp(a, b, col) {
                        if (!col) return 0;

                        var keyA = col.rawValue ? col.rawValue(a) : col.value(a);
                        var keyB = col.rawValue ? col.rawValue(b) : col.value(b);
                        return col.cmp(keyA, keyB);
                    };

                    var sortedEntries = entries.slice();

                    sortedEntries.sort(function (a, b) {
                        var cmpRes = void 0;

                        if (_this8.sortBy) {
                            cmpRes = colCmp(a, b, _this8.sortBy);
                            if (cmpRes !== 0) {
                                return _this8.sortDescending ? -cmpRes : cmpRes;
                            }
                        }

                        for (var i = 0; i < _this8.columnSortingOrder.length; i += 1) {
                            cmpRes = colCmp(a, b, _this8.columnSortingOrder[i]);
                            if (_this8.columnSortingOrder[i].sortDescending) {
                                cmpRes = -cmpRes;
                            }

                            if (cmpRes !== 0) {
                                return cmpRes;
                            }
                        }
                        return 0;
                    });
                    return sortedEntries;
                }
            }, {
                key: "getEntries",
                value: function getEntries() {
                    return this.sortEntries(_get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "getEntries", this).call(this));
                }
            }, {
                key: "columnDefaults",
                value: function columnDefaults(column, index) {
                    _get(SortableTable.prototype.__proto__ || Object.getPrototypeOf(SortableTable.prototype), "columnDefaults", this).call(this, column, index);

                    if (!column.hasOwnProperty("cmp")) {
                        column.cmp = Utils.defaultComparator;
                    }
                }
            }]);

            return SortableTable;
        }(BaseTableClass);
    };

    _UIBase.UI.SortableTable = _UIBase.UI.SortableTableInterface(_UIBase.UI.Table);

    _UIBase.UI.CollapsibleTableInterface = function (BaseTableClass) {
        return function (_BaseTableClass2) {
            _inherits(CollapsibleTable, _BaseTableClass2);

            function CollapsibleTable() {
                _classCallCheck(this, CollapsibleTable);

                return _possibleConstructorReturn(this, (CollapsibleTable.__proto__ || Object.getPrototypeOf(CollapsibleTable)).apply(this, arguments));
            }

            _createClass(CollapsibleTable, [{
                key: "setOptions",
                value: function setOptions(options) {
                    _get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setOptions", this).call(this, options);

                    if (options.renderCollapsible) {
                        this.renderCollapsible = options.renderCollapsible;
                    }
                }
            }, {
                key: "renderHTML",
                value: function renderHTML() {
                    return [_UIBase.UI.createElement(
                        "thead",
                        null,
                        this.renderTableHead()
                    ), this.renderTableBody()];
                }
            }, {
                key: "getRowClass",
                value: function getRowClass() {
                    return _UIBase.UI.CollapsibleTableRow;
                }
            }, {
                key: "getDOMAttributes",
                value: function getDOMAttributes() {
                    var attr = _get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "getDOMAttributes", this).call(this);
                    attr.addClass("ui-collapsible-table");
                    return attr;
                }
            }, {
                key: "setColumns",
                value: function setColumns(columns) {
                    var _this10 = this;

                    var collapseColumn = {
                        value: function value(entry) {
                            var rowClass = _this10.getRowClass(entry);
                            // TODO: Fix it lad!
                            if (rowClass === _UIBase.UI.CollapsibleTableRow || rowClass.prototype instanceof _UIBase.UI.CollapsibleTableRow) {
                                return _UIBase.UI.createElement("a", { ref: "collapseButton", className: "rowCollapseButton collapsed" });
                            }
                            return _UIBase.UI.createElement("a", { ref: "collapseButton" });
                        },
                        cellStyle: {
                            width: "1%",
                            "whiteSpace": "nowrap"
                        }
                    };

                    _get(CollapsibleTable.prototype.__proto__ || Object.getPrototypeOf(CollapsibleTable.prototype), "setColumns", this).call(this, [collapseColumn].concat(columns));
                }
            }]);

            return CollapsibleTable;
        }(BaseTableClass);
    };

    _UIBase.UI.CollapsibleTable = _UIBase.UI.CollapsibleTableInterface(_UIBase.UI.Table);
});
