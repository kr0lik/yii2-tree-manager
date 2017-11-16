<?php
namespace kr0lik\tree;

use yii\base\{Widget, ErrorException};
use yii\web\JsExpression;
use yii\helpers\{Url, Json};

class TreeManagerWidget extends Widget
{
    /**
     * Tree Manager options
     *
     * @var array
     */
    public $treeOptions = [];

    public function init()
    {
        if (! isset($this->treeOptions['pathAction']) || ! $this->treeOptions['pathAction']) {
            throw new ErrorException('PathAction of tree options is required.');
        }

        parent::init();
    }

    public function run()
    {
        $this->registerAssets();

        return $this->render('manager', ['id' => $this->id, 'treeOptions' => $this->treeOptions]);
    }

    public function registerAssets()
    {
        TreeManagerAsset::register($this->getView());

        $this->getView()->registerJs("$('#{$this->id}').fancyTreeManager(" . Json::encode($this->treeOptions) . ")");
    }
}
