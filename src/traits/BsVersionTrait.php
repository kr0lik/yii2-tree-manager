<?php
namespace kr0lik\tree\traits;

use kr0lik\tree\assets\TreeManagerAsset;
use Yii;
use yii\base\InvalidConfigException;
use yii\bootstrap\BootstrapAsset;
use yii\bootstrap4\BootstrapAsset as Bootstrap4Asset;
use yii\helpers\ArrayHelper;

trait BsVersionTrait
{
    /**
     * @var int|null
     */
    public $bsVersion;
    /**
     * @var array<string, string>
     */
    protected $bsCssClasses = [];

    protected static $bsCssMap = [
        'container-class'         => [3 => 'panel',         4 => 'card'],
        'container-header-class'  => [3 => 'panel-heading', 4 => 'card-header'],
        'container-title-class'   => [3 => 'panel-title',   4 => 'card-title'],
        'container-body-class'    => [3 => 'panel-body',    4 => 'card-body'],
        'container-footer-class'  => [3 => 'panel-footer',  4 => 'card-footer'],
        'container-primary-class' => [3 => 'panel-primary', 4 => 'bg-primary text-white'],
        'container-info-class'    => [3 => 'panel-info',    4 => 'bg-info text-white'],
        'container-default-class' => [3 => 'panel-default', 4 => 'bg-light text-white'],
        'btn-default-class'       => [3 => 'btn-default',   4 => 'btn-light'],
    ];

    public function initBsVersion(): void
    {
        if (null === $this->bsVersion) {
            $this->bsVersion = (int) ArrayHelper::getValue(Yii::$app->params, 'bsVersion', 3);
        }

        $this->validateBsVersion();
        $this->prepareBsVersion();
    }

    private function validateBsVersion(): void
    {
        if (null !== $this->bsVersion && !is_int($this->bsVersion)) {
            throw new InvalidConfigException('BsVersion must be integer. Default: 3');
        }

        if (!in_array($this->bsVersion, [3, 4], true)) {
            throw new InvalidConfigException('BsVersion unsupported version. 3 or 4 required.');
        }
    }

    private function prepareBsVersion(): void
    {
        foreach (array_keys(self::$bsCssMap) as $element) {
            $this->bsCssClasses[$element] = static::$bsCssMap[$element][$this->bsVersion];
        }
    }

    private function registerBsAsset(): void
    {
        $asset = 4 === $this->bsVersion ? Bootstrap4Asset::class : BootstrapAsset::class;

        $asset::register($this->getView());
    }
}
