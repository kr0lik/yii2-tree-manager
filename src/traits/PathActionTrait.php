<?php
namespace kr0lik\tree\traits;

use yii\base\InvalidConfigException;
use yii\helpers\ArrayHelper;

trait PathActionTrait
{
    /**
     * @var string|null
     */
    public $pathAction;

    public function initPathAction(): void 
    {
        $this->validatePathAction();
    }

    private function validatePathAction(): void
    {
        if (null === $this->pathAction) {
            throw new InvalidConfigException('PathAction of tree options is required.');
        }

        if (!is_string($this->pathAction)) {
            throw new InvalidConfigException('PathAction must be string.');
        }
    }
}
