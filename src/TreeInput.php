<?php
namespace kr0lik\tree;

use kr0lik\tree\assets\TreeInputAsset;
use Yii;
use yii\base\InvalidConfigException;
use yii\helpers\{ArrayHelper, Html, Json};
use yii\widgets\InputWidget;

class TreeInput extends InputWidget
{
    /**
     * @var array<string, mixed>
     */
    private $treeConfig = [];
    /**
     * @var array<string, mixed>
     */
    public $treeOptions = [];
    /**
     * @var string
     */
    public $viewPath = 'input';
    /**
     * @var string
     */
    public $pathAction;
    /**
     * @var bool
     */
    public $leavesOnly = true;
    /**
     * @var bool
     */
    public $multiple = false;
    /**
     * @var array<string, string>
     */
    public $messages = [];

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

        if ($this->multiple) {
            $inputField = $this->getSelectField();
        } else {
            $inputField = $this->getInpurField();
        }

        return $this->render($this->viewPath, [
            'options' => $this->treeOptions,
            'inputField' => $inputField,
        ]);
    }

    private function getInpurField(): string
    {
        if ($this->hasModel()) {
            return Html::activeHiddenInput($this->model, $this->attribute, $this->options);
        }

        return Html::hiddenInput($this->name, $this->value, $this->options);
    }

    private function getSelectField(): string
    {
        $style = ArrayHelper::getValue($this->options, 'style', '');
        $this->options['style'] = 'display: none;'.($style ? " $style" : '');
        $this->options['multiple'] = 'multiple';

        if ($this->hasModel()) {
            return Html::activeListBox($this->model, $this->attribute, $this->getSelectId(), $this->options);
        }

        return Html::listBox($this->name, $this->getSelectId(), $this->value, $this->options);
    }

    /**
     * @throws InvalidConfigException
     */
    private function validate(): void
    {
        if (!$this->pathAction) {
            throw new InvalidConfigException('PathAction of tree options is required.');
        }

        if (!is_bool($this->leavesOnly)) {
            throw new InvalidConfigException('LeavesOnly must be boolean.');
        }

        if (!is_bool($this->multiple)) {
            throw new InvalidConfigException('Multiple must be boolean.');
        }
    }

    private function prepare(): void
    {
        $this->treeConfig['pathAction'] = $this->pathAction;
        $this->treeConfig['selectId'] = $this->getSelectId();
        $this->treeConfig['leavesOnly'] = $this->leavesOnly;
        $this->treeConfig['multiple'] = $this->multiple;
        if (!$this->messages) {
            $this->treeConfig['messages'] = [
                'select' => Yii::t('kr0lik.tree', 'Select'),
                'loading' => Yii::t('kr0lik.tree', 'Loading'),
                'loadError' => Yii::t('kr0lik.tree', 'Load error'),
                'noData' => Yii::t('kr0lik.tree', 'No data'),
            ];
        } else {
            $this->treeConfig['messages'] = $this->messages;
        }

        $this->treeOptions['id'] = ArrayHelper::getValue($this->treeOptions, 'id', $this->id);
        $this->treeOptions['class'] = ArrayHelper::getValue($this->treeOptions, 'class', 'tree-input-widget');

        $this->options['class'] = trim(ArrayHelper::getValue($this->options, 'class', '').' tree-input-field');
    }

    private function registerAssets(): void
    {
        TreeInputAsset::register($this->getView());

        $this->getView()->registerJs("$.kr0lik.treeInput(" . Json::encode($this->treeConfig) . ", '#{$this->treeOptions['id']}')");
    }

    /**
     * @return string[]
     */
    private function getSelectId(): array
    {
        $selectId = null;

        if ($this->hasModel() && !$this->value) {
            $selectId = Html::getAttributeValue($this->model, $this->attribute);
        } else {
            $selectId = $this->value;
        }

        if ($selectId && !is_array($selectId)) {
            $selectId = explode(',', $selectId);
        }

        return array_map('trim', (array) $selectId);
    }
}
