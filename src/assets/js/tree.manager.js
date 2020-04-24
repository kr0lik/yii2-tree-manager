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
                if ($node.getLevel() <= 1 && !this.options.multipleRoots) return false;  // Do not drag to root
                if (!$data.otherNode.data.id) return false; // Do not drag new nodes

                return true;
            };
            $options.dnd5.dragDrop = ($hitNode, $data) => {
                var $targetNode = $data.otherNode,
                    $tree = this.getTree();

                $.get(this.options.pathAction, {action: "move", mode: $data.hitMode, targetId: $targetNode.data.id, hitId: $hitNode.data.id}, ($result) => {
                   if ($result.success) {
                       var $tree = this.getTree();

                       let $startNode = $targetNode.parent; // Not move this variable!

                       $targetNode.moveTo($hitNode, $data.hitMode);
                       if (!$hitNode.expanded && $data.hitMode == "over") {
                           $hitNode.setExpanded(true);
                       }

                       let $nodesToUpdate = $tree.getParentNodes($startNode).reverse();
                       $nodesToUpdate.push($startNode);

                       $nodesToUpdate = $nodesToUpdate.concat(
                           $tree.getParentNodes($hitNode).reverse().filter(($parentNode) => {
                               $.each($nodesToUpdate, function($index, $nodeToUpdate) {
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

                       this.getBreadCrumbsPlaces().text($tree.getBreadCrumbs($targetNode));

                       $(document).trigger('treeElementAfterMove', [$targetNode, $hitNode]);
                   } else if ($result.message) {
                       this.showError($result.message);
                   }
                }).fail(($response) => {
                    this.showError($response.responseJSON.message);
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
    _addTreeElement: function ($mode = 'child') { // $mode = 'after'
        var $tree = this.getTree();
        var $node = $tree.getActiveNode();

        if (!$node) {
            $node = $tree.getRootNode();
            $mode = 'child';

            let $rooChildren = $node.getChildren();
            if ($rooChildren && $rooChildren.length && !this.options.multipleRoots) {
                this.showError(this.options.messages.notSelected);
                return;
            }
        }

        if ($node.data.disabled) {
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

            if ($confirmation !== true) {
                return;
            }
        } else {
            this._removeTreeElement($activeNode);
            return;
        }

        $.get(this.options.pathAction, {action: 'delete', targetId: $activeNode.data.id}, ($result) => {
            if ($result.success) {
                this._removeTreeElement($activeNode);
            } else {
                this.showError($result.message);
            }
        }, "json").fail(($response) => {
            this.showError($response.responseJSON.message);
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
        var $formContainer = this.getFormContainer();

        $formContainer.html('<div class="loader form-loader"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>');

        $.get(this.options.pathAction, this._formGetQuery($editedNode), ($result) => {
            if ($result.success) {
                $formContainer.html($result.data.form);

                var $form = $formContainer.find('form');

                this._formUpdateData($form, $editedNode);
                this._formBindActions($form, $editedNode);

                $(document).trigger('treeFormAfterLoad', [$form, $editedNode]);
            } else {
                this._formShowError($result.message);
            }
        }, "json").fail(($response) => {
            this._formShowError($response.responseJSON.message);
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

        this.getUpdateNamePlaces().text($editedNode.title);
        this.getBreadCrumbsPlaces().text($tree.getBreadCrumbs($editedNode));
    },
    _formGetQuery: function ($node) {
        var $query = {
            action: "getForm",
            targetId: $node.data.id,
            mode: ''
        };

        if ($node.data.id) {
            $query.mode = ''; // Edit;
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

        $form.find($self.formInputNameClass).bind("keyup", function() {
            let $name = $(this).val();

            $self.getUpdateNamePlaces().text($name);

            $node.setTitle($name);
        });
    },
    _formBindSubmit: function ($form, $editedNode) {
        var $self = this,
            $formContainer = this.getFormContainer(),
            $submitButton = $form.find($self.formSubmitButtonClass),
            $errorMessageContainer = $form.find($self.formErrorMessageClass);

        $form.on('beforeSubmit', function ($event, $jqXHR, $settings) {
            var $defaultSubmitText = $submitButton.html();
            $submitButton.html($defaultSubmitText + '<i class="fa fa-spinner fa-pulse fa-fw"></i>');

            $.post($self.options.pathAction + '?action=validate', $form.serialize(), function($result) {
                if ($result.success) {
                    $.post($form.attr('action'), $form.serialize(), function($result) {
                        $submitButton.html($defaultSubmitText);

                        if ($result.success) {
                            $editedNode.data.disabled = false;
                            $editedNode.data.id = $result.data.data.id;

                            $form.find($self.formSuccessMessageClass).fadeIn();
                            $errorMessageContainer.hide();

                            $self.getTree().updateNode($editedNode.parent, false);

                            setTimeout(function () {
                                $($self.formSuccessMessageClass).fadeOut();
                            }, 9000);

                            $(document).trigger('treeFormAfterSubmit', [$form, $editedNode]);
                        } else if ($result.data.validations) {
                            $form.yiiActiveForm('updateMessages', $result.data.validations, true);
                        } else {
                            $errorMessageContainer.text($result.message).show();
                        }
                    }, "json").fail(function($response) {
                        $submitButton.html($defaultSubmitText);
                        $errorMessageContainer.text($response.responseJSON.message).show();
                    });
                } else if ($result.data.validations) {
                    $submitButton.html($defaultSubmitText);
                    $form.yiiActiveForm('updateMessages', $result.data.validations, true);
                } else {
                    $submitButton.html($defaultSubmitText);
                    $errorMessageContainer.text($response.responseJSON.message).show();
                }
            });

            return false;
        });

        $form.bind("submit", function () { return false; });
    },
    _formBindReset: function ($form, $editedNode) {
        var $self = this;

        $form.find(this.formCancelButtonClass).bind("click", function () {
            $($form).trigger('reset.yiiActiveForm');

            $self._formUpdateData($form, $editedNode);

            $(document).trigger('treeFormAfterReset', [$form, $editedNode]);
        });
    },
    _formShowError: function ($message) {
        this.getFormContainer().html('<p class="error form-error text-danger">'+$message+'</p>');
    },
});