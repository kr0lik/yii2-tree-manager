# yii2-tree-manager
Yii2 tree manager using fancytree library.

This extension can add/delete/move branches of tree and quick edit branch fields.

![Tree manager example](https://github.com/kr0lik/yii2-tree-manager/blob/master/img/manager.png)

![Tree select example](https://github.com/kr0lik/yii2-tree-manager/blob/master/img/select.png)

# Installation

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
composer require --prefer-dist kr0lik/yii2-tree-manager
```

to the require section of your `composer.json` file.

# Description

Extension will install fancytree library, yii2-jquery, yii2-jqueryui and yii2-bootstrap.

You can with any tree extensions, just implement kr0lik\tree\contracts\TreeModelInterface

Required fileds in model: `id`.

# Usage

First implement `kr0lik\tree\contracts\TreeModelInterface` in Model.


Tree Manager
-------------
Add `kr0lik\tree\TreeManagerAction` into controller.

Required options:
* treeModelClass - tree model class.

Optional:
* bsVersion: int - Bootstrap version. Default 3.
* formViewPath - Path to form view.
* formNameField - Field with name of node. Default: `name`.
* formFields - Array of additional edit fields (ex: body or description). It can be string or callable.
* formLinks - Array of links (ex: link to view page or edit page). It can be string or callable.

Example:
```php
<?php
use app\path\to\YourActiveRecord;
use kr0lik\tree\TreeManagerAction;
use yii\web\Controller;
use yii\widgets\ActiveForm;

class YourController extends Controller
{
    public function actions()
    {
        return [
            'tree' => [
                'class' => TreeManagerAction::class,
                'treeModelClass' => YourActiveRecord::class,
                'formNameField' => 'title',
                'formFields' => [
                    'description',
                    function (ActiveForm $form, YourActiveRecord $model) {
                        return $form->field($model, 'body')->textarea();
                    },
                ],
                'formLinks' => [
                    function (YourActiveRecord $model) {
                        return Html::a('View', ['/url/to/view', 'id' => $model->id], ['class' => 'btn btn-sm btn-info']);
                    },
                ]
            ]
        ];
    }
}
```

Add `kr0lik\tree\TreeManagerWidget` into view.

Required options:
* pathAction - Url to tree model backend action.

Optional:
* bsVersion: int - Bootstrap version. Default 3.
* treeOptions: array - Container tag options.
* multipleRoots: bool - Allow multiple roots. Default: false.
* activeId: int - ID active node by default.
* dndEnable: bool - for dissable drag and drop set null or false. Default: true.
* viewPath - path to view of manager.
* firstRootActivateDefault - Activate first root on load if no activeId. Default: true.
* buttons - Array of additional buttons(as Html).

```php
<?php
use kr0lik\tree\TreeManagerWidget;
?>

<?= TreeManagerWidget::widget([
    'pathAction' => 'url/to/YourController/tree/action',
]) ?>
```

Events:
```js
$(document).on('treeFormAfterLoade', function (event, form, node) {

});
$(document).on('treeFormAfterSubmit', function (event, form, node) {

});
$(document).on('treeElementAfterMove', function (event, targetNode, hitNode) {

});
$(document).on('treeElementAfterRemove', function (event, node) {

});
$(document).on('treeFormAfterReset', function (event, node) {

});
```

Tree Input
-----------
Add `kr0lik\tree\TreeAction` into controller.

Required options:
* treeModelClass - tree model class.

Example: 
```php
<?php
use yii\web\Controller;
use kr0lik\tree\TreeAction;
use app\path\to\YourActiveRecord;

class YourController extends Controller
{
    public function actions()
    {
        return [
            'tree' => [
                'class' => TreeAction::class,
                'treeModelClass' => YourActiveRecord::class,
            ]
        ];
    }
}
```

Add `kr0lik\tree\TreeInput` into view.

Required options:
* pathAction - Url to tree model backend action.

Optional:
* bsVersion: int - Bootstrap version. Default 3.
* treeOptions: array - Container tag options.
* leavesOnly: bool - Select only endpoint nodes. Default: true.
* multiple: bool - Select multiple nodes. Default: false.
* options: array - input options.
* viewPath: string - path to view of input.
* collapse: bool - collapse tree. Default: true.

Example:
```php
<?php
use kr0lik\tree\TreeInput;
?>

<?= $form->field($model, 'field')->widget(TreeInput::class, [
    'pathAction' => 'url/to/YourController/tree/action',
]) ?>
```

Events:
```js
$(document).on('treeInputChange', function (event, selections) {

});
```

Tree Relations Input
-----------
Add `kr0lik\tree\TreeRelationAction` into controller.

Required options:
* treeModelClass - tree model class.
* relationModelClass - tree relaion model class.

Example: 
```php
<?php
use yii\web\Controller;
use kr0lik\tree\TreeRelationAction;
use app\path\to\YourTreeActiveRecord;
use app\path\to\YourRelationActiveRecord;

class YourController extends Controller
{
    public function actions()
    {
        return [
            'tree' => [
                'class' => TreeRelationAction::class,
                'treeModelClass' => YourTreeActiveRecord::class,
                'relationModelClass' => YourRelationActiveRecord::class,
            ]
        ];
    }
}
```

Add `kr0lik\tree\TreeRelationInput` into view.

Required options:
* pathAction - Url to tree model backend action.

Optional:
* bsVersion: int - Bootstrap version. Default 3.
* treeOptions: array - Container tag options.
* leavesOnly: bool - Select only endpoint nodes. Default: true.
* multiple: bool - Select multiple nodes. Default: false.
* options: array - input options.
* viewPath: string - path to view of input.
* collapse: bool - collapse tree. Default: true.

Example:
```php
<?php
use kr0lik\tree\TreeInput;
?>

<?= $form->field($model, 'field')->widget(TreeRelationInput::class, [
    'pathAction' => 'url/to/YourController/tree/action',
]) ?>
```

Events:
```js
$(document).on('treeInputChange', function (event, selections) {

});
```


Internationalization
----------------------
All text and messages introduced in this extension are translatable under category 'kr0lik.tree'.
You may use translations provided within this extension, using following application configuration:

```php
return [
    'components' => [
        'i18n' => [
            'translations' => [
                'kr0lik.tree' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@kr0lik/tree/messages',
                ],
                // ...
            ],
        ],
        // ...
    ],
    // ...
];
```

Global bootstrap version
------------------------
You can specify bootstrap version for tree-manager globaly by adding bsVersion option in yii params (e.g. config/params.php):
```php
'params' => [
    'bsVersion' => 4,
    // other settings
],
// ...
```