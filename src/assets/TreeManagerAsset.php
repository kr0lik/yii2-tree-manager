<?php
namespace kr0lik\tree\assets;

use yii\web\AssetBundle;
use yii\widgets\ActiveForm;
use yii\widgets\ActiveFormAsset;

class TreeManagerAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/js';
    public $js = ['tree.manager.js'];
    public $depends = [
        TreeAsset::class,
    ];
}
