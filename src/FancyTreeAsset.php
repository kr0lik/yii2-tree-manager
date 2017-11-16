<?php
namespace kr0lik\tree;

use yii\web\{AssetBundle, JqueryAsset};
use yii\jui\JuiAsset;
use yii\bootstrap\BootstrapAsset;

class FancyTreeAsset extends AssetBundle
{
    public $sourcePath = '@bower/fancytree/dist';
    public $js = [
        'jquery.fancytree-all.min.js',
    ];
    public $css = [
        'skin-lion/ui.fancytree.min.css',
        'skin-bootstrap/ui.fancytree.min.css',
    ];
    public $depends = [
        JqueryAsset::class,
        JuiAsset::class,
        BootstrapAsset::class
    ];
}
