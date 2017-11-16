<?php
namespace kr0lik\tree;

use yii\widgets\InputWidget;
use yii\helpers\{Html, Json};

class TreeInput extends InputWidget
{
    /**
     * Url to Tree Manager Action
     *
     * @var string
     */
    public $treeOptions = [];

    /**
     * Tree container slid down absolute position
     *
     * @var bool
     */
    public $absolute = true;

    public function init()
    {
        if (! isset($this->treeOptions['pathAction']) || ! $this->treeOptions['pathAction']) {
            throw new ErrorException('PathAction of tree options is required.');
        }

        parent::init();
    }

    public function run()
    {
        if ($this->hasModel()) {
            echo Html::activeHiddenInput($this->model, $this->attribute, $this->options);

            $this->treeOptions['inputId'] = Html::getInputId($this->model, $this->attribute);
            $this->treeOptions['defaultActiveId'] = Html::getAttributeValue($this->model, $this->attribute);
        } else {
            $this->options['id'] = "tree-input-{$this->id}";
            echo Html::hiddenInput($this->name, $this->value, $this->options);

            $this->treeOptions['inputId'] = $this->options['id'];
            $this->treeOptions['defaultActiveId'] =  $this->value;
        }

        $this->treeOptions['useEditForm'] = false;
        $this->treeOptions['dnd'] = false;
        $this->treeOptions['canAddRoot'] = false;

        echo $this->render('input', ['id' => $this->id, 'treeOptions' => $this->treeOptions, 'absolute' => $this->absolute]);

        $this->registerAssets();
    }

    public function registerAssets()
    {
        TreeManagerAsset::register($this->getView());

        $this->getView()->registerJs("$('#{$this->id}').fancyTreeManager(" . Json::encode($this->treeOptions) . ")");
    }
}
