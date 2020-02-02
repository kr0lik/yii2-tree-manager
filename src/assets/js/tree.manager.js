$.widget("kr0lik.treeManager", {
    tree: null,

    treeContainerClass: '.fancytree-connectors',
    formContainerClass: '.tree-manager-form-container',
    treeBreadcrumbsClass: '.tree-breadcrumbs',
    treeUpdateNameClass: '.tree-update-name',
    formInputNameClass: '.tree-form-input-name',
    formErrorMessageClass: '.tree-form-error',
    formSuccessMessageClass: '.tree-form-success',
    formCancelButtonClass: '.tree-form-cancel',

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
            $options.dnd5.dragDrop = ($node, $data) => {
                $.get(this.options.pathAction, {action: "move", mode: $data.hitMode, targetId: $data.otherNode.data.id, hitId: $node.data.id}, ($result) => {
                   if ($result.success) {
                       let $startNode = $data.otherNode.parent; // Not move this variable!

                       $data.otherNode.moveTo($node, $data.hitMode);
                       if ($data.hitMode == "over") {
                           $node.setExpanded(true);
                       }

                       let $nodesToUpdate = this.getTree().getParentNodes($startNode).reverse();
                       $nodesToUpdate.push($startNode);

                       $nodesToUpdate = $nodesToUpdate.concat(
                           this.getTree().getParentNodes($node).reverse().filter(($parentNode) => {
                               $.each($nodesToUpdate, function($index, $nodeToUpdate) {
                                   if ($parentNode.data.id === $nodeToUpdate.data.id) {
                                       return true;
                                   }
                               });
                               return false;
                           }, $nodesToUpdate)
                       );
                       $nodesToUpdate.push($node);

                       $.each($nodesToUpdate, ($index, $nodeToUpdate) => {
                           this.getTree().updateNode($nodeToUpdate, false);
                       });
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
        this.tree = $.kr0lik.tree(this._getOptions(), this.getTreeContainer());
    },
    getTree: function () {
        return this.tree;
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
    },
    _formPrepare: function ($editedNode) {
        var $tree = this.getTree();
            $formContainer = this.getFormContainer();

        $formContainer.html('<div class="loader form-loader"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>');

        $.get(this.options.pathAction, this._formGetQuery($editedNode), ($result) => {
            if ($result.success) {
                $formContainer.html($result.data.html);

                let $form = $formContainer.find('form');
                let $name = $form.find(this.formInputNameClass).val();

                if (!$name && $editedNode.data.new) {
                    $name = this.options.messages.new;
                }

                $editedNode.setTitle($name);
                this.getUpdateNamePlaces().text($name);
                this.getBreadCrumbsPlaces().text($tree.getBreadCrumbs($editedNode));

                this._formBindInput($form, $editedNode);
                this._formBindSubmit($form, $editedNode);
                this._formBindReset($form, $editedNode);
            } else {
                this._formShowError($result.message);
            }
        }, "json").fail(($response) => {
            this._formShowError($response.responseJSON.message);
        });
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
    _formBindSubmit: function ($form, $node) {
        var $self = this;

        $form.bind("submit", function () {
            $.post($form.attr('action'), $form.serialize(), function($result) {
                if ($result.success) {
                    $node.data.disabled = false;
                    $node.data.id = $result.data.data.id;

                    $form.find($self.formSuccessMessageClass).fadeIn();
                    $form.find($self.formErrorMessageClass).hide();

                    $self.getTree().updateNode($node.parent, false);

                    setTimeout(function () {
                        $($self.formSuccessMessageClass).fadeOut();
                    }, 9000);
                } else {
                    $form.find($self.formErrorMessageClass).text($result.message).show();
                }
            }, "json").fail(function($response) {
                $form.find($self.formErrorMessageClass).text($response.responseJSON.message).show();
            });

            return false;
        });
    },
    _formBindReset: function ($form, $node) {
        var $self = this;

        $form.find(this.formCancelButtonClass).bind("click", function () {
            $self._formPrepare($node);
        });
    },
    _formShowError: function ($message) {
        this.getFormContainer().html('<p class="error form-error text-danger">'+$message+'</p>');
    },
});