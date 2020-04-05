<?php
namespace kr0lik\tree;

use kr0lik\tree\controllers\TreeManagerController;
use kr0lik\tree\enum\TreeActionEnum;
use kr0lik\tree\exception\{TreeActionException, TreeModeException, TreeNotFoundException};
use kr0lik\tree\response\TreeResponse;
use yii\base\InvalidConfigException;

class TreeManagerAction extends TreeAction
{
    /**
     * @var string
     */
    public $formViewPath = '@kr0lik/tree/views/edit.php';
    /**
     * @var string
     */
    private $formNameField = 'name';
    /**
     * @var string[]|callable
     */
    public $formFields = [];
    /**
     * @var string[]|callable
     */
    public $formLinks = [];

    /**
     * @throws InvalidConfigException
     */
    protected function validate(): void 
    {
        parent::validate();

        if (!$this->formViewPath) {
            throw new InvalidConfigException('FormViewPath is required.');
        } elseif (!is_string($this->formViewPath)) {
            throw new InvalidConfigException('FormViewPath must be string.');
        }

        if (!$this->formNameField) {
            throw new InvalidConfigException('FormNameField is required.');
        } elseif (!is_string($this->formNameField)) {
            throw new InvalidConfigException('FormNameField must be string.');
        }

        if (!is_array($this->formFields)) {
            throw new InvalidConfigException('FormFields must be array.');
        }
        if ($this->formFields) {
            foreach ($this->formFields as $field) {
                if (!is_string($field) && !is_callable($field)) {
                    throw new InvalidConfigException('FormFields must be array of string (field name) or callable (function (FormActive $form, Model $model): ActiveField { return $form->field(); }).');
                }
            }
        }

        if (!is_array($this->formLinks)) {
            throw new InvalidConfigException('FormLinks must be array.');
        }
        if ($this->formLinks) {
            foreach ($this->formLinks as $link) {
                if (!is_string($link) && !is_callable($link)) {
                    throw new InvalidConfigException('FormLinks must be array of links (ex: Html::a()) or callable (function (Model $model): string { return Html::a(); }).');
                }
            }
        }
    }

    /**
     * @throws TreeActionException
     * @throws TreeModeException
     * @throws TreeNotFoundException
     */
    protected function runAction(string $action): TreeResponse
    {
        switch ($action) {
            case TreeActionEnum::GET_FORM:
                return $this->getController()->getFormAction(
                    $this->formViewPath,
                    $this->formNameField,
                    $this->formFields,
                    $this->formLinks
                );
            case TreeActionEnum::CREATE:
                return $this->getController()->createAction();
            case TreeActionEnum::UPDATE:
                return $this->getController()->updateAction();
            case TreeActionEnum::DELETE:
                return $this->getController()->deleteAction();
            case TreeActionEnum::MOVE:
                return $this->getController()->moveAction();
            default:
                return parent::runAction($action);
        }
    }

    /**
     * @throws TreeModeException
     */
    private function getController(): TreeManagerController
    {
        $repository = $this->getRepository();
        
        return new TreeManagerController($this->controller, $repository);
    }
}
