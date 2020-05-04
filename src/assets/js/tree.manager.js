kr0lik.treeManager = class TreeManager extends kr0lik.treePlugin {
    static treeContainerClass = '.tree-container'
    static treeManagerFormContainerClass = '.tree-manager-form-container'

    static treeAppendButtonClass = '.tree-append'
    static treeAddButtonClass = '.tree-add'
    static treeRemoveButtonClass = '.tree-remove'

    static treeBreadcrumbsClass = '.tree-node-breadcrumbs'
    static treeNodeNameClass = '.tree-node-name'

    #options = {
        pathAction: null,
        activeId: null,
        firstRootActivateDefault: true,
        multipleRoots: true,

        messages: {
            new: '...',
            notSelected: 'Not selected',
            hasChildren: 'Section has childrens',
            deleteConfirm: 'Are you sure want to delete "{sectionName}"?',
            cantDelete: 'Cant delete',
            unsupportedMode: 'Mode not supported',
            hitNodeNotSaved: 'Hit section not saved',
            loading: "Loading&#8230;",
            loadError: "Load error!",
            noData: "No data.",
        },
        dnd5: {
            autoExpandMS: 1500,
            preventRecursion: true, // Prevent dropping nodes on own descendants
            preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.

        },
        extensions: ['dnd5'],
    }

    #getTreeOptions = function () {
        let options = {
            pathAction: this.#options.pathAction,
            activeId: this.#options.activeId,
            dnd5: this.#options.dnd5,
            extensions: this.#options.extensions,
            plugins: [this],
            messages: this.#options.messages,
        };

        if (options.dnd5) {
            options.dnd5.dragStart = (node, data) => {
                data.effectAllowed = "all";
                data.dropEffect = data.dropEffectSuggested;

                return true;
            };
            options.dnd5.dragEnter = (node, data) => {
                if (node.getLevel() <= 1 && false === this.#options.multipleRoots) return false;  // Do not drag to root
                if (!data.otherNode.data.id) return false; // Do not drag new nodes

                return true;
            };
            options.dnd5.dragDrop = (hitNode, data) => {
                var targetNode = data.otherNode;

                $.get(
                    this.#options.pathAction,
                    {action: "move", mode: data.hitMode, targetId: targetNode.data.id, hitId: hitNode.data.id},
                    "json"
                ).done(result => {
                    if (true === result.success) {
                        let startNode = targetNode.parent; // Not move this variable!

                        targetNode.moveTo(hitNode, data.hitMode);
                        if (false === hitNode.expanded && "over" === data.hitMode) {
                            hitNode.setExpanded(true);
                        }

                        let nodesToUpdate = this.getParentNodes(startNode).reverse();
                        nodesToUpdate.push(startNode);

                        nodesToUpdate = nodesToUpdate.concat(
                            this.getParentNodes(hitNode).reverse().filter((parentNode) => {
                                $.each(nodesToUpdate, (index, nodeToUpdate) => {
                                    if (parentNode.data.id === nodeToUpdate.data.id) {
                                        return true;
                                    }
                                });
                                return false;
                            }, nodesToUpdate)
                        );
                        nodesToUpdate.push(hitNode);

                        $.each(nodesToUpdate, (index, nodeToUpdate) => {
                            this.updateNode(nodeToUpdate, false);
                        });

                        this._updateBreadCrumbsPlaces(targetNode);

                        $(document).trigger('treeElementAfterMove', [targetNode, hitNode]);
                    } else if (result.message) {
                        this.showError(result.message);
                    }
                }).fail(response => {
                    this.showError(response.statusText);
                });
            };
        }

        return options;
    }
    #getFormOptions = function () {
        return {
            pathAction: this.#options.pathAction,
            messages: {
                new: this.#options.messages.new,
                unsupportedMode: this.#options.messages.unsupportedMode,
            },
            context: this
        };
    }
    #setOptions = function (options) {
        this.#options = Object.assign(this.#options, options);
    }
    #validate = function () {
        if (!this.#options.pathAction) {
            throw Error('PathAction option required!');
        }
    }
    #init = function () {
        this.treeManagerForm = new kr0lik.treeManagerForm(this._getFormContainerElelent(), this.#getFormOptions());

        var treeComponent = new kr0lik.treeComponent(this._getTreeContainerElelent(), this.#getTreeOptions());

        this.#initAddAction(treeComponent);
        this.#initAppendAction(treeComponent);
        this.#initRemoveAction(treeComponent);
    }
    #initAppendAction = function (treeComponent) {
        let $button = this._getAppendButtonElelent();

        if ($button) {
            $button.show();
            $button.on("click", () => {
                this.#addNode(treeComponent);
            });
        }
    }
    #initAddAction = function (treeComponent) {
        let $button = this._getAddButtonElelent();

        if ($button) {
            $button.show();
            $button.on("click", () => {
                this.#addNode(treeComponent, 'after');
            });
        }
    }
    #initRemoveAction = function (treeComponent) {
        let $button = this._getRemoveButtonElelent();

        if ($button) {
            $button.show();
            $button.on("click", () => {
                this.#deleteNode(treeComponent);
            });
        }
    }
    #addNode = function (treeComponent, mode = 'child') {
        var node = treeComponent.activeNode;

        if (!node) {
            node = treeComponent.rootNode;
            mode = 'child';

            let rooChildren = node.getChildren();
            if (null !== rooChildren && rooChildren.length && !this.#options.multipleRoots) {
                treeComponent.showError(this.#options.messages.notSelected);
                return;
            }
        }

        if (true === node.data.disabled) {
            treeComponent.showError(this.#options.messages.hitNodeNotSaved);
            return;
        }

        node.setFocus(false);

        let newNode = node.addNode({
            title: this.#options.messages.new,
            new: true,
            active: false,
            disabled: true,
            folder: false,
            data: {
                id: null,
                countAll: null,
                countActive: null,
            }
        }, mode);

        newNode.setFocus(true);
        newNode.setActive(true);
    }
    #deleteNode = function (treeComponent) {
        var activeNode = treeComponent.activeNode;

        if (!activeNode) {
            treeComponent.showError(this.#options.messages.notSelected);
            return;
        } else if (!activeNode.data.id) {
            this.#destroyNode(activeNode, treeComponent);
            return;
        }

        if (!confirm(this.#options.messages.deleteConfirm.replace("{sectionName}", activeNode.title))) {
            return;
        }

        $.get(
            this.#options.pathAction,
            {action: 'delete', targetId: activeNode.data.id},
            "json"
        ).done(result => {
            if (true === result.success) {
                treeComponent.updateNode(activeNode.parent, true);
                this.#destroyNode(activeNode, treeComponent);
            } else {
                this.showError(result.message);
            }
        }).fail(response => {
            treeComponent.showError(response.statusText);
        });
    }
    #destroyNode = function (node, treeComponent) {
        if (node.getLevel() > 1) {
            node.parent.setActive(true);
        } else {
            this._getFormContainerElelent().html('');
        }

        node.remove();

        $(document).trigger('treeElementAfterRemove', [node]);
    }

    constructor(containerId, options) {
        super();

        this.$containerElement = $(`#${containerId}`);
        this.#setOptions(options);
        this.#validate();
        this.#init();
    }

    _getTreeContainerElelent = () => {
        return this.$containerElement.find(TreeManager.treeContainerClass);
    }

    _getAddButtonElelent = () => {
        return this.$containerElement.find(TreeManager.treeAddButtonClass);
    }
    _getAppendButtonElelent = () => {
        return this.$containerElement.find(TreeManager.treeAppendButtonClass);
    }
    _getRemoveButtonElelent = () => {
        return this.$containerElement.find(TreeManager.treeRemoveButtonClass);
    }

    _getFormContainerElelent = () => {
        return this.$containerElement.find(TreeManager.treeManagerFormContainerClass);
    }

    _getBreadCrumbsElement = () => {
        return this.$containerElement.find(TreeManager.treeBreadcrumbsClass);
    }
    _getNodeNameElement = () => {
        return this.$containerElement.find(TreeManager.treeNodeNameClass);
    }

    onActivate(node, treeComponent) {
        this.treeManagerForm.prepareForm(node, treeComponent)
    }
    onRenderNode(node, treeComponent) {
        if (null === treeComponent.needToActiveId) {
            if (true === this.#options.firstRootActivateDefault) {
                let rootNode = treeComponent.rootNode;
                // Activate root by default
                let firstRootNode = treeComponent.rootNode.getFirstChild();

                if (node.data.id && firstRootNode.data.id === node.data.id) {
                    node.setActive(true);
                }
            } else {
                this._getFormContainerElelent().html(`<div class="panel-body">${this.#options.messages.notSelected}</div>`);
            }
        }
    }
}

kr0lik.treeManagerForm = class TreeManagerForm {
    static formInputNameClass = '.tree-form-input-name'
    static formErrorMessageClass = '.tree-form-error'
    static formCancelButtonClass = '.tree-form-cancel'
    static formSubmitButtonClass = '.tree-form-submit'

    loader = '<div class="loader form-loader text-center"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>'

    #options = {
        pathAction: null,
        messages: {
            new: '...',
            unsupportedMode: 'Mode not supported',
        },
        context: null
    }
    #setOptions = function (options) {
        this.#options = Object.assign(this.#options, options);
    }
    #validate = function () {
        if (!this.#options.pathAction) {
            throw Error('PathAction option required!');
        }
    }
    #updateNodeBreadCrumbsElement = function (node, treeComponent) {
        let crumbs = treeComponent.getBreadCrumbs(node);
        this.#options.context._getBreadCrumbsElement().html(crumbs);
    }
    #updateNodeNameElement = function (name) {
        this.#options.context._getNodeNameElement().html(name.bold());
    }
    #getQuery = function (node) {
        let query = {
            action: "getForm",
            targetId: node.data.id,
            mode: ''
        };

        if (node.data.id) {
            query.mode = ''; // Edit mode;
        } else {
            let previousNode = node.getPrevSibling();

            if (previousNode) {
                query.hitId = previousNode.data.id;
                query.mode = 'after';
            } else {
                let parentNode = node.parent;

                if (parentNode.isRoot()) {
                    query.hitId = null;
                } else if (parentNode.data.id) {
                    query.hitId = parentNode.data.id;
                } else {
                    this.showError(this.#options.messages.unsupportedMode);
                }

                query.mode = 'child';
            }
        }

        return query;
    }
    #prepareNodeData = function ($form, editedNode, treeComponent) {
        let nodeName = this._getFormInputNameElement().val();

        if (!nodeName && editedNode.data.new) {
            nodeName = this.#options.messages.new;
        }

        editedNode.setTitle(nodeName);

        this.#updateNodeBreadCrumbsElement(editedNode, treeComponent);
        this.#updateNodeNameElement(editedNode.title);

        this._getFormErrorMessageElement().hide();

        this._getFormSubmitButtonElement()
            .removeClass('btn-danger')
            .addClass('btn-success')
            .find('.fa').remove();
    }

    #bindActions = function ($form, editedNode, treeComponent) {
        this.#bindInput($form, editedNode, treeComponent);
        this.#bindSubmit($form, editedNode, treeComponent);
        this.#bindReset($form, editedNode, treeComponent);
    }
    #bindInput = function ($form, node, treeComponent) {
        var self = this;

        let $button = this._getFormInputNameElement();
        $button.bind("keyup", function() {
            let name = $(this).val();

            self.#updateNodeNameElement(name);

            node.setTitle(name);
        });
    }
    #bindSubmit = function ($form, editedNode, treeComponent) {
        var $submitButton = this._getFormSubmitButtonElement(),
            $errorMessageElement = this._getFormErrorMessageElement(),
            defaultSubmitText = $submitButton.text();

        $form.on('beforeSubmit', (event, jqXHR, settings) => {
            $submitButton.html(`${defaultSubmitText} <i class="fa fa-spinner fa-pulse fa-fw"></i>`);
            $errorMessageElement.hide();

            // Validate
            new Promise((resolve, reject) => {
                $.post(
                    this.#options.pathAction + '?action=validate',
                    $form.serialize(),
                    "json"
                ).done(result => {
                    resolve(result)
                }).fail(response => {
                    reject(response.statusText);
                });
            }).then(result => {
                // Validate result
                if (true === result.success) {
                    // Submit
                    return new Promise((resolve, reject) => {
                        $.post(
                            $form.attr('action'),
                            $form.serialize(),
                            "json"
                        ).done(result => {
                            resolve(result)
                        }).fail(response => {
                            reject(response.statusText);
                        });
                    });
                } else if (result.data.validations) {
                    $form.yiiActiveForm('updateMessages', result.data.validations, true);
                    throw result.message;
                } else {
                    throw result.message;
                }
            }).then(result => {
                // Submit result
                if (true === result.success) {
                    $submitButton
                        .removeClass('btn-danger')
                        .addClass('btn-success')
                        .html(`${defaultSubmitText} <i class="save-success fa fa-xs fa-check"></i>`);
                    $errorMessageElement.hide();

                    editedNode.data.disabled = false;
                    editedNode.data.id = result.data.data.id;

                    treeComponent.updateNode(editedNode.parent, false);

                    $(document).trigger('treeFormAfterSubmit', [$form, editedNode]);

                    this.#loadForm(editedNode, treeComponent).done(() => {
                        let $submitButton = this._getFormSubmitButtonElement(),
                            defaultSubmitText = $submitButton.text();;

                        $submitButton
                            .html(`${defaultSubmitText} <i class="save-success fa fa-xs fa-check"></i>`);

                        setTimeout(() => {
                            $submitButton.find('.save-success').fadeOut(() => {
                                $submitButton.html(defaultSubmitText);
                            });
                        }, 3000);
                    });
                } else if (result.data.validations) {
                    $form.yiiActiveForm('updateMessages', result.data.validations, true);
                    throw result.message;
                } else {
                    throw result.message;
                }
            }).catch(errorMessage => {
                // Error
                $submitButton
                    .removeClass('btn-success')
                    .addClass('btn-danger')
                    .html(`${defaultSubmitText} <i class="save-error fa fa-xs fa-close"></i>`);
                $errorMessageElement.text(errorMessage).show();
            });

            return false;
        });

        $form.bind("submit", () => { return false; });
    }
    #bindReset = function ($form, editedNode, treeComponent) {
        let $button = this._getFormCancelButtonElement();

        $button.bind("click", function () {
            $form.trigger('reset.yiiActiveForm');

            this.#prepareNodeData($form, editedNode, treeComponent);

            $(document).trigger('treeFormAfterReset', [$form, editedNode]);
        }.bind(this));
    }

    _getFormInputNameElement = () => {
        return this.$containerElement.find(TreeManagerForm.formInputNameClass);
    }
    _getFormSubmitButtonElement = () => {
        return this.$containerElement.find(TreeManagerForm.formSubmitButtonClass);
    }
    _getFormCancelButtonElement = () => {
        return this.$containerElement.find(TreeManagerForm.formCancelButtonClass);
    }
    _getFormErrorMessageElement = () => {
        return this.$containerElement.find(TreeManagerForm.formErrorMessageClass);
    }

    constructor($containerElement, options) {
        this.$containerElement = $containerElement;

        this.#setOptions(options);
    }

    prepareForm(editedNode, treeComponent) {
        this.#updateNodeBreadCrumbsElement(editedNode, treeComponent);
        this.#updateNodeNameElement(editedNode.title);

        this.$containerElement.html(this.loader);

        this.#loadForm(editedNode, treeComponent).done(() => {
            $(document).trigger('treeFormAfterLoad', [$form, editedNode]);
        });
    }
    #loadForm = function (editedNode, treeComponent) {
        return $.get(
            this.#options.pathAction,
            this.#getQuery(editedNode),
            result => {
                if (true === result.success) {
                    this.$containerElement.html(result.data.form);

                    var $form = this.$containerElement.find('form');

                    this.#prepareNodeData($form, editedNode, treeComponent);
                    this.#bindActions($form, editedNode, treeComponent);
                } else {
                    this.showError(result.message);
                }
            },
            "json"
        ).fail(response => {
            this.showError(response.statusText);
        });
    }
    showError(message) {
        this.$containerElement.html(`<p class="error form-error text-danger">${message}</p>`);
    }
}