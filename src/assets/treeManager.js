$.widget("custom.treeManager", {
    options: {
        pathAction: null, // Path to tree-action script. Required
        inputId: null, // Only for tree input
        defaultActiveId: null, // Select nodes on init by default
        messages: {
            newCategory: 'Новая категория',
            youNotChooseCategory: 'Вы не выбрали категорию из списка.',
            categoryNotChoose: 'Не выбрана категория.',
            categoryHasChildren: 'У категории есть вложенные категории.',
            deleteCategory: 'Удалить категорию "{categoryName}"?',
            cantDeleteCategory: 'Не удалось удaлить категорию.',
            cantCreateRootCategory: 'Нельзя создать корневую категорию.'
        },
        dnd: {
            preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
            preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
            autoExpandMS: 1000 // Expand nodes after n milliseconds of hovering.
        },
        filter: {
            autoApply: true, // Re-apply last filter if lazy data is loaded
            autoExpand: true, // Expand all branches that contain matches while filtered
            counter: true, // Show a badge with number of matching child nodes near parent icons
            fuzzy: true, // Match single characters in order, e.g. 'fb' will match 'FooBar'
            hideExpandedCounter: false, // Hide counter badge if parent is expanded
            hideExpanders: false, // Hide expanders if all child nodes are hidden by filter
            highlight: true, // Highlight matches by wrapping inside <mark> tags
            leavesOnly: false, // Match end nodes only
            nodata: true, // Display a 'no data' status node if result is empty
            mode: "hide" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
        },
        firstNodeDefault: true, // Select first node on init, if has not active node
        canAddRoot: true, // Allow add root node
        canDragToRoot: false, // Make node is root, if dnd enabled
        highlightQuantity: true, // Highlight quantity by wrapping inside <small> tags, if name of node like: "some name (quantity)", where quantity is numeric. See TreeManagerAction -> treeQueryScopes
        useEditForm: true, // Add quick edit form
        multiple: false, // Select multiple nodes
    },
    treeWidget: null,

    _create: function () {
        if (! this.options.pathAction) {
            alert('PathAction option required!');
        } else {
            this._initTree();
            this._initSearch();
            if (this.options.useEditForm) {
                this._initTreeActions();
                this._initFormActions()
            }
        }
    },
    _initTree: function () {
        var self = this;
        var url = self._makeActionUrl(self.options.pathAction, 'action', 'tree');
        var targetId = self.options.defaultActiveId ? self.options.defaultActiveId : (self.options.firstNodeDefault ? null : -1);
        if (targetId !== null) url = this._makeActionUrl(url, 'targetId', targetId);

        var options = {
            source: {url: url, cache: false},
            dnd: this.options.dnd,
            quicksearch: this.options.filter ? true : false,
            filter: this.options.filter,
            activate: function(event, data) {
                var node = data.node;

                if (self.options.useEditForm) {
                    self._formEditRefresh(node.data.id, node.data.hitId);
                }
                if (self.options.inputId && ! self.options.multiple) {
                    self._updateInput(node.data.id);
                    self._updateToggleButton(self._trimTitle(node.title), true);
                }
            },
            init: function(event, data) {
                var node = $(this).fancytree('getActiveNode');

                if (! node && self.options.firstNodeDefault && ! self.options.multiple){
                    node = $(this).fancytree('getRootNode').getFirstChild();
                    node.setActive();
                }

                if (self.options.useEditForm) {
                    self._formEditRefresh(node.data.id);
                }

                if (self.options.inputId) {
                     if (self.options.multiple) {
                         var defaultIds = self.options.defaultActiveId;

                         if (defaultIds) {
                             var ids = defaultIds.split(',');
                             self.setSelected(ids);
                         } else {
                             self._updateToggleButton();
                         }
                     } else if (node) {
                         self._updateToggleButton(self._trimTitle(node.title));
                    } else {
                        self._updateToggleButton();
                    }
                }
            }
        };

        if (options.dnd) {
            options.dnd.dragStart = function(node, data) {
                return true;
            };
            options.dnd.dragEnter = function(node, data) {
                if (node.getLevel() <= 1 && ! self.options.canDragToRoot) return false;  // Do not drag to root
                if (! data.otherNode.data.id) return false; // Do not drag new nodes
                return true;
            };
            options.dnd.dragDrop = function(node, data) {
                $.get(self.options.pathAction, {action: "move", mode: data.hitMode, targetId: data.otherNode.data.id, hitId: node.data.id}, function(result) {
                    if (result.success) {
                        data.otherNode.moveTo(node, data.hitMode);
                        if (data.hitMode == "over") node.setExpanded(true);
                    } else if (result.message) {
                        alert(result.message);
                    }
                }).fail(function() {
                    alert("Move action error");
                });
            }
        }

        if (self.options.multiple) {
            options.checkbox = true;
            options.select = function(event, data) {
                var nodes = data.tree.getSelectedNodes();
                var titles = [], ids = [];
                $.each( nodes, function( key, node ) {
                    titles.push(self._trimTitle(node.title));
                    ids.push(node.data.id);
                });

                self._updateToggleButton(titles.join(", "));
                self._updateInput(ids.join(","));
            };
        }

        if (self.options.highlightQuantity) {
            options.renderNode = function(event, data) {
                var node = data.node;
                var title = $(node.span).find("> span.fancytree-title").html();
                var count = title.match(/(\(\d+(\/\d+){0,1}\))$/);

                if (count) {
                    title = title.replace(count[0], "<small>" + count[0] + "</small>");
                    $(node.span).find("> span.fancytree-title").html(title);
                }
            }
        }

        var extensions = [];
        if (self.options.filter) extensions.push("filter");
        if (self.options.dnd) extensions.push("dnd");

        options.extensions = extensions;

        this.element.fancytree(options);
        self.treeWidget = this.element.fancytree("getTree");

        this.element.find(".fancytree-container").addClass("fancytree-connectors");
    },
    _initSearch: function () {
        if (this.options.filter) {
            var self = this;
            var input = self.element.closest('.tree-container').find(".tree-search-input");
            var reset = self.element.closest('.tree-container').find(".tree-search-reset");

            input.keyup(function(e){
                var n,
                    opts = self.options.filter,
                    filterFunc = self.options.filter.leavesOnly ? self.treeWidget.filterBranches : self.treeWidget.filterNodes,
                    match = $(this).val();

                if(e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === ""){
                    reset.click();
                    return;
                }

                // Pass a string to perform case insensitive matching
                n = filterFunc.call(self.treeWidget, match, opts);
                //$("span#matches").text("(" + n + " найдено)");

                reset.attr("disabled", false);
            }).focus();

            reset.click(function(e){
                input.val("");
                self.treeWidget.clearFilter();
            }).attr("disabled", true);
        }
    },
    _initTreeActions: function () {
        var self = this;

        self.element.closest('.tree-manager-widget').find(".tree-add-new-category").on("click", function () {
            var node = self.treeWidget.getActiveNode();

            if (! node) {
                alert(self.options.messages.youNotChooseCategory);
            } else if (self.options.canAddRoot && node.getLevel() <= 1) {
                alert(self.options.messages.cantCreateRootCategory);
            } else {
                self.treeWidget.activateKey(false);
                var newData = {title: self.options.messages.newCategory, icon: false, active: true, hitId: node.data.id};
                node.appendSibling(newData);

                var nodeNew = self.treeWidget.getActiveNode();
                nodeNew.addClass("fancytree-node-new");

                self._formEditRefresh(null, node.data.id, function(){ self.element.closest('.tree-manager-widget').find(".tree-edit-form form input").first().focus(); });
            }
        });
        self.element.closest('.tree-manager-widget').find(".tree-remove-single-category").on("click", function () {
            var node = self.treeWidget.getActiveNode();

            if (! node) {
                alert(self.options.messages.youNotChooseCategory);
            } else {
                if (node.hasChildren()) {
                    alert(self.options.messages.categoryHasChildren);
                } else if (node.data.id) {
                    var confirmation = confirm(self.options.messages.deleteCategory.replace("{categoryName}", node.title));
                    if (confirmation == true) {
                        $.get(self.options.pathAction, {action: "delete", targetId: node.data.id}, function (result) {
                            if (result.success) {
                                node.remove();
                                self._formEditRefresh();
                            } else {
                                alert(self.options.messages.cantDeleteCategory + " " + result.message);
                            }
                        }, "json").fail(function() {
                            alert("Fatal error!");
                        });
                    }
                } else {
                    node.remove();
                    self._formEditRefresh();
                }
            }
        });
    },
    _initFormActions: function () {
        var self = this;

        self.element.closest('.tree-manager-widget').find(".tree-form-edit-cancel").on("click", function () {
            var node = self.treeWidget.getActiveNode();
            self._formEditRefresh(node.data.id);
        });

        self.element.closest('.tree-manager-widget').find(".tree-edit-form form").on("submit", function () {
            $.post($(this).attr("action"), $(this).serialize(), function(result){
                self.element.closest('.tree-manager-widget').find(".tree-edit-form").html(result.html);

                if (result.success) {
                    self.treeWidget.reload({
                        url: self._makeActionUrl(self._makeActionUrl(self.options.pathAction, 'action', 'tree'), 'targetId', result.id)
                    });
                }
            }, "json").fail(function() {
                alert("Fatal error");
            });

            return false;
        });
    },
    _formEditRefresh: function (id, hitId, callback) {
        var self = this;
        var form = this.element.closest('.tree-manager-widget').find(".tree-edit-form");

        if (! id && ! hitId) {
            form.html(self.options.messages.categoryNotChoose);
            return;
        }

        form.html('<div class="loader"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>');

        $.get(self.options.pathAction, {action: "load", targetId: id, hitId: hitId}, function(result){
            form.html(result.html);
            if (callback) callback();

            self._initFormActions();
        }, "json").fail(function() {
            alert("Fatal error!");
        });
    },
    _makeActionUrl: function (base, key, value) {
        var sep = (base.indexOf('?') > -1) ? '&' : '?';
        return base + sep + key + '=' + value;
    },
    _trimTitle: function (title) {
        if (this.options.highlightQuantity) {
            var count = title.match(/(\(\d+\/\d+\))$/);
            if (count) {
                title = title.replace(count[0], "");
            }
        }

        return title;
    },
    _updateInput: function (id) {
        $("#" + this.options.inputId).val(id);
        $( document ).trigger( "treemanager:selected", [ id ] );
    },
    _updateToggleButton: function (title, hide) {
        var button = this.element.closest('.tree-input-dropdown').find('.tree-input-dropdown-toggle');

        if (! title) title = this.options.messages.categoryNotChoose;

        button.html('<i class="glyphicon glyphicon-chevron-down"></i>&nbsp;&nbsp;&nbsp; ' + title);

        if (hide == true) $( button.attr('href') ).collapse("hide");
    },

    setActive: function (activeId) {
        var self = this;

        self.element.fancytree("getTree").visit(function(node){
            if(node.data.id == activeId) {
                node.setActive();
                self._updateToggleButton(self._trimTitle(node.title));
            }
        });
    },
    setSelected: function (ids) {
        var self = this;
        var titles = [];

        ids = $.map(ids, function(val,i) {
            return parseInt(val);
        });

        self.element.fancytree("getTree").visit(function(node) {
            if(jQuery.inArray( parseInt(node.data.id), ids ) > -1) {
                node.setSelected();
                titles.push(self._trimTitle(node.title));
            }
        });

        self._updateToggleButton(titles);
    }
});
