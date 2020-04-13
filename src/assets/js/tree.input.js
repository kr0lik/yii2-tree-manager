$.widget("kr0lik.treeInput", {
    tree: null,

    treeContainerClass: '.fancytree-connectors',
    inpitFieldClass: '.tree-input-field',
    inputListClass: '.tree-input-list',

    options: {
        pathAction: null,
        leavesOnly: true,
        multiple: false,
        selectId: [],

        messages: {
            select: 'Select...',
        },
    },
    _create: function() {
        this._validate();
        this._initTree();
        this._clearInput();
    },
    _refresh: function() {
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
    },
    _getOptions: function () {
        return  {
            pathAction: this.options.pathAction,
            selectId: this.options.selectId,
            selectMode: this.options.multiple ? 2 : 1,
            checkbox: ($event, $data) => {
                let $node = $data.node,
                    $type = this.options.multiple ? 'checkbox' : 'radio';

                if (!this._isSelectable($node)) {
                    return false;
                }

                return $type;
            },
            plugins: [this],
        };
    },
    _initTree: function () {
        this.tree = $.kr0lik.tree(this._getOptions(), this.getTreeContainer());
    },
    getTree: function () {
        return this.tree;
    },
    activate: function ($node) {
        if (this._isSelectable($node)) {
            $node.setSelected(true);
        }
    },
    select: function ($node) {
        this._updateInput($node);
    },
    showError: function ($message) {
        this.getTree().showError($message);
    },

    // app
    getMainContainer: function () {
        return $(this.element);
    },
    getTreeContainer: function () {
        return this.getMainContainer().find(this.treeContainerClass);
    },
    getInputList: function () {
        return this.getMainContainer().find(this.inputListClass);
    },
    getInputField: function () {
        return this.getMainContainer().find(this.inpitFieldClass);
    },
    _isSelectable: function ($node) {
        return !(this.options.leavesOnly && $node.isFolder());
    },
    _updateInput: function ($node) {
        var $tree = this.getTree(),
            $titles = [],
            $ids = [];

        $.each($tree.getSelectedNodes(), ($index, $node) => {
            let $title = this.getTree().getBreadCrumbs($node, '/') + $node.title;
            $titles.push($title);
            $ids.push($node.data.id);
        });

        if ($titles.length) {
            this.getInputList().html($titles.join('<br />'));
            this.getInputField().val($ids.join(','));
        } else {
            this._clearInput();
        }

        $(document).trigger('treeInputChange', [$tree.getSelectedNodes()]);
    },
    _clearInput: function () {
        this.getInputList().text(this.options.messages.select);
        this.getInputField().val('');
    }
});