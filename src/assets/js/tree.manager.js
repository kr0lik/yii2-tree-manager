$.widget("kr0lik.treeManager", {
    _tree: null,

    treeContainerClass: '.fancytree-connectors',
    formContainerClass: '.tree-manager-form-container',
    treeBreadcrumbsClass: '.tree-breadcrumbs',
    treeUpdateNameClass: '.tree-update-name',
    formInputNameClass: '.tree-form-input-name',
    formErrorMessageClass: '.tree-form-error',
    formSuccessMessageClass: '.tree-form-success',
    formCancelButtonClass: '.tree-form-cancel',
    formSubmitButtonClass: '.tree-form-submit',

    appendButtonClass: '.tree-append',
    addButtonClass: '.tree-add',
    removeButtonClass: '.tree-remove',

    options: {
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
    },
    _create: function() {
        this._validate();
        this._initTree();
        this._initAddAction();
        this._initAppendAction();
        this._initRemoveAction();
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
        if (!this.options.pathAction) {
            this.showError('PathAction option required!');
            this._destroy();
        }
    },
    _getOptions: function () {
        let $options = {
            pathAction: this.options.pathAction,
            activeId: this.options.activeId,
            dnd5: this.options.dnd5,
            extensions: this.options.extensions,
            plugins: [this],
            messages: this.options.messages,
        };

        if ($options.dnd5) {
            $options.dnd5.dragStart = ($node, $data) => {
                $data.effectAllowed = "all";
                $data.dropEffect = $data.dropEffectSuggested;

                return true;
            };
            $options.dnd5.dragEnter = ($node, $data) => {
                if ($node.getLevel() <= 1 && false === this.options.multipleRoots) return false;  // Do not drag to root
                if (!$data.otherNode.data.id) return false; // Do not drag new nodes

                return true;
            };
            $options.dnd5.dragDrop = ($hitNode, $data) => {
                var $targetNode = $data.otherNode,
                    $tree = this.getTree();

                $.get(this.options.pathAction, {action: "move", mode: $data.hitMode, targetId: $targetNode.data.id, hitId: $hitNode.data.id}, ($result) => {
                   if (true === $result.success) {
                       var $tree = this.getTree();

                       let $startNode = $targetNode.parent; // Not move this variable!

                       $targetNode.moveTo($hitNode, $data.hitMode);
                       if (false === $hitNode.expanded && "over" === $data.hitMode) {
                           $hitNode.setExpanded(true);
                       }

                       let $nodesToUpdate = $tree.getParentNodes($startNode).reverse();
                       $nodesToUpdate.push($startNode);

                       $nodesToUpdate = $nodesToUpdate.concat(
                           $tree.getParentNodes($hitNode).reverse().filter(($parentNode) => {
                               $.each($nodesToUpdate, ($index, $nodeToUpdate) => {
                                   if ($parentNode.data.id === $nodeToUpdate.data.id) {
                                       return true;
                                   }
                               });
                               return false;
                           }, $nodesToUpdate)
                       );
                       $nodesToUpdate.push($hitNode);

                       $.each($nodesToUpdate, ($index, $nodeToUpdate) => {
                           $tree.updateNode($nodeToUpdate, false);
                       });

                       this._updateBreadCrumbsPlaces($targetNode);

                       $(document).trigger('treeElementAfterMove', [$targetNode, $hitNode]);
                   } else if ($result.message) {
                       this.showError($result.message);
                   }
                }).fail(($response) => {
                    this.showError($response.statusText);
                });
            };
        }

        return $options;
    },
    _initTree: function () {
        this._tree = $.kr0lik.tree(this._getOptions(), this.getTreeContainer());
    },
    getTree: function () {
        return this._tree;
    },
    activate: function ($node) {
        this._formPrepare($node)
    },
    select: function ($node) {
    },
    renderNode: function ($node) {
        var $tree = this.getTree();
        if (null !== $tree) {
            if (null === $tree.getNeedToActiveId()) {
                if (true === this.options.firstRootActivateDefault) {
                    // Activate root by default
                    let $rootNode = this.getTree().getRootNode().getFirstChild();
                    if ($node.data.id && $rootNode.data.id === $node.data.id) {
                        $node.setActive(true);
                    }
                } else {
                    this.getFormContainer().html(`<div class="panel-body">${this.options.messages.notSelected}</div>`);
                }
            }
        }
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
    getFormContainer: function () {
        return this.getMainContainer().find(this.formContainerClass);
    },
    getUpdateNamePlaces: function () {
        return this.getMainContainer().find(this.treeUpdateNameClass);
    },
    getBreadCrumbsPlaces: function () {
        return this.getMainContainer().find(this.treeBreadcrumbsClass);
    },
    _initAppendAction: function() {
        let $button = this.getMainContainer().find(this.appendButtonClass);

        if ($button) {
            $button.show();
            $button.on("click", () => {
                this._addTreeElement();
            });
        }
    },
    _initAddAction: function() {
        let $button = this.getMainContainer().find(this.addButtonClass);

        if ($button) {
            $button.show();
            $button.on("click", () => {
                this._addTreeElement('after');
            });
        }
    },
    _initRemoveAction: function() {
        let $button = this.getMainContainer().find(this.removeButtonClass);

        if ($button) {
            $button.show();
            $button.on("click", () => {
                this._deleteTreeElement();
            });
        }
    },
    _updateBreadCrumbsPlaces: function ($node) {
        $crumbs = this.getTree().getBreadCrumbs($node);
        this.getBreadCrumbsPlaces().text($crumbs);
    },
    _updateNamePlaces: function ($title) {
        this.getUpdateNamePlaces().html($title.bold());
    },
    _addTreeElement: function ($mode = 'child') { // $mode = 'after'
        var $tree = this.getTree();
        var $node = $tree.getActiveNode();

        if (!$node) {
            $node = $tree.getRootNode();
            $mode = 'child';

            let $rooChildren = $node.getChildren();
            if (null !== $rooChildren && $rooChildren.length && !this.options.multipleRoots) {
                this.showError(this.options.messages.notSelected);
                return;
            }
        }

        if (true === $node.data.disabled) {
            this.showError(this.options.messages.hitNodeNotSaved);
            return;
        }

        $node.setFocus(false);

        let $newNode = $node.addNode({
            title: this.options.messages.new,
            new: true,
            active: false,
            disabled: true,
            folder: false,
            data: {
                id: null,
                countAll: null,
                countActive: null,
            }
        }, $mode);

        $newNode.setFocus(true);
        $newNode.setActive(true);
    },
    _deleteTreeElement: function () {
        var $activeNode = this.getTree().getActiveNode();

        if (!$activeNode) {
            this.showError(this.options.messages.notSelected);

            return;
        } else if ($activeNode.data.id) {
            let $confirmation = confirm(this.options.messages.deleteConfirm.replace("{sectionName}", $activeNode.title));

            if (true !== $confirmation) {
                return;
            }
        } else {
            this._removeTreeElement($activeNode);
            return;
        }

        $.get(this.options.pathAction, {action: 'delete', targetId: $activeNode.data.id}, ($result) => {
            if (true === $result.success) {
                this._removeTreeElement($activeNode);
            } else {
                this.showError($result.message);
            }
        }, "json").fail(($response) => {
            this.showError($response.statusText);
        });
    },
    _removeTreeElement: function ($node) {
        if ($node.getLevel() > 1) {
            let $parentNode = $node.parent;

            $parentNode.setActive(true);
            this.getTree().updateNode($parentNode, true);
        } else {
            this.getFormContainer().html('');
        }

        $node.remove();

        $(document).trigger('treeElementAfterRemove', [$node]);
    },
    _formPrepare: function ($editedNode) {
        this._updateBreadCrumbsPlaces($editedNode);
        this._updateNamePlaces($editedNode.title);

        var $formContainer = this.getFormContainer();
        $formContainer.html('<div class="loader form-loader text-center"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>');

        $.get(this.options.pathAction, this._formGetQuery($editedNode), ($result) => {
            if (true === $result.success) {
                $formContainer.html($result.data.form);

                var $form = $formContainer.find('form');

                this._formUpdateData($form, $editedNode);
                this._formBindActions($form, $editedNode);

                $(document).trigger('treeFormAfterLoad', [$form, $editedNode]);
            } else {
                this._formShowError($result.message);
            }
        }, "json").fail(($response) => {
            this._formShowError($response.statusText);
        });
    },
    _formBindActions: function ($form, $editedNode) {
        this._formBindInput($form, $editedNode);
        this._formBindSubmit($form, $editedNode);
        this._formBindReset($form, $editedNode);
    },
    _formUpdateData: function ($form, $editedNode) {
        var $tree = this.getTree(),
            $name = $form.find(this.formInputNameClass).val();

        if (!$name && $editedNode.data.new) {
            $name = this.options.messages.new;
        }

        $editedNode.setTitle($name);

        this._updateBreadCrumbsPlaces($editedNode);
        this._updateNamePlaces($editedNode.title);
    },
    _formGetQuery: function ($node) {
        var $query = {
            action: "getForm",
            targetId: $node.data.id,
            mode: ''
        };

        if ($node.data.id) {
            $query.mode = ''; // Edit mode;
        } else {
            let $prev = $node.getPrevSibling();

            if ($prev) {
                $query.hitId = $prev.data.id;
                $query.mode = 'after';
            } else {
                let $parent = $node.parent;

                if ($parent.isRoot()) {
                    $query.hitId = null;
                } else if ($parent.data.id) {
                    $query.hitId = $parent.data.id;
                } else {
                    this._formShowError(this.messages.unsupportedMode);
                }

                $query.mode = 'child';
            }
        }

        return $query;
    },
    _formBindInput: function ($form, $node) {
        var $self = this,
            $tree = this.getTree();

        $form.find(this.formInputNameClass).bind("keyup", function() {
            let $name = $(this).val();

            $self._updateNamePlaces($name);

            $node.setTitle($name);
        });
    },
    _formBindSubmit: function ($form, $editedNode) {
        var $submitButton = $form.find(this.formSubmitButtonClass),
            $errorMessageContainer = $form.find(this.formErrorMessageClass),
            $defaultSubmitText = $submitButton.text();

        // Validate
        $form.on('beforeSubmit', ($event, $jqXHR, $settings) => {
            $submitButton.html(`${$defaultSubmitText} <i class="fa fa-spinner fa-pulse fa-fw"></i>`);

            new Promise((resolve, reject) => {
                $.post(this.options.pathAction + '?action=validate', $form.serialize(), ($result) => {
                    if (true === $result.success) {
                        resolve($result);
                    } else if ($result.data.validations) {
                        $submitButton.html(`${$defaultSubmitText} <i class="save-error fa fa-close fa-xs text-danger"></i>`);
                        $form.yiiActiveForm('updateMessages', $result.data.validations, true);
                    } else {
                        reject($response.responseJSON.message);
                    }
                }).fail($response => {
                    reject($response.statusText);
                });
            }).then($result => {
                // Submit
                return new Promise((resolve, reject) => {
                    $.post($form.attr('action'), $form.serialize(), ($result) => {
                        if (true === $result.success) {
                            resolve($result);
                        } else if ($result.data.validations) {
                            $submitButton.html(`${$defaultSubmitText} <i class="save-error fa fa-close fa-xs text-danger"></i>`);
                            $form.yiiActiveForm('updateMessages', $result.data.validations, true);
                        } else {
                            reject($result.message);
                        }
                    }, "json").fail($response => {
                        reject($response.statusText);
                    });
                });
            }).then($result => {
                // Success
                $submitButton.html(`${$defaultSubmitText} <i class="save-success fa fa-check fa-xs"></i>`);
                $errorMessageContainer.hide();

                $editedNode.data.disabled = false;
                $editedNode.data.id = $result.data.data.id;

                this.getTree().updateNode($editedNode.parent, false);

                setTimeout(() => {
                    $submitButton.find('.save-success').fadeOut(() => {
                        $submitButton.html($defaultSubmitText);
                    });
                }, 5000);

                $(document).trigger('treeFormAfterSubmit', [$form, $editedNode]);
            }).catch($err => {
                // Error
                $submitButton.html(`${$defaultSubmitText} <i class="save-error fa fa-close fa-xs text-danger"></i>`);
                $errorMessageContainer.text($err).show();
            });

            return false;
        });

        $form.bind("submit", () => { return false; });
    },
    _formBindReset: function ($form, $editedNode) {
        $form.find(this.formCancelButtonClass).bind("click", function () {
            $($form).trigger('reset.yiiActiveForm');

            this._formUpdateData($form, $editedNode);

            $(document).trigger('treeFormAfterReset', [$form, $editedNode]);
        }.bind(this));
    },
    _formShowError: function ($message) {
        this.getFormContainer().html(`<p class="error form-error text-danger">${$message}</p>`);
    },
});