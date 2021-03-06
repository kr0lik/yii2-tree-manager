kr0lik.treeInput = class TreeInput extends kr0lik.treePlugin {
    static treeInputFieldClass = '.tree-input-field'
    static treeInputListClass = '.tree-input-list'
    static treeContainerClass = '.tree-container'

    loader = '<div class="loader text-left"><i class="fa fa-spinner fa-pulse fa-xs fa-fw"></i></div>'

    #options = {
        pathAction: null,
        leavesOnly: true,
        multiple: false,
        selectId: [],

        messages: {
            select: 'Select...',
            loading: "Loading&#8230;",
            loadError: "Load error!",
            noData: "No data."
        },
    }
    #needToSelectId = []

    #setOptions = function(options) {
        this.#options = Object.assign(this.#options, options);
    }
    #validate = function () {
        if (!this.#options.pathAction) {
            throw Error('PathAction option required!');
        }
    }
    #initDefaults = function () {
        this.#needToSelectId = this.#options.selectId;
    }
    #clearInput = function() {
        this.getTreeInputListElelent().text(this.#options.messages.select);

        if (!this.getTreeInputFieldElelent().val()) {
            return;
        }

        this.getTreeInputFieldElelent().html('').change();
        $(document).trigger('treeInputChange', [[]]);
    }
    #updateSelections = function(selections) {
        if (Object.keys(selections).length > 0) {
            let selectIds = [],
                selectOptions = [],
                changed = false;

            for (let selectId in selections) {
                if(true === selections.hasOwnProperty(selectId)) {
                    let currentValues = this.getTreeInputFieldElelent().val();

                    changed = (Array.isArray(currentValues) && currentValues.indexOf(selectId) === -1) ||
                        (!Array.isArray(currentValues) && currentValues !== selectId)

                    selectIds += selectId;

                    let title = selections[selectId] ?? selectId;
                    selectOptions += `<option value="${selectId}" selected="selected">${title}</option>`;
                }
            }

            let selectTitles = Object.values(selections);
            selectTitles = selectTitles.filter(Boolean);
            if (this.#needToSelectId.length > 0) selectTitles.push(this.loader);

            this.getTreeInputListElelent().html(selectTitles.join('<br />'));

            if (changed) {
                this.getTreeInputFieldElelent().html(selectOptions).change();
                $(document).trigger('treeInputChange', [selections]);
            }
        } else {
            this.#clearInput();
        }
    }

    _isSelectable(node) {
        if (!this.options.leavesOnly) return true;
        if (!node.isFolder()) return true;
        if (false !== this.options.selectId.indexOf(node.data.id)) return true;
        return false;
    }

    getTreeOptions() {
        return  {
            pathAction: this.options.pathAction,
            needToLoadId: this.options.selectId,
            selectMode: this.options.multiple ? 2 : 1,
            checkbox: ($event, $data) => {
                let $node = $data.node,
                    $type = this.options.multiple ? 'checkbox' : 'radio';

                if (false === this._isSelectable($node)) {
                    return false;
                }

                return $type;
            },
            messages: this.options.messages,
            plugins: [this],
        };
    }
    getSelections = function(treeComponent) {
        let selections = new Object();

        treeComponent.selectedNodes.forEach(node => {
            let selectedTitle = treeComponent.getBreadCrumbs(node, '/') + node.title.bold();
            selections[node.data.id] = selectedTitle;
        });

        this.needToSelectId.forEach(id => {
            if (false === selections.hasOwnProperty(id)) {
                selections[id] = null;
            }
        });

        return selections;
    }

    constructor(containerId, options) {
        super();
        this.$containerElement = $(`#${containerId}`);
        this.#setOptions(options);
        this.#validate();
    }
    init(treeComponent) {
        this.#initDefaults();
        this.#updateSelections(this.getSelections(treeComponent));
    }

    static run = function (containerId, options) {
        var instance = new TreeInput(containerId, options);
        var tree = new kr0lik.treeComponent(instance.getTreeContainerElelent(), instance.getTreeOptions());

        instance.init(tree);

        return instance;
    }

    getTreeInputFieldElelent() {
        return this.$containerElement.find(TreeInput.treeInputFieldClass);
    }
    getTreeInputListElelent() {
        return this.$containerElement.find(TreeInput.treeInputListClass);
    }
    getTreeContainerElelent() {
        return  this.$containerElement.find(TreeInput.treeContainerClass);
    }

    get options() {
        return this.#options;
    }
    get needToSelectId() {
        return this.#needToSelectId;
    }

    onSelect(node, treeComponent) {
        this.#updateSelections(this.getSelections(treeComponent));
    }
    onActivate(node, treeComponent) {
        node.setActive(false);
        if (this._isSelectable(node)) {
            node.setSelected(!node.isSelected());
        }
    }
    onRenderNode(node, treeComponent) {
        let checkId = String(node.data.id);
        let index = this.needToSelectId.indexOf(checkId);
        if (index > -1) {
            this.needToSelectId.splice(index, 1);
            node.setSelected(true);
        }
    }
}