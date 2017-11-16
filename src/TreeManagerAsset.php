<?php
namespace kr0lik\tree;

use yii\web\AssetBundle;

class TreeManagerAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/assets';
    public $js = ['fancyTreeManager.js'];
    public $css = ['fancyTreeManager.css'];
    public $depends = [
        FancyTreeAsset::class
    ];
}
