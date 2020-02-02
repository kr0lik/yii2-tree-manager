<?php
namespace kr0lik\tree;

use kr0lik\tree\assets\TreeManagerAsset;
use Yii;
use yii\base\{InvalidConfigException, Widget};
use yii\helpers\{Json};

class TreeManagerWidget extends Widget
{
    /**
     * @var array<string, mixed>
     */
    public $treeOptions = [];
    /**
     * @var string
     */
    public $viewPath = 'manager';

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

        return $this->render($this->viewPath, ['id' => $this->id]);
    }

    /**
     * @throws InvalidConfigException
     */
    private function validate(): void
    {
        if (!array_key_exists('pathAction', $this->treeOptions) || !$this->treeOptions['pathAction']) {
            throw new InvalidConfigException('PathAction of tree options is required.');
        }

        if (
            array_key_exists('activeId', $this->treeOptions) &&
            !(is_string($this->treeOptions['activeId']) || is_int($this->treeOptions['activeId']))
        ) {
            throw new InvalidConfigException('ActiveId must be int or string.');
        }
    }

    private function prepare(): void
    {
        if (!array_key_exists('messages', $this->treeOptions)) {
            $this->treeOptions['messages'] = [
                'new' => Yii::t('kr0lik.tree', 'New'),
                'notSelected' => Yii::t('kr0lik.tree', 'Not selected'),
                'hasChildren' => Yii::t('kr0lik.tree', 'Section has childrens'),
                'deleteConfirm' => Yii::t('kr0lik.tree', 'Are you sure want to delete "{sectionName}"?'),
                'cantDelete' => Yii::t('kr0lik.tree', 'Cant delete'),
                'unsupportedMode' => Yii::t('kr0lik.tree', 'Mode not supported'),
                'hitNodeNotSaved' => Yii::t('kr0lik.tree', 'Hit section not saved'),
            ];
        }
    }

    private function registerAssets(): void
    {
        TreeManagerAsset::register($this->getView());

        $this->getView()->registerJs("$.kr0lik.treeManager(" . Json::encode($this->treeOptions) . ", '#{$this->id}')");
    }
}
