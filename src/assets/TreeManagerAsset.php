<?php
namespace kr0lik\tree\assets;

use yii\web\AssetBundle;

class TreeManagerAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/js';
    public $js = ['tree.manager.js'];
    public $depends = [
        TreeAsset::class,
    ];
}
