<?php
namespace kr0lik\tree;

use kr0lik\tree\assets\TreeManagerAsset;
use kr0lik\tree\traits\BsVersionTrait;
use kr0lik\tree\traits\PathActionTrait;
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
     * @var bool
     */
    public $multipleRoots = false;
    /**
     * @var mixed
     */
    public $activeId;
    /**
     * @var bool
     */
    public $firstRootActivateDefault = true;
    /**
     * @var bool
     */
    public $dndEnable = true;
    /**
     * @var array<string, string>
     */
    public $messages = [];
    /**
     * @var string[]
     */
    public $buttons = [];

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
        $this->registerAssets();

        return $this->render($this->viewPath, [
            'options' => $this->treeOptions,
            'buttons' => $this->buttons,
            'bsCssClasses' => $this->bsCssClasses, // From BsVersionTrait
        ]);
    }

    /**
     * @throws InvalidConfigException
     */
    private function validate(): void
    {
        if ($this->activeId && !(is_string($this->activeId) || is_int($this->activeId))) {
            throw new InvalidConfigException('ActiveId must be int or string.');
        }

        if (!is_bool($this->multipleRoots)) {
            throw new InvalidConfigException('MultipleRoots must be boolean.');
        }

        if (!is_bool($this->dndEnable)) {
            throw new InvalidConfigException('DndEnable must be boolean.');
        }

        if (!is_bool($this->firstRootActivateDefault)) {
            throw new InvalidConfigException('FirstRootActivateDefault must be boolean.');
        }

        if (!is_array($this->buttons)) {
            throw new InvalidConfigException('Buttons must be array of string.');
        }
    }

    private function prepare(): void
    {
        $this->treeConfig['pathAction'] = $this->pathAction;
        $this->treeConfig['multipleRoots'] = $this->multipleRoots;
        $this->treeConfig['activeId'] = $this->activeId;
        $this->treeConfig['firstRootActivateDefault'] = $this->firstRootActivateDefault;
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
                'loading' => Yii::t('kr0lik.tree', 'Loading'),
                'loadError' => Yii::t('kr0lik.tree', 'Load error'),
                'noData' => Yii::t('kr0lik.tree', 'No data'),
            ];
        } else {
            $this->treeConfig['messages'] = $this->messages;
        }

        $this->treeOptions['id'] = ArrayHelper::getValue($this->treeOptions, 'id', $this->id);
        $this->treeOptions['class'] = ArrayHelper::getValue($this->treeOptions, 'class', 'tree-manager-widget');
    }

    private function registerAssets(): void
    {
        $this->registerBsAsset();

        TreeManagerAsset::register($this->getView());

        $this->getView()
            ->registerJs(
                sprintf('new kr0lik.treeManager.create("%s", %s);', $this->treeOptions['id'], Json::encode($this->treeConfig))
            );
    }
}
