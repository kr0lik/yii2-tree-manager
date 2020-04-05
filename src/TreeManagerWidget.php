<?php
namespace kr0lik\tree;

use kr0lik\tree\assets\TreeManagerAsset;
use Yii;
use yii\base\{InvalidConfigException, Widget};
use yii\helpers\{ArrayHelper, Json};

class TreeManagerWidget extends Widget
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
    public $viewPath = 'manager';
    /**
     * @var string
     */
    public $pathAction;
    /**
     * @var bool
     */
    public $multipleRoots = false;
    /**
     * @var bool
     */
    public $activeId;
    /**
     * @var bool
     */
    public $dndEnable = true;
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

        return $this->render($this->viewPath, ['options' => $this->treeOptions]);
    }

    /**
     * @throws InvalidConfigException
     */
    private function validate(): void
    {
        if (!$this->pathAction) {
            throw new InvalidConfigException('PathAction of tree options is required.');
        }

        if ($this->activeId && !(is_string($this->activeId) || is_int($this->activeId))) {
            throw new InvalidConfigException('ActiveId must be int or string.');
        }

        if (!is_bool($this->multipleRoots)) {
            throw new InvalidConfigException('MultipleRoots must be boolean.');
        }

        if (!is_bool($this->dndEnable)) {
            throw new InvalidConfigException('DndEnable must be boolean.');
        }
    }

    private function prepare(): void
    {
        $this->treeConfig['pathAction'] = $this->pathAction;
        $this->treeConfig['multipleRoots'] = $this->multipleRoots;
        $this->treeConfig['activeId'] = $this->activeId;
        if (!$this->dndEnable) {
            $this->treeConfig['dnd5'] = null;
        }

        if (!$this->messages) {
            $this->treeConfig['messages'] = [
                'new' => Yii::t('kr0lik.tree', 'New'),
                'notSelected' => Yii::t('kr0lik.tree', 'Not selected'),
                'hasChildren' => Yii::t('kr0lik.tree', 'Section has childrens'),
                'deleteConfirm' => Yii::t('kr0lik.tree', 'Are you sure want to delete "{sectionName}"?'),
                'cantDelete' => Yii::t('kr0lik.tree', 'Cant delete'),
                'unsupportedMode' => Yii::t('kr0lik.tree', 'Mode not supported'),
                'hitNodeNotSaved' => Yii::t('kr0lik.tree', 'Hit section not saved'),
            ];
        } else {
            $this->treeConfig['messages'] = $this->messages;
        }

        $this->treeOptions['id'] = ArrayHelper::getValue($this->treeOptions, 'id', $this->id);
        $this->treeOptions['class'] = ArrayHelper::getValue($this->treeOptions, 'class', 'tree-manager-widget');
    }

    private function registerAssets(): void
    {
        TreeManagerAsset::register($this->getView());

        $this->getView()->registerJs("$.kr0lik.treeManager(" . Json::encode($this->treeConfig) . ", '#{$this->treeOptions['id']}')");
    }
}
