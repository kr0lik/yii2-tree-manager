var kr0lik = {
    treeComponent: class TreeComponent {
        static treeClass = '.fancytree-connectors';
        static treeSearchInputClass = '.tree-search-input'
        static treeSearchResetClass = '.tree-search-reset'
        static treeSearchMatchesClass = '.tree-search-matches'

        #options = {
            pathAction: null,
            needToLoadId: [],
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
            messages: {
                loading: "Loading&#8230;",
                loadError: "Load error!",
                noData: "No data."
            }
        }
        #nodeToLoadId = [];

        #setOptions = function (options) {
            this.#options = Object.assign(this.#options, options);
        }
        #validate = function () {
            if (!this.#options.pathAction) {
                throw Error('PathAction option required!');
            }

            this.#options.plugins.forEach(plugin => {
                if (false === (plugin instanceof kr0lik.treePlugin)) {
                    throw Error('All Plugins must be instanceof kr0lik.treePlugin!');
                }
            });
        }
        #init = function () {
            this.#initTree();
            this.#initLoadNodes();
            this.#initSearch();
        }
        #initTree = function () {
            this.getTreeElement().fancytree(this.#getTreeOptions());
        }
        #getTreeOptions = function () {
            return {
                strings: {
                    loading: this.#options.messages.loading,
                    loadError: this.#options.messages.loadError,
                    noData: this.#options.messages.noData
                },
                source: {
                    url: this.#options.pathAction,
                    data: {action: "getRoots"},
                    cache: false
                },
                lazyLoad: (event, data) => {
                    var node = data.node;
                    // Load child nodes via Ajax GET /tree?action=getChildrens&targetId=1234
                    data.result = {
                        url: this.#options.pathAction,
                        data: {action: "getChildrens", targetId: node.data.id},
                        cache: false
                    };
                },
                postProcess: (event, data) => {
                    var response = data.response;
                    var node = data.node;

                    if(response.success === true) {
                        node.addNode(response.data);
                    } else {
                        data.result = {
                            error: `ERROR #${response.faultCode}: ${response.faultMsg}`
                        }
                    }
                },
                dnd5: this.#options.dnd5,
                filter: this.#options.filter,
                quicksearch: this.#options.quicksearch,
                extensions: this.#options.extensions,
                checkbox: this.#options.checkbox,
                selectMode: this.#options.selectMode,
                renderNode: (event, data) => {
                    var node = data.node;

                    this.#renderNode(node);
                },
                renderTitle: (event, data) => {
                    var node = data.node;

                    return this.#getTitle(node);
                },
                icon: (event, data) => {
                    var node = data.node;

                    return this.#getIcon(node);
                },
                select: (event, data) => {
                    var node = data.node;

                    this.#select(node);
                },
                activate: (event, data) => {
                    var node = data.node;

                    this.#activate(node);
                },
                focus: (event, data) => {
                    var node = data.node;

                    this.#focus(node);
                },
                expand: (event, data) => {
                    var node = data.node;

                    this.#expand(node);
                },
                collapse: (event, data) => {
                    var node = data.node;

                    this.#collapse(node);
                },
            };
        }
        #initLoadNodes = function () {
            // Colect unique ids
            this.#nodeToLoadId = [...new Set(this.#options.needToLoadId)];
            this.#nodeToLoadId = this.#nodeToLoadId.filter(Boolean);

            if (this.#nodeToLoadId.length > 0) {
                this.loadPaths(this.#nodeToLoadId);
            }
        }
        #initSearch = function () {
            var self = this,
                tree = this.tree;

            self.getTreeSearchInputElement().on("keyup", function (e) {
                let count,
                    opts = self.#options.filter,
                    filterFunc = opts.leavesOnly ? tree.filterBranches : tree.filterNodes,
                    match = $(this).val();

                if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
                    self.getTreeSearchResetElement().click();
                    return;
                }

                count = filterFunc.call(tree, match, opts);

                self.getTreeSearchResetElement().attr("disabled", false);
                self.getTreeSearchMatchesElement().show().text(`${count}`);
            }).focus();

            self.getTreeSearchResetElement().click(function (e) {
                self.getTreeSearchInputElement().val('');
                self.getTreeSearchMatchesElement().hide().text('');
                tree.clearFilter();
            }).attr("disabled", true);
        }

        #renderNode = function (node) {
            // Load on render
            this.loadNode(node);

            // highlight on search
            if (node.titleWithHighlight && node.match) {
                $(node.span).find('span.fancytree-title').html(node.titleWithHighlight);
            }
            
            this.#options.plugins.forEach(plugin => plugin.onRenderNode(node, this));
        }
        #getTitle = function (node) {
            let classes = ['fancytree-title'];
            if (true === node.disabled) {
                classes.push('text-muted');
            }

            let spanTitle = `<span class="${classes.join(' ')}">${node.title}</span>`,
                spanCounter = '';

            if (node.data.countAll != null || node.data.countActive != null) {
                let str = '';
                if (node.data.countAll !== null) { str += node.data.countAll }
                if (node.data.countActive !== null) {
                    if (str !== '') { str += '/' }
                    str += node.data.countActive;
                }

                spanCounter = `<small class="fancytree-childcounter">(${str})</small>`;
            }

            return spanTitle + spanCounter
        }
        #getIcon = function (node) {
            let classes = [];

            if (true === node.disabled) {
                classes.push('text-muted');
            }

            if (node.getLevel() === 1) {
                classes.push('fa', 'fa-tree');
                return classes.join(' ');
            }

            if(node.isFolder()) {
                classes.push('fa', 'fa-folder');
                return classes.join(' ');
            }

            return false;
        }
        #select = function (node) {
            this.#options.plugins.forEach(plugin => plugin.onSelect(node, this));
        }
        #activate = function (node) {
            if (!node.isLoaded() && !node.isLoading()) {
                node.load(false);
            }

            this.#options.plugins.forEach(plugin => plugin.onActivate(node, this));
        }
        #focus = function (node) {
            this.#options.plugins.forEach(plugin => plugin.onFocus(node, this));
        }
        #expand = function (node) {
            this.#options.plugins.forEach(plugin => plugin.onExpand(node, this));
        }
        #collapse = function (node) {
            this.#options.plugins.forEach(plugin => plugin.onCollapse(node, this));
        }

        constructor($containerElement, options) {
            this.$containerElement = $containerElement;

            this.#setOptions(options);
            this.#validate();
            this.#init();
        }

        getTreeElement() {
            return this.$containerElement.find(TreeComponent.treeClass);
        }
        getTreeSearchInputElement() {
            return this.$containerElement.find(TreeComponent.treeSearchInputClass);
        }
        getTreeSearchResetElement() {
            return this.$containerElement.find(TreeComponent.treeSearchResetClass);
        }
        getTreeSearchMatchesElement() {
            return this.$containerElement.find(TreeComponent.treeSearchMatchesClass);
        }

        showMessage(message) {
            alert(message);
        }
        showError(message) {
            alert(message);
        }

        loadPaths(id) {
            $.get(
                this.#options.pathAction,
                {action: 'getPaths', targetId: id},
                "json"
            ).done(result => {
                if (result.success) {
                    let needToLoadIds = result.data.map(parentNode => {
                        return parentNode.data.id;
                    });

                    // Collect unique ids
                    this.#nodeToLoadId = this.#nodeToLoadId.concat(needToLoadIds);
                    this.#nodeToLoadId = [...new Set(this.#nodeToLoadId)];
                    this.#nodeToLoadId = this.#nodeToLoadId.filter(Boolean);

                    // Start from roots
                    this.rootNode.children.forEach(childrenNode => {
                        this.loadNode(childrenNode);
                    });
                } else {
                    this.showError(result.message);
                }
            }).fail(response => {
                this.showError(response.statusText);
            });
        }
        loadNode(node) {
            if (false === node.isLoaded() && false === node.isLoading()) {
                node.load(true);
            } else {
                let findIndex = this.#nodeToLoadId.indexOf(node.data.id);
                if (findIndex > -1 && true === node.isLoaded()) {
                    this.#nodeToLoadId.splice(findIndex, 1);

                    if (null !== node.children && node.children.length > 0 && !node.expanded) {
                        node.setExpanded(true);
                    }
                }
            }
        }
        updateNode(node, recursive = false) {
            if (node.isRoot()) {
                return;
            }

            $.get(
                this.#options.pathAction,
                {action: 'getData', targetId: node.data.id},
                "json"
            ).done(result => {
                if (result.success) {
                    let data = result.data;

                    node.folder = data.folder;
                    node.title = data.title;
                    node.data.countAll = data.data.countAll;
                    node.data.countActive = data.data.countActive;

                    node.renderTitle();

                    if (recursive && node.parent) {
                        this.updateNode(node.parent, true);
                    }
                } else {
                    this.showError(result.message);
                }
            }).fail((response) => {
                this.showError(response.statusText);
            });
        }
        getParentNodes(node) {
            let parentNodes = [],
                parent = node.parent;

            while (parent != null) {
                if (parent.parent != null) {
                    parentNodes.push(parent);
                }

                parent = parent.parent;
            }

            return parentNodes;
        }
        getBreadCrumbs(node, separator = '/') {
            let crumbs = this.getParentNodes(node).map(function (parentNode) {
                return parentNode.title;
            });

            return crumbs.reverse().join(separator) + (crumbs.length ? separator : '');
        }

        get tree() {
            return $.ui.fancytree.getTree(this.getTreeElement());
        }
        get rootNode() {
            return this.tree.getRootNode();
        }
        get activeNode() {
            return this.tree.getActiveNode();
        }
        get selectedNodes() {
            return this.tree.getSelectedNodes();
        }
    },

    treePlugin: class TreePlugin {
        onSelect(node, treeComponent) {}
        onActivate(node, treeComponent) {}
        onFocus(node, treeComponent) {}
        onRenderNode(node, treeComponent) {}
        onExpand(node, treeComponent) {}
        onCollapse(node, treeComponent) {}

        getTreeOptions() {
            return {};
        }
    }
}