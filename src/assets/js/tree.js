$.widget("kr0lik.tree", {
    nodeToLoadId: [],
    nodeToSelectId: [],

    treeContainerClass: '.tree-container',
    treeSearchInputClass: '.tree-search-input',
    treeSearchResetClass: '.tree-search-reset',
    treeSearchMatchesClass: '.tree-search-matches',

    options: {
        pathAction: null,
        activeId: null,
        selectId: [],
        plugins: [],

        dnd5: null,
        filter: {
            autoApply: true, // Re-apply last filter if lazy data is loaded
            autoExpand: true, // Expand all branches that contain matches while filtered
            counter: false, // Show a badge with number of matching child nodes near parent icons
            fuzzy: true, // Match single characters in order, e.g. 'fb' will match 'FooBar'
            hideExpandedCounter: false, // Hide counter badge if parent is expanded
            hideExpanders: false, // Hide expanders if all child nodes are hidden by filter
            highlight: true, // Highlight matches by wrapping inside <mark> tags
            leavesOnly: false, // Match end nodes only
            nodata: true, // Display a 'no data' status node if result is empty
            mode: "dimm", // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
        },
        quicksearch: true,
        extensions: ['filter'],
        checkbox: false,
        selectMode: 0,
    },
    _create: function() {
        this._validate();
        this._initTree();
        this._initSearch();
        this._initSelections();

        return this;
    },
    _refresh: function() {
        // Trigger a callback/event
        this._trigger( "change" );
    },
    _setOptions: function() {
        this._superApply( arguments );
    },
    _setOption: function($key, $value) {
        this._super($key, $value);
    },

    // base
    _validate: function () {
        if (!this.options.pathAction) {
            this.showError('PathAction option required!');

            this._destroy();
        }
    },
    _getOptions: function() {
        return {
            source: {
                url: this.options.pathAction,
                data: {action: "getRoots"},
                cache: false
            },
            lazyLoad: ($event, $data) => {
                var $node = $data.node;
                // Load child nodes via Ajax GET /tree?action=getChildrens&targetId=1234
                $data.result = {
                    url: this.options.pathAction,
                    data: {action: "getChildrens", targetId: $node.data.id},
                    cache: false
                };
            },
            postProcess: ($event, $data) => {
                var $response = $data.response;
                var $node = $data.node;

                if($response.success === true) {
                    $node.addNode($response.data);
                } else {
                    $data.result = {
                        error: "ERROR #" + $response.faultCode + ": " + $response.faultMsg
                    }
                }
            },
            dnd5: this.options.dnd5,
            filter: this.options.filter,
            quicksearch: this.options.quicksearch,
            extensions: this.options.extensions,
            checkbox: this.options.checkbox,
            selectMode: this.options.selectMode,
            renderNode: ($event, $data) => {
                var $node = $data.node;

                // Load on render
                this.loadNode($node);

                if ($node.titleWithHighlight && $node.match) {
                    $($node.span).find('span.fancytree-title').html($node.titleWithHighlight);
                }
            },
            renderTitle: ($event, $data) => {
                var $node = $data.node;

                let $spanTitle = '<span class="fancytree-title">' + $node.title + '</span>',
                    $spanCounter = '';

                if ($node.data.countAll != null || $node.data.countActive != null) {
                    let $str = '';
                    if ($node.data.countAll !== null) { $str += $node.data.countAll }
                    if ($node.data.countActive !== null) {
                        if ($str !== '') { $str += '/' }
                        $str += $node.data.countActive;
                    }

                    $spanCounter = '<small class="fancytree-count">(' + $str + ')</small>';
                }

                return $spanTitle + $spanCounter
            },
            icon: ($event, $data) => {
                var $node = $data.node;

                if ($node.getLevel() === 1) {
                    return 'fa fa-tree';
                }

                if($node.isFolder()) {
                    return 'fa fa-tags';
                }

                return false;
            },
            select: ($event, $data) => {
                var $node = $data.node;

                let $selectedNodes = $data.tree.getSelectedNodes();
                this.options.selectId = $.map($selectedNodes, function($selectedNode){
                    return $selectedNode.data.id;
                });

                this.options.plugins.forEach(function(plugin){
                    plugin.select($node);
                });
            },
            activate: ($event, $data) => {
                var $node = $data.node;

                if (!$node.isLoaded() && !$node.isLoading()) {
                    $node.load(false);
                }

                this.options.activeId = $node.data.id;

                this.options.plugins.forEach(function(plugin){
                    plugin.activate($node);
                });
            },
            // focus: ($event, $data) => {
            //     let $node = $data.node;
            //
            //     this.options.plugins.forEach(function(plugin){
            //         plugin.focus($node);
            //     });
            // },
        };
    },
    _initTree: function () {
        this.element.fancytree(this._getOptions());
    },
    getTree: function () {
        return $.ui.fancytree.getTree(this.element);
    },
    getActiveNode: function () {
        return this.getTree().getActiveNode();
    },
    getSelectedNodes: function () {
        return this.getTree().getSelectedNodes();
    },
    unSelectAll: function () {
        this.getTree().selectAll(false);
    },
    getRootNode: function () {
        return this.getTree().getRootNode();
    },
    showMessage: function ($message) {
        alert($message);
    },
    showError: function ($message) {
        alert($message);
    },

    // app
    getMainContainer: function () {
        return $(this.element);
    },
    getTreeContainer: function () {
        return this.getMainContainer().find(this.treeContainerClass);
    },
    _initSelections: function () {
        var $self = this;

        this.nodeToSelectId = $.map(this.options.selectId, function($id){
            return String($id);
        });

        let $ids = [...this.nodeToSelectId];
        $ids.push(this.options.activeId);
        $ids = [...new Set($ids)];
        $ids = $ids.filter(Boolean);

        $.each($ids, function($index, $id) {
            $.get($self.options.pathAction, {action: 'getParents', targetId: $id}, function ($result) {
                if ($result.success) {
                    let $needIds = $result.data.map(function callback($parentNode) {
                        return $parentNode.data.id;
                    });

                    $self.nodeToLoadId = $self.nodeToLoadId.concat($needIds);
                    $self.nodeToLoadId = [...new Set($self.nodeToLoadId)];
                    $self.nodeToLoadId = $self.nodeToLoadId.filter(Boolean);

                    let $root = $self.getRootNode();
                    let $nodes = $root.children;

                    $.each($nodes, function($index, $node) {
                        $self.loadNode($node);
                    });
                } else {
                    $self.showError($result.message);
                }
            }, "json").fail(function($response) {
                $self.showError($response.responseJSON.message);
            });
        });
    },
    _initSearch: function () {
        var $self = this,
            $tree = this.getTree();

        $($self.treeSearchInputClass).on("keyup", function(e){
            let $count,
                $opts = $self.options.filter,
                $filterFunc = $self.options.filter.leavesOnly ? $tree.filterBranches : $tree.filterNodes,
                $match = $(this).val();

            if (e && e.which === $.ui.keyCode.ESCAPE || $.trim($match) === "") {
                $($self.treeSearchResetClass).click();
                return;
            }

            $count = $filterFunc.call($tree, $match, $opts);

            $($self.treeSearchResetClass).attr("disabled", false);
            $($self.treeSearchMatchesClass).text(' ' + $count);
        }).focus();

        $($self.treeSearchResetClass).click(function(e){
            $($self.treeSearchInputClass).val('');
            $($self.treeSearchMatchesClass).text('');
            $tree.clearFilter();
        }).attr("disabled", true);
    },
    getParentNodes: function ($node) {
        let $parentNodes = [],
            $parent = $node.parent;

        while ($parent != null) {
            if ($parent.parent != null) {
                $parentNodes.push($parent);
            }

            $parent = $parent.parent;
        }

        return $parentNodes;
    },
    getBreadCrumbs: function ($node, $separator = ' / ') {
        let $crumbs = this.getParentNodes($node).map(function($parentNode) {
            return $parentNode.title;
        });

        return $crumbs.reverse().join($separator) + ($crumbs.length ? $separator : '');
    },
    updateNode($node, $recursive = false) {
        if ($node.isRoot()) {
            return;
        }

        $.get(this.options.pathAction, {action: 'getData', targetId: $node.data.id}, ($result) => {
            if ($result.success) {
                let $data = $result.data;

                $node.folder = $data.folder;
                $node.title = $data.title;
                $node.data.countAll = $data.data.countAll;
                $node.data.countActive = $data.data.countActive;

                $node.renderTitle();

                if ($recursive && $node.parent) {
                    this.updateNode($node.parent, true);
                }
            } else {
                this.showError($result.message);
            }
        }, "json").fail(($response) => {
            this.showError($response.responseJSON.message);
        });
    },
    loadNode: function ($node) {
        if ($node.data.id === this.options.activeId) {
            $node.setActive(true);
        }

        let $checkId = String($node.data.id);

        let $searchSelection = this.nodeToSelectId.indexOf(String($checkId));
        if ($searchSelection > -1) {
            this.nodeToSelectId.splice($searchSelection, 1); // First remove from nodeToSelectId
            $node.setSelected(true);
        }

        if (!$node.isLoaded() && !$node.isLoading()) {
            $node.load(true);
        } else {
            let $findIndex = this.nodeToLoadId.indexOf($node.data.id);
            if (
                $findIndex > -1
                && $node.isLoaded()
                && $node.children
                && $node.children.length > 0
                && !$node.expanded
            ) {
                $node.setExpanded(true);
            }
        }
    },
});
