# yii2-tree-manager
Yii2 tree manager using fancytree library.

This extension can add/delete/move branches of tree and quick edit branch fields(like name, description, body).


# Installation

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
composer require --prefer-dist kr0lik/yii2-tree-manager "dev-master"
```

or add

```
"kr0lik/yii2-tree-manager": "dev-master"
```

to the require section of your `composer.json` file.

# Description

Extension will install fancytree library, yii2-jquery, yii2-jqueryui and yii2-bootstrap.

To work with extension, you can use traits from [kr0lik/yii2-ltree](https://github.com/kr0lik/yii2-ltree) in your model or write your own with similar methods(Required methods in ActveRecord: getTree, after, before, append, prepend, delete, isRoot, level).

Required fileds in model: id, name.

# Usage
First add TreeManagerAction
---
Options:
 - categoryClass - ActveRecord with nodes and Required methods in ActveRecord(see Description);
 - quickFormFieldsView - View with additional fields for quick edit form of your ActveRecord(variables available: $form and $model)
 - quickFormButtonsView - View with Buttons for quick edit form your ActveRecord(variables available: $form and $model)
 - treeQueryScopes - scopes getTree method


Controller.php
```php
use yii\web\Controller;
use kr0lik\tree\TreeManagerAction;
use your\Tree\Nodes\Model;

class YourController extends Controller
{
    public function actions()
        {
            return [
                'tree-manager' => [
                    'class' => TreeManagerAction::class,
                    'categoryClass' => Model::class,
                    'quickFormFieldsView' => 'path/to/quick/edit/fields/view.php',
                    'quickFormButtonsView' => 'path/to/quick/edit/buttons/view.php',
                    'treeQueryScopes' => ['yourQuantityScope']
                ]
            ];
        }

}
```

You can add quantity to name of node, by making scope, what will adding to the end of name: "Some name (quantity)" or "Some name (sum/total)". For example:

ActiveQuery.php
```php
use yii\db\Expression;

public function yourQuantityScope() {
      $this->joinWith('products')
      // For Postgresql
          ->select(new Expression("name||' ('||COALESCE(SUM(products.active::int),0)||'/'||COUNT(product.id)||')' AS name"));
      // Or MySQL
          ->select(new Expression("CONCAT(name, '(', SUM(products.active), '/', COUNT(product.id), ')') AS name"));
 }
```
 And then in your controller:
 ```php
 use kr0lik\tree\TreeManagerAction;
 use app\path\to\YourActiveRecordWithQuantityScope;
 
 public function actions() {
      return [
          'tree-manager' => [
              'class' => TreeManagerAction::class,
              'categoryClass' => YourActiveRecordWithQuantityScope::class
              'treeQueryScopes' => ['yourQuantityScope']
          ]
      ];
 }
```

Then add TreeManagerWidget
---
Options:
- pathAction - Path to tree-action script. **Required**
- defaultActiveId: null - Select node on init by default
- messages: [

    newCategory: 'Новая категория',
    
    youNotChooseCategory: 'Вы не выбрали категорию из списка',
    
    categoryNotChoose: 'Не выбрана категория.',
    
    categoryHasChildren: 'У категории есть вложенные категории.',
    
    deleteCategory: 'Удалить категорию "{categoryName}"?',
    
    cantDeleteCategory: 'Не удалось удлаить категорию.',
    
    cantCreateRootCategory: 'Нельзя создать корневую категорию'
    
]
- dnd: [

    preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
    
    preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
    
    autoExpandMS: 1000, // Expand nodes after n milliseconds of hovering.
    
]
- filter: [

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
    
],
- firstNodeDefault: true - Select first node on init, if has not active node
- canAddRoot: true - Allow add root node
- canDragToRoot: false - Make node is root, if dnd enabled
- highlightQuantity: true - Highlight quantity by wrapping inside <small> tags, if name of node like: "some name (quantity)", where quantity is numeric. See TreeManagerAction -> treeQueryScopes
- useEditForm: true - Add quick edit form

View.php
```php
<?php
use yii\helpers\Url;
use kr0lik\tree\TreeManagerWidget;
?>

<?= TreeManagerWidget::widget([
    'treeOptions' => [
        'pathAction' => Url::to('/path/to/yoyr/controller/tree-manager/action')
    ]
]) ?>
```
Or add TreeInput
---
Options:
- pathAction - Path to your action script. **Required**
- messages: [
 
    newCategory: 'Новая категория',
    
    youNotChooseCategory: 'Вы не выбрали категорию из списка',
    
    categoryNotChoose: 'Не выбрана категория.',
    
    categoryHasChildren: 'У категории есть вложенные категории.',
    
    deleteCategory: 'Удалить категорию "{categoryName}"?',
    
    cantDeleteCategory: 'Не удалось удлаить категорию.',
    
    cantCreateRootCategory: 'Нельзя создать корневую категорию'
    
]
- filter: [
 
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
    
]
- firstNodeDefault: true - Select first node on init, if has not active node
- highlightQuantity: true - Highlight quantity by wrapping inside <small> tags, if name of node like: "some name (quantity)", where quantity is numeric. See TreeManagerAction -> treeQueryScopes
- multiple: false - Select multiple nodes

View.php
```php
<?php
use yii\helpers\Url;
use kr0lik\tree\TreeInput;
?>

<?= $form->field($model, 'field_name')->widget(TreeInput::class, [
    'treeOptions' => [
        'pathAction' => Url::to('/path/to/yoyr/controller/tree-manager/action'),
        'firstNodeDefault' => false
    ]
]) ?>
```
