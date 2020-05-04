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
    #getTreeOptions = function() {
        return  {
            pathAction: this.#options.pathAction,
            selectId: this.#options.selectId,
            plugins: [this],
            selectMode: this.#options.multiple ? 2 : 1,
            checkbox: ($event, $data) => {
                let $node = $data.node,
                    $type = this.#options.multiple ? 'checkbox' : 'radio';

                if (false === this.#isSelectable($node)) {
                    return false;
                }

                return $type;
            },
            plugins: [this],
            messages: this.#options.messages,
        };
    }
    #setOptions = function(options) {
        this.#options = Object.assign(this.#options, options);
    }
    #validate = function () {
        if (!this.#options.pathAction) {
            throw Error('PathAction option required!');
        }
    }
    #isSelectable = function(node) {
        return !(this.#options.leavesOnly && node.isFolder());
    }
    #updateSelections = function(treeComponent) {
        let selections = this.#getSelections(treeComponent);

        if (Object.keys(selections).length > 0) {
            if (this.#options.multiple) {
                let selectOptions = '';
                for(let selectId in selections) {
                    if(true === selections.hasOwnProperty(selectId)) {
                        let title = selections[selectId] ?? selectId;
                        selectOptions += `<option value="${selectId}" selected="selected">${title}</option>`;
                    }
                }

                this._getTreeInputFieldElelent().html(selectOptions);
            } else {
                selectIds = Object.keys(selections);
                selectIds = selectIds.filter(Boolean);

                this._getTreeInputFieldElelent().val(selectIds.join(','));
            }

            let selectTitles = Object.values(selections);
            selectTitles = selectTitles.filter(Boolean);

            if (treeComponent.needToSelectId.length > 0) {
                selectTitles.push(this.loader);
            }

            this._getTreeInputListElelent().html(selectTitles.join('<br />'));
        } else {
            this.#clearInput();
        }

        $(document).trigger('treeInputChange', [treeComponent.selectedNodes]);
    }
    #getSelections = function(treeComponent) {
        let selections = new Object();

        treeComponent.selectedNodes.forEach(node => {
            let selectedTitle = treeComponent.getBreadCrumbs(node, '/') + node.title.bold();
            selections[node.data.id] = selectedTitle;
        });

        treeComponent.needToSelectId.forEach(id => {
            if (false === selections.hasOwnProperty(id)) {
                selections[id] = null;
            }
        });

        return selections;
    }
    #clearInput = function() {
        this._getTreeInputListElelent().text(this.#options.messages.select);

        if (true === this.#options.multiple) {
            this._getTreeInputFieldElelent().html('');
        } else {
            this._getTreeInputFieldElelent().val('');
        }
    }

    constructor(containerId, options) {
        super();

        this.$containerElement = $(`#${containerId}`);
        this.#setOptions(options);

        var treeComponent = new kr0lik.treeComponent(this._getTreeContainerElelent(), this.#getTreeOptions());

        this.#updateSelections(treeComponent);
    }

    _getTreeInputFieldElelent = () => {
        return this.$containerElement.find(TreeInput.treeInputFieldClass);
    }
    _getTreeInputListElelent = () => {
        return this.$containerElement.find(TreeInput.treeInputListClass);
    }
    _getTreeContainerElelent = () => {
        return  this.$containerElement.find(TreeInput.treeContainerClass);
    }

    onSelect(node, treeComponent) {
        if (true === this.#isSelectable(node)) {
            this.#updateSelections(treeComponent);
        }
    }
    onActivate(node, treeComponent) {
        if (false === this.#options.multiple && true === this.#isSelectable(node)) {
            node.setSelected(true);
        }
    }
}