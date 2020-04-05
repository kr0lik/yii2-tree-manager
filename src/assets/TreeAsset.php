<?php
namespace kr0lik\tree\assets;

use yii\web\AssetBundle;

class TreeAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/js';
    public $js = ['tree.js'];
    public $depends = [
        FancyTreeAsset::class
    ];
}
