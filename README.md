# yii2-tree-manager
Yii2 tree manager using fancytree library.

This extension can add/delete/move branches of tree and quick edit branch firlds(like name, description, body).


Installation
------------

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

Description
-----
Extension will install(if not installed) fancytree library, jquery, jqueryui and bootstrap.

To work with extension, you can use traits from [kr0lik/yii2-ltree](https://github.com/kr0lik/yii2-ltree) or write your own with similar methods(Required methods in ActveRecord: getTree, after, before, append, prepend, delete, isRoot, level).

Required fileds in model: id, name.

Usage
-----

Will add later
