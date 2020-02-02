<?php
namespace kr0lik\tree;

use kr0lik\tree\assets\TreeInputAsset;
use Yii;
use yii\base\InvalidConfigException;
use yii\helpers\{Html, Json};
use yii\widgets\InputWidget;

class TreeInput extends InputWidget
{
    /**
     * @var array<string, mixed>
     */
    public $treeOptions = [];
    /**
     * @var string
     */
    public $viewPath = 'input';

    /**
     * @throws InvalidConfigException
     */
    public function init(): void
    {
        $this->validate();
        $this->prepare();

        parent::init();
    }

    public function run(): string
    {
        $this->registerAssets();

        if ($this->hasModel()) {
            $inputField = Html::activeHiddenInput($this->model, $this->attribute, $this->options);
        } else {
            $inputField = Html::hiddenInput($this->name, $this->value, $this->options);
        }

        return $this->render($this->viewPath, [
            'id' => $this->id,
            'inputField' => $inputField,
        ]);
    }

    /**
     * @throws InvalidConfigException
     */
    private function validate(): void
    {
        if (!array_key_exists('pathAction', $this->treeOptions) || !$this->treeOptions['pathAction']) {
            throw new InvalidConfigException('PathAction of tree options is required.');
        }
    }

    private function prepare(): void
    {
        $selectId = null;

        if ($this->hasModel()) {
            $selectId = Html::getAttributeValue($this->model, $this->attribute);
        } else {
            $selectId = $this->value;
        }

        if ($selectId && !is_array($selectId)) {
            $selectId = explode(',', $selectId);
        }

        $this->treeOptions['selectId'] = array_map('trim', (array) $selectId);

        if (!array_key_exists('messages', $this->treeOptions)) {
            $this->treeOptions['messages'] = [
                'select' => Yii::t('kr0lik.tree', 'Select...'),
            ];
        }

        $this->options['class'] = 'tree-input-field'.(array_key_exists('class', $this->options) ? ' '.$this->options['class'] : '');
    }

    private function registerAssets(): void
    {
        TreeInputAsset::register($this->getView());

        $this->getView()->registerJs("$.kr0lik.treeInput(" . Json::encode($this->treeOptions) . ", '#{$this->id}')");
    }
}
