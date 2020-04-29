<?php
namespace kr0lik\tree\exception;

use kr0lik\tree\exception\TreeException;
use Throwable;
use Yii;
use yii\base\Model;
use yii\helpers\Html;

class TreeValidateException extends TreeException
{
    /**
     * @var Model
     */
    private $model;

    public function __construct(Model $model, $code = 0, Throwable $previous = null)
    {
        $this->model = $model;

        parent::__construct($this->errorsToString(), $code, $previous);
    }

    public function getName(): string
    {
        return Yii::t('kr0lik.tree', 'Validation errors.');
    }

    /**
     * @return array<string, string[]>
     */
    public function getErrors(): array
    {
        return $this->model->getErrors();
    }

    /**
     * @return array<string, string[]>
     */
    public function getValidations(): array
    {
        $result = [];
        foreach ($this->model->getErrors() as $attribute => $errors) {
            $result[Html::getInputId($this->model, $attribute)] = $errors;
        }

        return $result;
    }

    private function errorsToString(): string
    {
        $result = [];

        foreach ($this->model->getErrors() as $attribute => $errors) {
            $message = implode(' ', $errors);

            $result[] = $attribute.': '.$message;
        }

        return implode(' ', $result);
    }
}