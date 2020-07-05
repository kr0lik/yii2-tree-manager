<?php
namespace kr0lik\tree;

use kr0lik\tree\assets\TreeInputAsset;
use kr0lik\tree\traits\BsVersionTrait;
use kr0lik\tree\traits\PathActionTrait;
use Yii;
use yii\base\InvalidConfigException;
use yii\helpers\{ArrayHelper, Html, Json};
use yii\widgets\InputWidget;

class TreeInput extends InputWidget
{
    /**
     * @var array<string, mixed>
     */
    protected $treeConfig = [];
    /**
     * @var array<string, mixed>
     */
    public $treeOptions = [];
    /**
     * @var string
     */
    public $viewPath = 'input';
    /**
     * @var bool
     */
    public $leavesOnly = true;
    /**
     * @var bool
     */
    public $multiple = false;
    /**
     * @var bool
     */
    public $collapse = true;
    /**
     * @var array<string, string>
     */
    public $messages = [];
    
    use PathActionTrait, BsVersionTrait;

    /**
     * @throws InvalidConfigException
     */
    public function init(): void
    {
        $this->initPathAction();
        $this->initBsVersion();

        $this->validate();
        $this->prepare();

        parent::init();
    }

    public function run(): string
    {
        $this->registerBsAsset();
        $this->registerAssets();

        return $this->render($this->viewPath, [
            'options' => $this->treeOptions,
            'inputField' => $this->getSelectField(),
            'collapse' => $this->collapse,
            'bsCssClasses' => $this->bsCssClasses, // From BsVersionTrait
        ]);
    }

    private function getSelectField(): string
    {
        $style = ArrayHelper::getValue($this->options, 'style', '');
        $this->options['style'] = 'display: none;'.($style ? " $style" : '');
        if ($this->multiple) $this->options['multiple'] = 'multiple';

        $items = array_combine($this->getSelectId(), $this->getSelectId());

        if ($this->hasModel()) {
            return Html::activeListBox($this->model, $this->attribute, $items, $this->options);
        }

        return Html::listBox($this->name, $this->getSelectId(), $items, $this->options);
    }

    /**
     * @throws InvalidConfigException
     */
    private function validate(): void
    {
        if (!is_bool($this->leavesOnly)) {
            throw new InvalidConfigException('LeavesOnly must be boolean.');
        }

        if (!is_bool($this->multiple)) {
            throw new InvalidConfigException('Multiple must be boolean.');
        }

        if (!is_bool($this->collapse)) {
            throw new InvalidConfigException('Collapse must be boolean.');
        }

        if ($this->multiple && $this->value && !is_array($this->value)) {
            throw new InvalidConfigException('Value must be array for multiple input.');
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

    protected function registerAssets(): void
    {
        TreeInputAsset::register($this->getView());

        $this->getView()
            ->registerJs(
                sprintf('new kr0lik.treeInput.run("%s", %s);', $this->treeOptions['id'], Json::encode($this->treeConfig))
            );
    }

    /**
     * @return string[]
     */
    private function getSelectId(): array
    {
        $selectId = null;

        if ($this->hasModel() && !$this->value) {
            $selectId = Html::getAttributeValue($this->model, $this->attribute);

            if ($selectId && !is_array($selectId)) {
                $selectId = explode(',', $selectId);
            }
        } else {
            $selectId = $this->value;
        }

        return array_map('trim', (array) $selectId);
    }
}
