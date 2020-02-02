<?php
namespace kr0lik\tree\assets;

use yii\web\AssetBundle;

class TreeInputAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/js';
    public $js = ['tree.input.js'];
    public $depends = [
        TreeAsset::class,
    ];
}
