<?php
namespace kr0lik\tree\assets;

use yii\bootstrap\BootstrapAsset;
use yii\jui\JuiAsset;
use yii\web\{AssetBundle, JqueryAsset};

class FancyTreeAsset extends AssetBundle
{
    public $sourcePath = '@bower/fancytree/dist';
    public $js = [
        'jquery.fancytree-all.min.js',
    ];
    public $css = [
        'skin-lion/ui.fancytree.min.css',
    ];
    public $depends = [
        JqueryAsset::class,
        JuiAsset::class,
    ];
}
