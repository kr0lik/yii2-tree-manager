<?php
namespace kr0lik\tree;

use yii\web\AssetBundle;

class TreeManagerAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/assets';
    public $js = ['treeManager.js'];
    public $css = ['treeManager.css'];
    public $depends = [
        FancyTreeAsset::class
    ];
}
